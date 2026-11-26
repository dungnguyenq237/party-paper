import { LIMITS, fail } from '../../contracts/protocol.js';
import type { Action, Choice, EndReason, RoomStatus, Snapshot } from '../../contracts/protocol.js';

export type Member = {id:string;session:string;alias:string;ready:boolean;connected:boolean;disconnectedAt:number;generation:number;revoked:boolean;choice:Choice|null};
export type Room = {
  schema:1; id:string; code:string; matchId:string; phase:number; rev:number; status:RoomStatus;
  hostSeatId:string|null; seats:Member[]; deadlineAt:number|null; expiresAt:number; pauseUsed:boolean;
  remainingMs:number; recovering:boolean; itemVersion:number; claimedBy:string|null;
  result:Snapshot['result']; privateSeed:string;
};
export function phaseId(r:Room):string { return r.matchId+':'+r.status+':'+r.phase; }
export function member(r:Room,session:string):Member {
  const s=r.seats.find(s=>s.session===session&&!s.revoked);
  if(!s) fail('FORBIDDEN');
  return s;
}
export function connected(r:Room):Member[]{return r.seats.filter(s=>!s.revoked&&s.connected);}
function eligible(r:Room):Member[]{return r.seats.filter(s=>!s.revoked);}
export function project(r:Room,s:Member,now:number):Snapshot{
  return {v:1,type:'snapshot',roomId:r.id,code:r.code,matchId:r.matchId,phaseId:phaseId(r),rev:r.rev,
    serverNow:now,deadlineAt:r.deadlineAt,status:r.status,hostSeatId:r.hostSeatId,
    seats:r.seats.map(x=>({id:x.id,alias:x.alias,ready:x.ready,connected:x.connected,revoked:x.revoked})),
    self:{seatId:s.id,choice:s.choice,canHost:r.hostSeatId===s.id&&!s.revoked&&s.connected},
    submittedCount:r.seats.filter(x=>x.choice!==null).length,itemVersion:r.itemVersion,claimedBy:r.claimedBy,
    result:r.result===null?null:{...r.result}};
}
function finish(r:Room,reason:EndReason,now:number):void{
  const abandoned=reason==='quorum'||reason==='lease'||reason==='recovery';
  r.status=abandoned?'abandoned':'results'; r.phase++;r.deadlineAt=null;r.recovering=false;
  r.result={amber:abandoned?0:r.seats.filter(s=>s.choice==='amber').length,violet:abandoned?0:r.seats.filter(s=>s.choice==='violet').length,reason};
  r.expiresAt=Math.min(r.expiresAt,now+LIMITS.resultMs);
}
function elect(r:Room,now:number):boolean {
  const host=r.seats.find(s=>s.id===r.hostSeatId);
  if(host&&!host.revoked&&(host.connected||now-host.disconnectedAt<LIMITS.hostGraceMs)) return false;
  const next=connected(r)[0]?.id??null;
  if(next===r.hostSeatId)return false;
  r.hostSeatId=next;return true;
}
// Trusted timer/lifecycle transition. Exactly one active phase can resolve per call.
export function progress(r:Room,now:number):boolean {
  let changed=elect(r,now);
  if(r.status==='active'){
    const grace=eligible(r).filter(s=>s.connected||now-s.disconnectedAt<2*LIMITS.heartbeatMs).length;
    if(grace<LIMITS.minSeats){
      if(r.pauseUsed){finish(r,'quorum',now);return true;}
      r.remainingMs=Math.max(0,(r.deadlineAt??now)-now);r.status='paused';r.phase++;r.pauseUsed=true;
      r.deadlineAt=Math.min(r.expiresAt,now+LIMITS.reconnectMs);return true;
    }
    if(r.deadlineAt!==null&&now>=r.deadlineAt){finish(r,'deadline',now);return true;}
  }else if(r.status==='paused'){
    if(r.deadlineAt!==null&&now>=r.deadlineAt){finish(r,r.recovering?'recovery':'quorum',now);return true;}
    if(connected(r).length>=LIMITS.minSeats){
      r.status='active';r.phase++;r.recovering=false;r.deadlineAt=Math.min(r.expiresAt,now+r.remainingMs);
      if(r.remainingMs===0)finish(r,'deadline',now);
      return true;
    }
  }
  return changed;
}
export function recover(r:Room,now:number):void {
  for(const s of r.seats){s.connected=false;s.disconnectedAt=now;s.generation++;}
  if(r.status==='active'||r.status==='paused'){
    // Repeated process restarts must not renew the recovery window.
    const existing=r.status==='paused'?r.deadlineAt:null;
    if(r.status==='active')r.remainingMs=Math.max(0,(r.deadlineAt??now)-now);
    r.status='paused';r.phase++;r.recovering=true;
    r.deadlineAt=Math.min(r.expiresAt,existing??now+LIMITS.reconnectMs,now+LIMITS.reconnectMs);
  }
  r.rev++;
}
function revoke(s:Member,now:number):void{s.revoked=true;s.connected=false;s.ready=false;s.disconnectedAt=now;s.generation++;}
export function apply(r:Room,s:Member,a:Action,now:number,nextId:()=>string):boolean {
  if(a.kind==='leave'){revoke(s,now);progress(r,now);return true;}
  if(a.kind==='kick'){
    if(r.hostSeatId!==s.id)fail('FORBIDDEN');
    if(a.expectedRev!==r.rev)fail('STALE');
    if(r.status!=='lobby'&&r.status!=='active'&&r.status!=='paused')fail('PHASE_CLOSED');
    const target=r.seats.find(x=>x.id===a.seatId&&!x.revoked&&x.id!==s.id);
    if(!target)fail('FORBIDDEN');revoke(target,now);progress(r,now);return true;
  }
  if(a.kind==='ready'){
    if(r.status!=='lobby')fail('PHASE_CLOSED');
    if(s.ready===a.ready)return false;s.ready=a.ready;return true;
  }
  if(a.kind==='start'||a.kind==='rematch'){
    if(r.hostSeatId!==s.id)fail('FORBIDDEN');
    if(a.expectedRev!==r.rev)fail('STALE');
    if(a.kind==='start'){
      if(r.status!=='lobby')fail('PHASE_CLOSED');
      const roster=eligible(r);
      if(roster.length<LIMITS.minSeats||roster.some(x=>!x.ready||!x.connected))fail('UNAVAILABLE');
      r.matchId=nextId();r.phase=1;r.status='active';r.expiresAt=now+LIMITS.matchMs;r.deadlineAt=now+45_000;
    }else{
      if(r.status!=='results'&&r.status!=='abandoned')fail('PHASE_CLOSED');
      r.seats=eligible(r);
      for(const seat of r.seats){seat.ready=false;seat.choice=null;}
      r.matchId=nextId();r.phase=1;r.status='lobby';r.expiresAt=now+LIMITS.lobbyMs;r.deadlineAt=null;
    }
    r.pauseUsed=false;r.recovering=false;r.remainingMs=0;r.itemVersion=0;r.claimedBy=null;r.result=null;r.privateSeed=nextId();return true;
  }
  if(r.status==='paused')fail('PAUSED');
  if(r.status!=='active')fail('PHASE_CLOSED');
  if(a.kind==='choose'){
    if(s.choice!==null)fail('CONFLICT');
    s.choice=a.choice;
    if(eligible(r).every(x=>x.choice!==null))finish(r,'completed',now);
    return true;
  }
  if(a.kind==='claim'){
    if(a.itemVersion!==r.itemVersion||r.claimedBy!==null)fail('CONFLICT');
    r.claimedBy=s.id;r.itemVersion++;return true;
  }
  return fail();
}
