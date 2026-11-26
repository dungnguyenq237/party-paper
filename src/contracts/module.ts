export type SeatId = string;
export type SystemEvent =
  | {kind:'seatDisconnected'|'seatReconnected'|'seatLeft';seatId:SeatId;connectionGeneration:number}
  | {kind:'seatRevoked';seatId:SeatId}
  | {kind:'hostChanged';hostSeatId:SeatId|null}
  | {kind:'quorumPaused'|'quorumResumed'|'matchAbandoned'|'serverRecovered'};
export type StepContext = Readonly<{now:number;matchId:string;phaseId:string;seed:number;cursor:number}>;
export type MatchContext = StepContext & {seats:readonly SeatId[];engineVersion:number;contentVersion:string};
export type Change<S> = {state:S;deadlineAt:number|null;cursor:number};
export type AuthorizedViewer = {kind:'seat';seatId:SeatId}|{kind:'display'};
export interface GameModule<S,C,A,V,O> {
  decodeConfig(input:unknown):C;
  decodeAction(input:unknown):A;
  initialize(ctx:MatchContext,config:C):Change<S>;
  apply(state:Readonly<S>,actor:SeatId,action:A,ctx:StepContext):Change<S>;
  expire(state:Readonly<S>,ctx:StepContext):Change<S>;
  onSystemEvent?(state:Readonly<S>,event:SystemEvent,ctx:StepContext):Change<S>;
  project(state:Readonly<S>,viewer:AuthorizedViewer):V;
  outcome(state:Readonly<S>):O|null;
}
// Versioned counter-based PRNG for deterministic fixture/game state, never security tokens.
export function seededUint32(seed:number,cursor:number):number {
  let x=(seed+Math.imul(cursor+1,0x9e3779b9))>>>0;
  x=Math.imul(x^(x>>>16),0x21f0aaad);
  x=Math.imul(x^(x>>>15),0x735a2d97);
  return (x^(x>>>15))>>>0;
}
