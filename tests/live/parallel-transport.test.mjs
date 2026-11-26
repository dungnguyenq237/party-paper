import test from 'node:test';
import assert from 'node:assert/strict';
import {WebSocket} from 'ws';
import {startRoomServer} from '../../scripts/room-server.mjs';

test('eight concurrent real rooms isolate votes and contention, measure outgoing bytes',async t=>{
 const app=await startRoomServer();t.after(()=>app.close());const began=performance.now();
 async function post(route,data,headers={}){
  const r=await fetch(app.origin+route,{method:'POST',headers:{origin:app.origin,'content-type':'application/json',...headers},body:JSON.stringify(data)});
  assert.equal(r.status,200,route);return {data:await r.json(),cookie:r.headers.get('set-cookie')};
 }
 async function guest(){const r=await post('/api/session',{});return {cookie:r.cookie.split(';')[0],'x-csrf-token':r.data.csrf};}
 async function socket(headers,roomId){
  const {data}=await post('/api/rooms/'+roomId+'/socket-ticket',{},headers);
  const ws=new WebSocket(app.origin.replace('http','ws')+'/ws',{headers:{origin:app.origin,cookie:headers.cookie}});const frames=[];
  ws.on('message',raw=>frames.push(JSON.parse(raw.toString())));ws.on('error',()=>{});
  await new Promise((ok,no)=>{ws.once('open',ok);ws.once('error',no);});ws.send(JSON.stringify({v:1,type:'hello',ticket:data.ticket}));
  const wait=async fn=>{const deadline=Date.now()+6000;while(Date.now()<deadline){const f=frames.find(fn);if(f)return f;await new Promise(ok=>setTimeout(ok,10));}throw Error('fixture timeout');};
  await wait(f=>f.type==='snapshot');
  const latest=()=>frames.filter(f=>f.type==='snapshot').at(-1);
  const send=async(action,id)=>{const v=latest();ws.send(JSON.stringify({v:1,type:'command',matchId:v.matchId,phaseId:v.phaseId,seenRev:v.rev,commandId:id,action}));return wait(f=>f.commandId===id&&f.type!=='snapshot');};
  return {ws,wait,send,latest};
 }
 const ids=new Set();
 await Promise.all(Array.from({length:8},async(_,i)=>{
  const [h,g]=await Promise.all([guest(),guest()]);const {data:r}=await post('/api/rooms',{alias:'Host '+i,nonce:'room'+i},h);ids.add(r.roomId);await post('/api/join',{alias:'Guest '+i,code:r.code},g);
  const a=await socket(h,r.roomId),b=await socket(g,r.roomId);
  await a.wait(f=>f.type==='snapshot'&&f.seats.every(s=>s.connected));
  const ready=await Promise.all([a.send({kind:'ready',ready:true},'a-ready'),b.send({kind:'ready',ready:true},'b-ready')]);assert.ok(ready.every(x=>x.type==='ack'));
  await a.wait(f=>f.type==='snapshot'&&f.seats.every(s=>s.ready));assert.equal((await a.send({kind:'start',expectedRev:a.latest().rev},'start')).type,'ack');
  await Promise.all([a,b].map(x=>x.wait(f=>f.type==='snapshot'&&f.status==='active')));
  const claims=await Promise.all([a.send({kind:'claim',itemVersion:0},'claim-a'),b.send({kind:'claim',itemVersion:0},'claim-b')]);
  assert.equal(claims.filter(x=>x.type==='ack').length,1);assert.equal(claims.filter(x=>x.code==='CONFLICT').length,1);
  const av=i%2?'violet':'amber';assert.equal((await a.send({kind:'choose',choice:av},'vote-a')).type,'ack');
  const privateView=await b.wait(f=>f.type==='snapshot'&&f.submittedCount===1);assert.equal(privateView.roomId,r.roomId);assert.equal(privateView.self.choice,null);
  assert.equal((await b.send({kind:'choose',choice:av},'vote-b')).type,'ack');
  const final=await a.wait(f=>f.type==='snapshot'&&f.status==='results');assert.equal(final.roomId,r.roomId);assert.equal(final.result[av],2);
  a.ws.close();b.ws.close();
 }));
 assert.equal(ids.size,8);const m=app.metrics();assert.ok(m.sentBytes>0&&m.sentFrames>0);
 console.log('[parallel transport workload]',JSON.stringify({rooms:8,seats:16,elapsedMs:Math.round(performance.now()-began),...m}));
});
