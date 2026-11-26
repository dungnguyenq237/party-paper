import test from 'node:test';
import assert from 'node:assert/strict';
import {WebSocket} from 'ws';
import {startRoomServer} from '../../scripts/room-server.mjs';
test('real HTTP + WebSocket guest sessions, sealed choices, reconnect and origin denial',async t=>{
 const app=await startRoomServer();t.after(()=>app.close());
 async function post(path,data,headers={}){const r=await fetch(app.origin+path,{method:'POST',headers:{origin:app.origin,'content-type':'application/json',...headers},body:JSON.stringify(data)});return {r,body:await r.json()};}
 assert.equal((await post('/api/session',{}, {origin:'https://wrong.invalid'})).r.status,403);
 async function session(){const {r,body}=await post('/api/session',{});assert.equal(r.status,200);return {cookie:r.headers.get('set-cookie').split(';')[0],'x-csrf-token':body.csrf};}
 const host=await session(),guest=await session();
 const created=await post('/api/rooms',{alias:'Host',nonce:'c1'},host);assert.equal(created.r.status,200);
 const room=created.body;assert.equal((await post('/api/join',{alias:'Guest',code:room.code},guest)).r.status,200);
 assert.equal((await post('/api/rooms',{alias:'X',nonce:'x'},{cookie:host.cookie})).r.status,403);
 async function connect(headers){
   const {body}=await post('/api/rooms/'+room.roomId+'/socket-ticket',{},headers);const ws=new WebSocket(app.origin.replace('http','ws')+'/ws',{headers:{origin:app.origin,cookie:headers.cookie}});const frames=[];let wake;
   ws.on('message',x=>{frames.push(JSON.parse(x.toString()));wake?.();});ws.on('error',()=>{});
   await new Promise((ok,no)=>{ws.once('open',ok);ws.once('error',no);});ws.send(JSON.stringify({v:1,type:'hello',ticket:body.ticket}));
   async function wait(fn){const until=Date.now()+5000;while(Date.now()<until){const found=frames.find(fn);if(found)return found;await new Promise(ok=>{wake=ok;setTimeout(ok,25);});}throw Error('frame timeout '+JSON.stringify(frames));}
   const latest=()=>frames.filter(x=>x.type==='snapshot').at(-1);
   return {ws,frames,wait,latest,async command(action,id){const v=latest();const c={v:1,type:'command',matchId:v.matchId,phaseId:v.phaseId,seenRev:v.rev,commandId:id,action};ws.send(JSON.stringify(c));return wait(x=>x.commandId===id&&(x.type==='ack'||x.type==='error'));}};
 }
 const a=await connect(host),b=await connect(guest);await a.wait(x=>x.type==='snapshot'&&x.seats.filter(y=>y.connected).length===2);
 await b.wait(x=>x.type==='snapshot');assert.equal((await a.command({kind:'ready',ready:true},'a-ready')).type,'ack');assert.equal((await b.command({kind:'ready',ready:true},'b-ready')).type,'ack');
 await a.wait(x=>x.type==='snapshot'&&x.seats.every(y=>y.ready));
 assert.equal((await a.command({kind:'start',expectedRev:a.latest().rev},'start')).type,'ack');
 await a.wait(x=>x.type==='snapshot'&&x.status==='active');await b.wait(x=>x.type==='snapshot'&&x.status==='active');
 assert.equal((await a.command({kind:'choose',choice:'amber'},'vote')).type,'ack');
 const privateView=await b.wait(x=>x.type==='snapshot'&&x.submittedCount===1);assert.equal(privateView.self.choice,null);
 const replacement=await connect(host);const recovered=await replacement.wait(x=>x.type==='snapshot');assert.equal(recovered.self.choice,'amber');
 assert.equal((await b.command({kind:'choose',choice:'violet'},'vote-b')).type,'ack');
 const end=await replacement.wait(x=>x.type==='snapshot'&&x.status==='results');assert.equal(end.result.amber,1);assert.equal(end.result.violet,1);
 replacement.ws.close();b.ws.close();
});
