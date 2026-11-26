// Provisional v1. This file is portable: no Node, DOM, storage or game secrets.
export const PROTOCOL = 1 as const;
export const LIMITS = Object.freeze({ frameBytes: 4096, rooms: 32, seats: 12, minSeats: 2, receiptsPerSeat: 128, sessionMs: 86_400_000, lobbyMs: 1_800_000, matchMs: 14_400_000, resultMs: 900_000, ticketMs: 30_000, reconnectMs: 90_000, heartbeatMs: 15_000, hostGraceMs: 30_000 } as const);
export const ERROR_CODES = ['INVALID','FORBIDDEN','STALE','CONFLICT','PHASE_CLOSED','PAUSED','EXPIRED','FULL','RATE_LIMITED','UPGRADE_REQUIRED','UNAVAILABLE'] as const;
export type ErrorCode = typeof ERROR_CODES[number];
export class ProtocolError extends Error {
  constructor(readonly code: ErrorCode) { super(code); this.name = 'ProtocolError'; }
}
export function fail(code: ErrorCode = 'INVALID'): never { throw new ProtocolError(code); }
export type Choice = 'amber' | 'violet';
export type RoomStatus = 'lobby' | 'active' | 'paused' | 'results' | 'abandoned';
export type EndReason = 'completed' | 'deadline' | 'quorum' | 'lease' | 'recovery';
export type Action =
  | {kind:'ready'; ready:boolean}
  | {kind:'start'; expectedRev:number}
  | {kind:'choose'; choice:Choice}
  | {kind:'claim'; itemVersion:number}
  | {kind:'kick'; seatId:string; expectedRev:number}
  | {kind:'leave'}
  | {kind:'rematch'; expectedRev:number};
