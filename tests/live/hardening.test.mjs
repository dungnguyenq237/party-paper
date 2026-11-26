import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {DatabaseSync} from 'node:sqlite';
import {RoomStore} from '../../.build/server/platform/server/store.js';
import {LIMITS} from '../../.build/server/contracts/protocol.js';
const fixture=t=>{const dir=mkdtempSync(join(tmpdir(),'party-hardening-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));return join(dir,'room.db');};
const guest=store=>store.session(store.bootstrap(null).raw);
function room(store,nonce='one'){
 const h=guest(store),g=guest(store),r=store.create(h,'Host',nonce);store.join(g,r.code,'Guest');
 const a=store.attach(h,store.ticket(h,r.roomId)),b=store.attach(g,store.ticket(g,r.roomId));return {r,a,b,h,g};
}
function command(store,p,action,id){const v=store.view(p);return {v:1,type:'command',matchId:v.matchId,phaseId:v.phaseId,seenRev:v.rev,commandId:id,action};}
function act(store,p,action,id){return store.command(p,command(store,p,action,id));}
function start(store,x){for(const p of [x.a,x.b])assert.equal(act(store,p,{kind:'ready',ready:true},'ready').type,'ack');assert.equal(act(store,x.a,{kind:'start',expectedRev:store.view(x.a).rev},'start').type,'ack');}
test('unsupported or corrupted persistent snapshot fails closed on startup',t=>{
 const file=fixture(t);let store=new RoomStore(file);const x=room(store);store.close();
 const db=new DatabaseSync(file);const row=db.prepare('SELECT state FROM rooms WHERE id=?').get(x.r.roomId);const state=JSON.parse(row.state);
 state.seats[0].session='not-a-session';db.prepare('UPDATE rooms SET state=? WHERE id=?').run(JSON.stringify(state),x.r.roomId);db.close();
 assert.throws(()=>new RoomStore(file),/Unsupported room snapshot/);
 const reset=new RoomStore(file,Date.now,true);assert.throws(()=>reset.ticket(x.h,x.r.roomId),/FORBIDDEN/);reset.close();
});
test('unknown database version fails closed',t=>{
 const file=fixture(t);const db=new DatabaseSync(file);db.exec('PRAGMA user_version=99');db.close();assert.throws(()=>new RoomStore(file),/Unsupported database version/);
});
test('single writer lock excludes a second live store',t=>{
 const file=fixture(t);const store=new RoomStore(file);t.after(()=>store.close());room(store);assert.throws(()=>new RoomStore(file),/locked|busy/i);
});
test('exact deadline, bounded recovery window and session expiry',t=>{
 const file=fixture(t);let now=100000;let store=new RoomStore(file,()=>now);t.after(()=>store.close());
 const x=room(store);start(store,x);const c=command(store,x.a,{kind:'choose',choice:'amber'},'late');now+=45000;assert.equal(store.command(x.a,c).code,'PHASE_CLOSED');
 const y=room(store,'two');start(store,y);store.close();store=new RoomStore(file,()=>now);
 const a=store.attach(y.h,store.ticket(y.h,y.r.roomId));const first=store.view(a).deadlineAt;now+=10000;store.close();store=new RoomStore(file,()=>now);
 const b=store.attach(y.h,store.ticket(y.h,y.r.roomId));assert.equal(store.view(b).deadlineAt,first);
 now=first;store.tick();assert.equal(store.view(b).status,'abandoned');
 now+=LIMITS.sessionMs;store.tick();assert.throws(()=>store.ticket(y.h,y.r.roomId),/FORBIDDEN/);
});
test('abrupt process death preserves committed receipt on intact disk',async t=>{
 const file=fixture(t);const script=join(file,'..','worker.mjs');
 const uri=new URL('../../.build/server/platform/server/store.js',import.meta.url).href;
 writeFileSync(script,'import {RoomStore} from '+JSON.stringify(uri)+';\nconst s=new RoomStore(process.argv[2]);\nprocess.on("message",({op,args,id})=>{try{process.send({id,value:s[op](...args)})}catch{process.send({id,error:true})}});\n');
 const cp=spawn(process.execPath,[script,file],{stdio:['ignore','ignore','inherit','ipc']});
 t.after(()=>{if(cp.exitCode===null&&cp.signalCode===null)cp.kill('SIGKILL');});
 let i=0;const call=(op,...args)=>new Promise((resolve,reject)=>{const id=++i;const timer=setTimeout(()=>{cp.off('message',on);reject(Error('child timeout'));},5000);function on(m){if(m.id!==id)return;clearTimeout(timer);cp.off('message',on);m.error?reject(Error('worker operation failed')):resolve(m.value);}cp.on('message',on);cp.send({op,args,id});});
 const h=await call('session',(await call('bootstrap',null)).raw),g=await call('session',(await call('bootstrap',null)).raw);const r=await call('create',h,'Host','crash');await call('join',g,r.code,'Guest');
 const a=await call('attach',h,await call('ticket',h,r.roomId)),b=await call('attach',g,await call('ticket',g,r.roomId));
 const frame=async(p,action,id)=>{const v=await call('view',p);return {v:1,type:'command',matchId:v.matchId,phaseId:v.phaseId,seenRev:v.rev,commandId:id,action};};
 for(const p of [a,b])assert.equal((await call('command',p,await frame(p,{kind:'ready',ready:true},'ready'))).type,'ack');
 assert.equal((await call('command',a,await frame(a,{kind:'start',expectedRev:(await call('view',a)).rev},'start'))).type,'ack');
 const c=await frame(a,{kind:'choose',choice:'amber'},'commit-before-crash');const ack=await call('command',a,c);assert.equal(ack.type,'ack');
 const exited=once(cp,'exit');cp.kill('SIGKILL');await exited;
 const recovered=new RoomStore(file);t.after(()=>recovered.close());const aa=recovered.attach(h,recovered.ticket(h,r.roomId));recovered.attach(g,recovered.ticket(g,r.roomId));assert.equal(recovered.view(aa).self.choice,'amber');assert.deepEqual(recovered.command(aa,c),ack);
});
test('bounded simultaneous room workload and isolated projections',t=>{
 const store=new RoomStore(':memory:');t.after(()=>store.close());const started=performance.now();
 const rooms=Array.from({length:LIMITS.rooms},(_,i)=>room(store,'r'+i));for(const x of rooms)start(store,x);
 for(const x of rooms){assert.equal(act(store,x.a,{kind:'choose',choice:'amber'},'v1').type,'ack');assert.equal(store.view(x.b).self.choice,null);assert.equal(act(store,x.b,{kind:'choose',choice:'violet'},'v2').type,'ack');assert.deepEqual(store.view(x.a).result,{amber:1,violet:1,reason:'completed'});}
 assert.throws(()=>store.create(guest(store),'Overflow','overflow'),/FULL/);
 console.log('[bounded store workload]',JSON.stringify({rooms:rooms.length,seats:rooms.length*2,elapsedMs:Math.round(performance.now()-started),rssBytes:process.memoryUsage().rss}));
});
