import test from 'node:test';
import assert from 'node:assert/strict';
import {hearingScore,auditQuarter,validateOrder,rank,roles,targets} from '../../play/shared/rules.js';
import {dockets} from '../../play/friend-court/dockets.js';
const player=(role='Lead',mandate='D')=>({name:role,role,mandate,used:false,credits:1,prestige:0,earned:[0,0,0],successfulWork:0});
test('Friend Court: exhaustive small jury scoring, symmetry, passes and abstention',()=>{
 for(let n of [2,4,10])for(let i=0;i<3**n;i++){
  let x=i;const votes=Array.from({length:n},()=>{const v=['A','B','X'][x%3];x=Math.floor(x/3);return v;});
  for(const a of [true,false])for(const b of [true,false]){
   const r=hearingScore(a,b,votes),s=hearingScore(b,a,votes.map(v=>v==='A'?'B':v==='B'?'A':v));
   assert.equal(r.a,s.b);assert.equal(r.b,s.a);assert.equal(r.A+r.B+r.abstain,n);if(!a)assert.equal(r.a,0);if(!b)assert.equal(r.b,0);if(r.A+r.B===0)assert.equal(r.a+r.b,0);
  }
 }
 assert.deepEqual(hearingScore(true,true,['A','B']),{a:1,b:1,A:1,B:1,abstain:0});
 assert.equal(dockets.length,16);assert.equal(new Set(dockets.map(d=>d.en[0])).size,16);assert.ok(dockets.every(d=>d.en.length===4&&d.vi.length===4&&d.vi.every(Boolean)));
});
test('Corporate Chaos: defaults, conservation, conversion, credit cap and once-only role',()=>{
 const p=roles.map(r=>player(r));const order=(units,power=false)=>({units,power});
 assert.equal(validateOrder(order([2,0,0],true),p[1]),false);
 const r=auditQuarter(p,[order([1,1,0]),order([0,1,1],true),null,order([1,1,0],true)],2,'normal',0);
 assert.deepEqual(r.totals,[5,4,0]);assert.equal(r.success,true);assert.equal(r.runway,4);
 assert.deepEqual(r.players[1].earned,[1,1,0]);assert.equal(r.players[1].credits,2);assert.equal(r.players[1].used,true);assert.equal(r.players[2].prestige,0);assert.deepEqual(r.players[2].earned,[0,0,0]);
 assert.equal(validateOrder(order([0,1,1],true),r.players[1]),false);
 assert.deepEqual(targets(5,'crunch'),[4,2]);
});
test('Corporate Chaos: all visibility fails; no free mint, zero runway and ranking ties',()=>{
 let p=roles.map(r=>player(r,'V')),runway=2;
 for(let i=0;i<2;i++){const r=auditQuarter(p,p.map(()=>({units:[0,0,2],power:false})),runway,'normal',i);p=r.players;runway=r.runway;}
 assert.equal(runway,0);assert.ok(p.every(x=>x.prestige===1&&x.credits===0));
 const tied=rank(p);assert.ok(tied.every(x=>x.score===4));
});