export type Command = {v:1; type:'command'; matchId:string; phaseId:string; commandId:string; seenRev:number; action:Action};
export type Hello = {v:1; type:'hello'; ticket:string};
export type ClientFrame = Command | Hello | {v:1; type:'resync'};
export type Ack = {v:1; type:'ack'; matchId:string; commandId:string; acceptedRev:number};
export type ErrorFrame = {v:1; type:'error'; code:ErrorCode; commandId:string|null};
export type SeatView = {id:string; alias:string; ready:boolean; connected:boolean; revoked:boolean};
export type Snapshot = {
  v:1; type:'snapshot'; roomId:string; code:string; matchId:string; phaseId:string; rev:number;
  serverNow:number; deadlineAt:number|null; status:RoomStatus; hostSeatId:string|null;
  seats:SeatView[]; self:{seatId:string; choice:Choice|null; canHost:boolean};
  submittedCount:number; itemVersion:number; claimedBy:string|null;
  result:{amber:number; violet:number; reason:EndReason}|null;
};
export type ServerFrame = Ack | ErrorFrame | Snapshot;
type Obj = Record<string, unknown>;
export function object(value:unknown, keys:readonly string[]):Obj {
  if (typeof value !== 'object' || value===null || Array.isArray(value)) fail();
  const o=value as Obj;
  const actual=Object.keys(o);
  if(actual.length!==keys.length || !keys.every(k=>Object.prototype.hasOwnProperty.call(o,k))) fail();
  return o;
}
export function identifier(value:unknown):string {
  if(typeof value!=='string'|| !/^[A-Za-z0-9_:-]{1,96}$/.test(value)) fail();
  return value;
}
export function integer(value:unknown):number {
  if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0) fail();
  return value;
}
export function boolean(value:unknown):boolean { if(typeof value!=='boolean') fail(); return value; }
export function alias(value:unknown):string {
  if(typeof value!=='string') fail();
  const normalized=value.normalize('NFC').trim();
  if(!normalized||[...normalized].length>24||/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u.test(normalized)) fail();
  return normalized;
}
export function code(value:unknown):string {
  if(typeof value!=='string'||!/^[A-Z2-9]{6}$/.test(value)) fail();
  return value;
}
export function token(value:unknown):string {
  if(typeof value!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(value)) fail();
  return value;
}
function oneOf<T extends string>(value:unknown, choices:readonly T[]):T {
  if(typeof value!=='string'||!choices.includes(value as T)) fail();
  return value as T;
}
function nullable<T>(v:unknown, decode:(v:unknown)=>T):T|null { return v===null?null:decode(v); }
export function decodeAction(value:unknown):Action {
  if(typeof value!=='object'||value===null||Array.isArray(value)) fail();
  const kind=(value as Obj).kind;
  switch(kind){
    case 'ready': { const x=object(value,['kind','ready']); return {kind,ready:boolean(x.ready)}; }
    case 'start': case 'rematch': { const x=object(value,['kind','expectedRev']); return {kind,expectedRev:integer(x.expectedRev)}; }
    case 'choose': { const x=object(value,['kind','choice']); return {kind,choice:oneOf(x.choice,['amber','violet'] as const)}; }
    case 'claim': { const x=object(value,['kind','itemVersion']); return {kind,itemVersion:integer(x.itemVersion)}; }
    case 'kick': { const x=object(value,['kind','seatId','expectedRev']); return {kind,seatId:identifier(x.seatId),expectedRev:integer(x.expectedRev)}; }
    case 'leave': object(value,['kind']); return {kind};
    default: return fail();
  }
}
export function decodeClientFrame(value:unknown):ClientFrame {
  if(typeof value!=='object'||value===null||Array.isArray(value)) fail();
  const raw=value as Obj;
  if(raw.v!==PROTOCOL) fail('UPGRADE_REQUIRED');
  if(raw.type==='hello'){const x=object(raw,['v','type','ticket']);return {v:1,type:'hello',ticket:token(x.ticket)};}
  if(raw.type==='resync'){object(raw,['v','type']);return {v:1,type:'resync'};}
  const x=object(raw,['v','type','matchId','phaseId','commandId','seenRev','action']);
  if(x.type!=='command') fail();
  return {v:1,type:'command',matchId:identifier(x.matchId),phaseId:identifier(x.phaseId),commandId:identifier(x.commandId),seenRev:integer(x.seenRev),action:decodeAction(x.action)};
}
export function decodeServerFrame(value:unknown):ServerFrame {
  if(typeof value!=='object'||value===null||Array.isArray(value)) fail();
  const raw=value as Obj;
  if(raw.v!==1) fail('UPGRADE_REQUIRED');
  if(raw.type==='ack'){const x=object(raw,['v','type','matchId','commandId','acceptedRev']);return {v:1,type:'ack',matchId:identifier(x.matchId),commandId:identifier(x.commandId),acceptedRev:integer(x.acceptedRev)};}
  if(raw.type==='error'){const x=object(raw,['v','type','code','commandId']);return {v:1,type:'error',code:oneOf(x.code,ERROR_CODES),commandId:nullable(x.commandId,identifier)};}
  const x=object(raw,['v','type','roomId','code','matchId','phaseId','rev','serverNow','deadlineAt','status','hostSeatId','seats','self','submittedCount','itemVersion','claimedBy','result']);
  if(x.type!=='snapshot'||!Array.isArray(x.seats)||x.seats.length>LIMITS.seats) fail();
  const seats=x.seats.map(s=>{const z=object(s,['id','alias','ready','connected','revoked']);return {id:identifier(z.id),alias:alias(z.alias),ready:boolean(z.ready),connected:boolean(z.connected),revoked:boolean(z.revoked)};});
  const self=object(x.self,['seatId','choice','canHost']);
  const result=nullable(x.result,v=>{const z=object(v,['amber','violet','reason']);return {amber:integer(z.amber),violet:integer(z.violet),reason:oneOf(z.reason,['completed','deadline','quorum','lease','recovery'] as const)};});
  return {v:1,type:'snapshot',roomId:identifier(x.roomId),code:code(x.code),matchId:identifier(x.matchId),phaseId:identifier(x.phaseId),rev:integer(x.rev),serverNow:integer(x.serverNow),deadlineAt:nullable(x.deadlineAt,integer),status:oneOf(x.status,['lobby','active','paused','results','abandoned'] as const),hostSeatId:nullable(x.hostSeatId,identifier),seats,self:{seatId:identifier(self.seatId),choice:nullable(self.choice,v=>oneOf(v,['amber','violet'] as const)),canHost:boolean(self.canHost)},submittedCount:integer(x.submittedCount),itemVersion:integer(x.itemVersion),claimedBy:nullable(x.claimedBy,identifier),result};
}
// All semantic keys are reconstructed in fixed order by decodeClientFrame.
export function semanticCommand(c:Command):string { return JSON.stringify([c.matchId,c.phaseId,c.action]); }
export function acceptSnapshot(previous:Snapshot|null, next:Snapshot):boolean {
  return previous===null || (previous.roomId===next.roomId && next.rev>=previous.rev && (next.matchId===previous.matchId || next.rev>previous.rev));
}
