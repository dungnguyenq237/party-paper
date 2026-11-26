import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes, randomInt, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { LIMITS, ProtocolError, fail, semanticCommand, decodeServerFrame, object, identifier, code, alias, integer, boolean } from '../../contracts/protocol.js';
import type { Ack, Command, ErrorCode, ErrorFrame, Snapshot } from '../../contracts/protocol.js';
import { apply, member, phaseId, progress, project, recover } from './room-state.js';
import type { Member, Room } from './room-state.js';
export type Principal={roomId:string;session:string;generation:number};
type Clock=()=>number;
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
const secret=()=>randomBytes(32).toString('base64url');
const error=(code:ErrorCode,commandId:string|null=null):ErrorFrame=>({v:1,type:'error',code,commandId});
const schema=readFileSync(new URL('../../../../migrations/001_rooms.sql',import.meta.url),'utf8');
// Validate the full persisted v1 shape before using any member or private value.
function unpack(value:unknown):Room {
  try {
    if(typeof value!=='string'||Buffer.byteLength(value)>64*1024)throw Error();
    const r=JSON.parse(value) as Room;
    object(r,['schema','id','code','matchId','phase','rev','status','hostSeatId','seats','deadlineAt','expiresAt','pauseUsed','remainingMs','recovering','itemVersion','claimedBy','result','privateSeed']);
    if(r.schema!==1||!Array.isArray(r.seats)||r.seats.length<1||r.seats.length>LIMITS.seats)throw Error();
    identifier(r.id);code(r.code);identifier(r.matchId);identifier(r.privateSeed);
    for(const n of [r.phase,r.rev,r.expiresAt,r.remainingMs,r.itemVersion])integer(n);
    boolean(r.pauseUsed);boolean(r.recovering);
    if(r.phase<1||r.rev<1||r.itemVersion>1||r.remainingMs>45000)throw Error();
    const ids=new Set<string>(),sessions=new Set<string>();
    for(const m of r.seats){
      object(m,['id','session','alias','ready','connected','disconnectedAt','generation','revoked','choice']);
      identifier(m.id);alias(m.alias);integer(m.disconnectedAt);integer(m.generation);
      boolean(m.ready);boolean(m.connected);boolean(m.revoked);
      if(typeof m.session!=='string'||!/^[a-f0-9]{64}$/.test(m.session)||ids.has(m.id)||sessions.has(m.session)||(m.revoked&&m.connected)||![null,'amber','violet'].includes(m.choice))throw Error();
      ids.add(m.id);sessions.add(m.session);
    }
    if(r.hostSeatId!==null&&!ids.has(r.hostSeatId))throw Error();
    if(r.claimedBy!==null&&!ids.has(r.claimedBy))throw Error();
    if((r.itemVersion===0)!==(r.claimedBy===null))throw Error();
    const timed=r.status==='active'||r.status==='paused';
    const terminal=r.status==='results'||r.status==='abandoned';
    if(!timed&&!terminal&&r.status!=='lobby')throw Error();
    if(timed?(r.deadlineAt===null||integer(r.deadlineAt)>r.expiresAt):r.deadlineAt!==null)throw Error();
    if(terminal!==(r.result!==null)||r.recovering&&r.status!=='paused')throw Error();
    if(r.result&&r.result.amber+r.result.violet>r.seats.length)throw Error();
    if(r.status==='lobby'&&r.seats.some(m=>m.choice!==null))throw Error();
    // Reuse wire validation for the remaining public discriminants and fields.
    const first=r.seats[0];if(!first)throw Error();
    decodeServerFrame(project(r,first,0));
    return r;
  } catch { throw new Error('Unsupported room snapshot'); }
}
export class RoomStore {
  private readonly db:DatabaseSync;
  constructor(path:string,private readonly now:Clock=Date.now,resetTransient=false){
    this.db=new DatabaseSync(path);
    try{
      this.db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=1000; PRAGMA locking_mode=EXCLUSIVE; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;');
      const version=this.db.prepare('PRAGMA user_version').get()?.user_version;
      if(version!==0&&version!==1)throw new Error('Unsupported database version');
      if(version===0)this.tx(()=>this.db.exec(schema));
      this.tx(()=>{
        if(resetTransient){this.db.exec('DELETE FROM rooms; DELETE FROM sessions;');return;}
        const now=this.now();this.cleanup(now);
        this.db.exec('DELETE FROM tickets');
        for(const row of this.db.prepare('SELECT id FROM rooms').all()){const r=this.load(String(row.id));recover(r,now);this.save(r);}
      });
    }catch(e){this.db.close();throw e;}
  }
  close():void{this.db.close();}
  private tx<T>(f:()=>T):T{this.db.exec('BEGIN IMMEDIATE');try{const v=f();this.db.exec('COMMIT');return v;}catch(e){try{this.db.exec('ROLLBACK');}catch{/* preserve original failure */}throw e;}}
  private load(roomId:string):Room{const row=this.db.prepare('SELECT state,code,expires_at FROM rooms WHERE id=? AND expires_at>?').get(roomId,this.now());if(!row)fail('EXPIRED');const r=unpack(row.state);if(r.id!==roomId||r.code!==row.code||r.expiresAt!==row.expires_at)throw new Error('Inconsistent room record');return r;}
  private save(r:Room):void{this.db.prepare('UPDATE rooms SET state=?, expires_at=? WHERE id=?').run(JSON.stringify(r),r.expiresAt,r.id);}
  private touch(r:Room):void{r.rev++;this.save(r);}
  private ensureSession(session:string):void{if(!this.db.prepare('SELECT 1 FROM sessions WHERE id=? AND expires_at>?').get(session,this.now()))fail('FORBIDDEN');}
  private cleanup(now:number):void{this.db.prepare('DELETE FROM rooms WHERE expires_at<=?').run(now);this.db.prepare('DELETE FROM tickets WHERE expires_at<=?').run(now);this.db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now);}
  session(raw:string|null):string|null{
    if(!raw||!/^[A-Za-z0-9_-]{43}$/.test(raw))return null;
    const id=hash(raw);return this.db.prepare('SELECT 1 FROM sessions WHERE id=? AND expires_at>?').get(id,this.now())?id:null;
  }
  bootstrap(raw:string|null):{raw:string;csrf:string}{
    if(raw&&this.session(raw))return {raw,csrf:hash('csrf:'+raw)};
    return this.tx(()=>{
      const now=this.now();this.cleanup(now);
      const count=Number(this.db.prepare('SELECT count(*) AS n FROM sessions').get()?.n);
      if(count>=LIMITS.rooms*LIMITS.seats*4)fail('RATE_LIMITED');
      const value=secret();this.db.prepare('INSERT INTO sessions(id,expires_at) VALUES(?,?)').run(hash(value),now+LIMITS.sessionMs);
      return {raw:value,csrf:hash('csrf:'+value)};
    });
  }
  csrf(raw:string,value:unknown):boolean{return typeof value==='string'&&value===hash('csrf:'+raw);}
  private newMember(session:string,alias:string):Member{return{id:randomUUID(),session,alias,ready:false,connected:false,disconnectedAt:this.now(),generation:0,revoked:false,choice:null};}
  create(session:string,alias:string,nonce:string):Snapshot{return this.tx(()=>{
    this.ensureSession(session);const now=this.now();this.cleanup(now);
    const key=hash(session+':'+nonce),digest=hash(alias);
    const prior=this.db.prepare('SELECT state,creation_digest FROM rooms WHERE creation_key=?').get(key);
    if(prior){if(prior.creation_digest!==digest)fail('CONFLICT');const r=unpack(prior.state);return project(r,member(r,session),now);}
    if(Number(this.db.prepare('SELECT count(*) AS n FROM rooms').get()?.n)>=LIMITS.rooms)fail('FULL');
    const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code='';
    do{code=Array.from({length:6},()=>alphabet[randomInt(alphabet.length)]).join('');}while(this.db.prepare('SELECT 1 FROM rooms WHERE code=?').get(code));
    const s=this.newMember(session,alias);const r:Room={schema:1,id:randomUUID(),code,matchId:randomUUID(),phase:1,rev:1,status:'lobby',hostSeatId:s.id,seats:[s],deadlineAt:null,expiresAt:now+LIMITS.lobbyMs,pauseUsed:false,remainingMs:0,recovering:false,itemVersion:0,claimedBy:null,result:null,privateSeed:secret()};
    this.db.prepare('INSERT INTO rooms(id,code,state,creation_key,creation_digest,expires_at) VALUES(?,?,?,?,?,?)').run(r.id,r.code,JSON.stringify(r),key,digest,r.expiresAt);return project(r,s,now);
  });}
  join(session:string,code:string,alias:string):Snapshot{return this.tx(()=>{
    this.ensureSession(session);const now=this.now();this.cleanup(now);
    const row=this.db.prepare('SELECT state FROM rooms WHERE code=?').get(code);if(!row)fail('UNAVAILABLE');
    const r=unpack(row.state),prior=r.seats.find(s=>s.session===session);
    if(prior){if(prior.revoked)fail('UNAVAILABLE');return project(r,prior,now);}
    if(r.status!=='lobby')fail('UNAVAILABLE');if(r.seats.length>=LIMITS.seats)fail('FULL');
    const s=this.newMember(session,alias);r.seats.push(s);this.touch(r);return project(r,s,now);
  });}
  ticket(session:string,roomId:string):string{return this.tx(()=>{
    this.ensureSession(session);member(this.load(roomId),session);
    this.db.prepare('DELETE FROM tickets WHERE session_id=? AND room_id=?').run(session,roomId);
    const ticket=secret();this.db.prepare('INSERT INTO tickets(id,session_id,room_id,expires_at) VALUES(?,?,?,?)').run(hash(ticket),session,roomId,this.now()+LIMITS.ticketMs);return ticket;
  });}
  attach(session:string,ticket:string):Principal{return this.tx(()=>{
    this.ensureSession(session);const now=this.now();
    const row=this.db.prepare('SELECT room_id FROM tickets WHERE id=? AND session_id=? AND expires_at>?').get(hash(ticket),session,now);
    if(!row||typeof row.room_id!=='string')fail('FORBIDDEN');
    const r=this.load(row.room_id);const s=member(r,session);
    this.db.prepare('DELETE FROM tickets WHERE id=?').run(hash(ticket));
    progress(r,now);s.generation++;s.connected=true;progress(r,now);this.touch(r);
    return {roomId:r.id,session,generation:s.generation};
  });}
  private authorize(p:Principal,r:Room):Member{this.ensureSession(p.session);const s=member(r,p.session);if(!s.connected||s.generation!==p.generation)fail('FORBIDDEN');return s;}
  detach(p:Principal):void{this.tx(()=>{
    let r:Room;try{r=this.load(p.roomId);}catch(e){if(e instanceof ProtocolError)return;throw e;}
    const s=r.seats.find(s=>s.session===p.session&&!s.revoked);if(!s||s.generation!==p.generation||!s.connected)return;
    s.connected=false;s.disconnectedAt=this.now();this.touch(r);
  });}
  view(p:Principal):Snapshot{const r=this.load(p.roomId);const snapshot=project(r,this.authorize(p,r),this.now());decodeServerFrame(snapshot);return snapshot;}
  command(p:Principal,c:Command):Ack|ErrorFrame{
    return this.tx(()=>{
      let r:Room,s:Member;try{r=this.load(p.roomId);s=this.authorize(p,r);}catch(e){if(e instanceof ProtocolError)return error(e.code,c.commandId);throw e;}
      const digest=hash(semanticCommand(c));
      const receipt=this.db.prepare('SELECT digest,accepted_rev FROM receipts WHERE room_id=? AND match_id=? AND seat_id=? AND command_id=?').get(r.id,c.matchId,s.id,c.commandId);
      if(receipt){if(receipt.digest!==digest)return error('CONFLICT',c.commandId);return {v:1,type:'ack',matchId:c.matchId,commandId:c.commandId,acceptedRev:Number(receipt.accepted_rev)};}
      const now=this.now();
      if(progress(r,now))this.touch(r);
      if(c.matchId!==r.matchId||c.phaseId!==phaseId(r))return error('PHASE_CLOSED',c.commandId);
      if(Number(this.db.prepare('SELECT count(*) AS n FROM receipts WHERE room_id=? AND match_id=? AND seat_id=?').get(r.id,c.matchId,s.id)?.n)>=LIMITS.receiptsPerSeat)return error('RATE_LIMITED',c.commandId);
      try{
        if(apply(r,s,c.action,now,randomUUID))this.touch(r);
      }catch(e){if(e instanceof ProtocolError)return error(e.code,c.commandId);throw e;}
      // Keep only the transition receipt from the prior epoch; old votes must not be retried into a new match.
      if(c.action.kind==='start'||c.action.kind==='rematch')this.db.prepare('DELETE FROM receipts WHERE room_id=? AND match_id<>?').run(r.id,r.matchId);
      this.db.prepare('INSERT INTO receipts(room_id,match_id,seat_id,command_id,digest,accepted_rev) VALUES(?,?,?,?,?,?)').run(r.id,c.matchId,s.id,c.commandId,digest,r.rev);
      return {v:1,type:'ack',matchId:c.matchId,commandId:c.commandId,acceptedRev:r.rev};
    });
  }
  tick():void{this.tx(()=>{const now=this.now();this.cleanup(now);for(const row of this.db.prepare('SELECT id FROM rooms').all()){const r=this.load(String(row.id));let changed=false;for(const seat of r.seats){if(!seat.revoked&&!this.db.prepare('SELECT 1 FROM sessions WHERE id=?').get(seat.session)){seat.revoked=true;seat.connected=false;seat.ready=false;seat.generation++;seat.disconnectedAt=now;changed=true;}}if(progress(r,now)||changed)this.touch(r);}});}
}
