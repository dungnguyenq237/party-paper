// Local F3 transport. Public Internet, TLS, and commercial deployments are NOT enabled.
import { createServer } from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { RoomStore } from '../.build/server/platform/server/store.js';
import { LIMITS, ProtocolError, decodeClientFrame, object, alias, code, identifier, fail } from '../.build/server/contracts/protocol.js';

const COOKIE='party_local';
const clientFiles=new Map([
  ['/local-room/', ['../review/local-room/index.html','text/html; charset=utf-8']],
  ['/client/platform/client/index.js',['../.build/client/platform/client/index.js','text/javascript; charset=utf-8']],
  ['/client/platform/client/room-client.js',['../.build/client/platform/client/room-client.js','text/javascript; charset=utf-8']],
  ['/client/contracts/protocol.js',['../.build/client/contracts/protocol.js','text/javascript; charset=utf-8']]
]);
const getCookie=req=>{const matches=(req.headers.cookie??'').split(';').map(x=>x.trim()).filter(x=>x.startsWith(COOKIE+'='));return matches.length===1?matches[0].slice(COOKIE.length+1):null;};
function sendJson(res,status,value){
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));
}
async function body(req){
  if(req.headers['content-type']!=='application/json')fail();
  let length=0;const chunks=[];
  for await(const chunk of req){length+=chunk.length;if(length>LIMITS.frameBytes)fail();chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{fail();}
}
const safeCode=e=>e instanceof ProtocolError?e.code:'UNAVAILABLE';
const error=(code,commandId=null)=>({v:1,type:'error',code,commandId});

export async function startRoomServer({port=0,path=':memory:',now=Date.now,resetTransient=false}={}){
  const store=new RoomStore(path,now,resetTransient);
  const wss=new WebSocketServer({noServer:true,maxPayload:LIMITS.frameBytes,perMessageDeflate:false,clientTracking:true});
  const sockets=new Map();const burst={at:Date.now(),count:0};let origin='';
  let closing=false;
  function permitted(req){return req.headers.host===new URL(origin).host&&req.headers.origin===origin;}
  let sentBytes=0,sentFrames=0;
  function send(ws,value){if(ws.readyState!==WebSocket.OPEN)return;const encoded=JSON.stringify(value);if(ws.bufferedAmount+Buffer.byteLength(encoded)>65536){ws.terminate();return;}sentBytes+=Buffer.byteLength(encoded);sentFrames++;ws.send(encoded);}
  function publish(roomId=null){
    for(const [ws,s] of sockets){
      if(!s.principal||(roomId&&s.principal.roomId!==roomId))continue;
      try{const v=store.view(s.principal);if(v.rev!==s.rev){s.rev=v.rev;send(ws,v);}}
      catch(e){send(ws,error(safeCode(e)));ws.close(1008,'Membership unavailable');}
    }
  }
  const server=createServer({maxHeaderSize:8192,requestTimeout:5000,headersTimeout:5000},async(req,res)=>{
    try{
      if(closing)fail('UNAVAILABLE');
      if(req.method==='GET'&&req.url==='/health'&&req.headers.host===new URL(origin).host){sendJson(res,200,{status:'ok',fixture:true});return;}
      if(req.method==='GET'&&req.headers.host===new URL(origin).host&&clientFiles.has(req.url)){
        const [relative,type]=clientFiles.get(req.url);const data=readFileSync(new URL(relative,import.meta.url));
        res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(data);return;
      }
      if(req.method!=='POST'||!permitted(req))fail('FORBIDDEN');
      const t=Date.now();if(t-burst.at>=60000){burst.at=t;burst.count=0;}if(++burst.count>600)fail('RATE_LIMITED');
      const raw=getCookie(req);const data=await body(req);
      if(req.url==='/api/session'){
        object(data,[]);const s=store.bootstrap(raw);
        res.setHeader('Set-Cookie',COOKIE+'='+s.raw+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400');
        sendJson(res,200,{csrf:s.csrf});return;
      }
      const session=store.session(raw);
      if(!session||!raw||!store.csrf(raw,req.headers['x-csrf-token']))fail('FORBIDDEN');
      if(req.url==='/api/rooms'){
        const o=object(data,['alias','nonce']);const view=store.create(session,alias(o.alias),identifier(o.nonce));sendJson(res,200,view);return;
      }
      if(req.url==='/api/join'){
        const o=object(data,['alias','code']);const view=store.join(session,code(o.code),alias(o.alias));sendJson(res,200,view);publish(view.roomId);return;
      }
      const match=/^\/api\/rooms\/([A-Za-z0-9_-]{1,96})\/socket-ticket$/.exec(req.url??'');
      if(match){object(data,[]);sendJson(res,200,{ticket:store.ticket(session,match[1])});return;}
      sendJson(res,404,error('UNAVAILABLE'));
    }catch(e){const c=safeCode(e);if(!res.headersSent)sendJson(res,c==='FORBIDDEN'?403:c==='RATE_LIMITED'?429:c==='UNAVAILABLE'?503:400,error(c));else res.destroy();}
  });
  server.maxConnections=128;
  server.on('upgrade',(req,socket,head)=>{
    const session=store.session(getCookie(req));
    if(closing||req.url!=='/ws'||!permitted(req)||!session||sockets.size>=128){socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');return;}
    wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,session));
  });
  wss.on('connection',(ws,session)=>{
    const state={principal:null,rev:-1,alive:true,at:Date.now(),count:0};
    sockets.set(ws,state);
    const timer=setTimeout(()=>{if(!state.principal)ws.close(1008,'Hello required');},5000);
    ws.on('error',()=>ws.terminate());
    ws.on('pong',()=>{state.alive=true;});
    ws.on('message',(raw,binary)=>{
      let frame;
      try{
        const t=Date.now();if(t-state.at>=1000){state.at=t;state.count=0;}
        if(++state.count>20)fail('RATE_LIMITED');
        if(binary)fail();let input;try{input=JSON.parse(raw.toString());}catch{fail();}
        frame=decodeClientFrame(input);
        if(!state.principal){
          if(frame.type!=='hello')fail('FORBIDDEN');
          const p=store.attach(session,frame.ticket);state.principal=p;clearTimeout(timer);
          for(const [other,s] of sockets){if(other!==ws&&s.principal?.roomId===p.roomId&&s.principal?.session===p.session)other.close(1008,'Replaced');}
          publish(p.roomId);return;
        }
        if(frame.type==='hello')fail();
        if(frame.type==='resync'){const v=store.view(state.principal);state.rev=v.rev;send(ws,v);return;}
        const ack=store.command(state.principal,frame);send(ws,ack);publish(state.principal.roomId);
      }catch(e){const c=safeCode(e);send(ws,error(c,frame?.type==='command'?frame.commandId:null));if(c==='FORBIDDEN'||c==='RATE_LIMITED'||c==='UNAVAILABLE'||!state.principal)ws.close(1008,'Rejected');}
    });
    ws.on('close',()=>{clearTimeout(timer);sockets.delete(ws);if(state.principal&&!closing){try{store.detach(state.principal);publish(state.principal.roomId);}catch{/* no private diagnostics */}}});
  });
  await new Promise((ok,no)=>{server.once('error',no);server.listen(port,'127.0.0.1',()=>{server.off('error',no);ok();});});
  origin='http://127.0.0.1:'+server.address().port;
  const tick=setInterval(()=>{try{store.tick();publish();}catch{for(const ws of sockets.keys())ws.terminate();}},250);
  const heartbeat=setInterval(()=>{for(const [ws,s] of sockets){if(!s.alive){ws.terminate();continue;}s.alive=false;ws.ping();}},LIMITS.heartbeatMs);
  return {origin,store,metrics:()=>({sentBytes,sentFrames,connections:sockets.size}),async close(){if(closing)return;closing=true;clearInterval(tick);clearInterval(heartbeat);for(const ws of sockets.keys())ws.terminate();await new Promise(ok=>wss.close(ok));await new Promise(ok=>server.close(ok));store.close();}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const path=resolve('data/local-rooms.sqlite');mkdirSync(dirname(path),{recursive:true});
  const app=await startRoomServer({port:8766,path,resetTransient:process.argv.includes('--discard-transient')});
  console.log('[local fixture] '+app.origin+' /health; no public hosting');
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await app.close();process.exit(0);});
}
