import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeClientFrame,decodeServerFrame,semanticCommand,acceptSnapshot} from '../../.build/server/contracts/protocol.js';
import {seededUint32} from '../../.build/server/contracts/module.js';
const frame={v:1,type:'command',matchId:'m1',phaseId:'m1:active:1',commandId:'c1',seenRev:4,action:{kind:'choose',choice:'amber'}};
test('strict wire decoding and semantic duplicate identity',()=>{
  assert.deepEqual(decodeClientFrame(frame),frame);
  assert.equal(semanticCommand(decodeClientFrame({...frame,seenRev:5})),semanticCommand(frame));
  for(const invalid of [null,[],{...frame,actor:'victim'},{...frame,seenRev:-1},{...frame,action:{kind:'choose',choice:'amber',seatId:'victim'}},{...frame,action:{kind:'systemEvent'}},{...frame,action:{kind:'claim',itemVersion:1.2}},{...frame,commandId:'../../x'},{...frame,action:{kind:'choose',choice:'other'}}]){
    assert.throws(()=>decodeClientFrame(invalid),/INVALID/);
  }
  assert.throws(()=>decodeClientFrame({...frame,v:2}),/UPGRADE_REQUIRED/);
});
const snapshot={v:1,type:'snapshot',roomId:'r1',code:'ABCDEF',matchId:'m1',phaseId:'m1:active:1',rev:9,serverNow:100,deadlineAt:200,status:'active',hostSeatId:'s1',seats:[{id:'s1',alias:'Host',ready:true,connected:true,revoked:false}],self:{seatId:'s1',choice:null,canHost:true},submittedCount:0,itemVersion:0,claimedBy:null,result:null};
test('snapshot schema rejects server-only and other-seat hidden fields',()=>{
  assert.deepEqual(decodeServerFrame(snapshot),snapshot);
  assert.throws(()=>decodeServerFrame({...snapshot,privateSeed:'SECRET'}),/INVALID/);
  assert.throws(()=>decodeServerFrame({...snapshot,seats:[{...snapshot.seats[0],choice:'amber'}]}),/INVALID/);
  assert.equal(acceptSnapshot(snapshot,{...snapshot,rev:14}),true);
  assert.equal(acceptSnapshot(snapshot,{...snapshot,matchId:'m0',rev:8}),false);
  assert.equal(acceptSnapshot(snapshot,{...snapshot,matchId:'m2',rev:10}),true);
});
test('versioned RNG deterministic',()=>{
  const sample=Array.from({length:100},(_,i)=>seededUint32(42,i));
  assert.deepEqual(sample,Array.from({length:100},(_,i)=>seededUint32(42,i)));
  assert.equal(new Set(sample).size,100);
});
