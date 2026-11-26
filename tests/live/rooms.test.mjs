import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {RoomStore} from '../../.build/server/platform/server/store.js';
function setup(t){
  let time=100000;const dir=mkdtempSync(join(tmpdir(),'party-rooms-'));const path=join(dir,'rooms.sqlite');let store=new RoomStore(path,()=>time);
  t.after(()=>{store.close();rmSync(dir,{recursive:true,force:true});});
  const guest=()=>{const raw=store.bootstrap(null).raw;return {raw,session:store.session(raw)};};
  const h=guest(),g=guest();const room=store.create(h.session,'Host','nonce1');store.join(g.session,room.code,'Guest');
  const attach=x=>store.attach(x.session,store.ticket(x.session,room.roomId));
  let host=attach(h),guestSeat=attach(g);
  const cmd=(p,action,id='c'+Math.random().toString(36).slice(2))=>{const v=store.view(p);return {v:1,type:'command',matchId:v.matchId,phaseId:v.phaseId,seenRev:v.rev,commandId:id,action};};
  const act=(p,action,id)=>store.command(p,cmd(p,action,id));
  const begin=()=>{assert.equal(act(host,{kind:'ready',ready:true}).type,'ack');assert.equal(act(guestSeat,{kind:'ready',ready:true}).type,'ack');assert.equal(act(host,{kind:'start',expectedRev:store.view(host).rev}).type,'ack');};
  return {h,g,room,attach,cmd,act,begin,get store(){return store},get host(){return host},get guest(){return guestSeat},advance(n){time+=n;},restart(discard=false){store.close();store=new RoomStore(path,()=>time,discard);},reconnect(){host=attach(h);guestSeat=attach(g);}};
}
test('atomic independent ballots, private projection, exact duplicate and contention',t=>{
 const s=setup(t);s.begin();const a=s.cmd(s.host,{kind:'choose',choice:'amber'},'vote1');const receipt=s.store.command(s.host,a);assert.equal(receipt.type,'ack');
 assert.deepEqual(s.store.command(s.host,{...a,seenRev:a.seenRev+1}),receipt);assert.equal(s.store.command(s.host,{...a,action:{kind:'choose',choice:'violet'}}).code,'CONFLICT');
 const v=s.store.view(s.guest);assert.equal(v.self.choice,null);assert.equal(v.submittedCount,1);assert.equal(JSON.stringify(v).includes('privateSeed'),false);
 const c=s.cmd(s.host,{kind:'claim',itemVersion:0});const d=s.cmd(s.guest,{kind:'claim',itemVersion:0});
 assert.equal(s.store.command(s.host,c).type,'ack');assert.equal(s.store.command(s.guest,d).code,'CONFLICT');
 assert.equal(s.act(s.guest,{kind:'choose',choice:'violet'}).type,'ack');
 assert.deepEqual(s.store.view(s.host).result,{amber:1,violet:1,reason:'completed'});assert.deepEqual(s.store.command(s.host,a),receipt);
 assert.equal(s.act(s.host,{kind:'rematch',expectedRev:s.store.view(s.host).rev}).type,'ack');assert.equal(s.store.view(s.host).self.choice,null);
});
test('connection fencing, ticket replay and revoked receipt denial',t=>{
 const s=setup(t);const stale=s.host;const ticket=s.store.ticket(s.h.session,s.room.roomId);const current=s.store.attach(s.h.session,ticket);
 assert.throws(()=>s.store.attach(s.h.session,ticket),/FORBIDDEN/);assert.throws(()=>s.store.view(stale),/FORBIDDEN/);
 const c=s.cmd(current,{kind:'ready',ready:true},'ready');assert.equal(s.store.command(current,c).type,'ack');assert.equal(s.store.command(stale,c).code,'FORBIDDEN');
 const target=s.store.view(s.guest).self.seatId;const ready=s.cmd(s.guest,{kind:'ready',ready:true},'g');s.store.command(s.guest,ready);
 assert.equal(s.act(current,{kind:'kick',seatId:target,expectedRev:s.store.view(current).rev}).type,'ack');assert.equal(s.store.command(s.guest,ready).code,'FORBIDDEN');
});
test('intact restart recovers committed receipt; disaster reset invalidates sessions',t=>{
 const s=setup(t);s.begin();const a=s.cmd(s.host,{kind:'choose',choice:'amber'},'persist');const ack=s.store.command(s.host,a);s.restart();assert.throws(()=>s.store.view(s.host),/FORBIDDEN/);s.reconnect();
 assert.equal(s.store.view(s.host).self.choice,'amber');assert.deepEqual(s.store.command(s.host,a),ack);
 s.restart(true);assert.equal(s.store.session(s.h.raw),null);assert.throws(()=>s.store.ticket(s.h.session,s.room.roomId),/FORBIDDEN/);
});
test('absolute deadline rejects new mutation and host migration after grace',t=>{
 const s=setup(t);s.begin();const a=s.cmd(s.host,{kind:'choose',choice:'amber'});s.advance(45000);assert.equal(s.store.command(s.host,a).code,'PHASE_CLOSED');assert.equal(s.store.view(s.host).result.reason,'deadline');s.store.detach(s.host);s.advance(30001);s.store.tick();assert.equal(s.store.view(s.guest).self.canHost,true);
});
test('create and join idempotency; capacity and room isolation',t=>{
 const s=setup(t);assert.equal(s.store.create(s.h.session,'Host','nonce1').roomId,s.room.roomId);assert.throws(()=>s.store.create(s.h.session,'Changed','nonce1'),/CONFLICT/);
 assert.equal(s.store.join(s.g.session,s.room.code,'Guest').self.seatId,s.store.view(s.guest).self.seatId);
 const raw=s.store.bootstrap(null).raw;const session=s.store.session(raw);const second=s.store.create(session,'Other','nonce2');assert.notEqual(second.roomId,s.room.roomId);assert.throws(()=>s.store.ticket(session,s.room.roomId),/FORBIDDEN/);
 for(let i=0;i<10;i++){const raw=s.store.bootstrap(null).raw;s.store.join(s.store.session(raw),s.room.code,'Seat '+i);}
 const over=s.store.bootstrap(null).raw;assert.throws(()=>s.store.join(s.store.session(over),s.room.code,'Extra'),/FULL/);
});
