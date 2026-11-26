import {acceptSnapshot,decodeServerFrame} from '../../contracts/protocol.js';
import type {Action,Command,Snapshot} from '../../contracts/protocol.js';

export type Connection='idle'|'connecting'|'connected'|'disconnected'|'replaced'|'error';
export type RoomClientState=Readonly<{connection:Connection;view:Snapshot|null;feedback:string;pending:boolean}>;
export class RoomClient{
  private state:RoomClientState={connection:'idle',view:null,feedback:'',pending:false};
  private csrf='';
  private socket:WebSocket|null=null;
  private generation=0;
  private pending:Command|null=null;
  private awaitingRev:number|null=null;
  private timeout:number|undefined;
  constructor(private readonly listener:(s:RoomClientState)=>void){}
  private update(patch:Partial<RoomClientState>):void{this.state={...this.state,...patch};this.listener(this.state);}
  private async post(path:string,data:unknown):Promise<unknown>{
    const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':this.csrf},body:JSON.stringify(data),credentials:'same-origin',cache:'no-store'});
    const value:unknown=await r.json();if(!r.ok)throw Error('Request rejected ('+r.status+')');return value;
  }
  private async session():Promise<void>{const r=await this.post('/api/session',{}) as {csrf?:unknown};if(typeof r.csrf!=='string')throw Error('Session unavailable');this.csrf=r.csrf;}
  private stop():void{this.generation++;this.socket?.close();this.socket=null;window.clearTimeout(this.timeout);this.pending=null;this.awaitingRev=null;}
  disconnect():void{this.stop();this.update({connection:'disconnected',pending:false,feedback:'Disconnected'});}
  reset():void{this.stop();this.update({view:null,connection:'idle',pending:false,feedback:''});}
  async open(kind:'create'|'join',alias:string,code=''):Promise<void>{
    this.stop();const gen=this.generation;this.update({connection:'connecting',view:null,pending:false,feedback:''});
    try{await this.session();const data=kind==='create'?await this.post('/api/rooms',{alias,nonce:crypto.randomUUID()}):await this.post('/api/join',{alias,code});if(gen!==this.generation)return;
      const v=decodeServerFrame(data);if(v.type!=='snapshot')throw Error('Expected room');this.update({view:v});await this.connect(v.roomId,gen);
    }catch{if(gen===this.generation)this.update({connection:'error',feedback:'Room unavailable. Check your details or retry.'});}
  }
  async reconnect():Promise<void>{
    const id=this.state.view?.roomId;if(!id)return;this.stop();const gen=this.generation;this.update({connection:'connecting',pending:false,feedback:''});
    try{await this.session();await this.connect(id,gen);}catch{if(gen===this.generation)this.update({connection:'error',feedback:'Unable to reconnect. Rejoin if the session expired.'});}
  }
  private async connect(id:string,gen:number):Promise<void>{
    const data=await this.post('/api/rooms/'+encodeURIComponent(id)+'/socket-ticket',{}) as {ticket?:unknown};if(gen!==this.generation)return;
    if(typeof data.ticket!=='string')throw Error('Invalid ticket');
    const ticket=data.ticket;const url=new URL('/ws',location.href);url.protocol=location.protocol==='https:'?'wss:':'ws:';
    const ws=new WebSocket(url);this.socket=ws;
    this.timeout=window.setTimeout(()=>{if(gen===this.generation&&this.state.connection==='connecting'){this.stop();this.update({connection:'error',feedback:'Connection timed out'});}},8000);
    ws.onopen=()=>{if(gen===this.generation)ws.send(JSON.stringify({v:1,type:'hello',ticket}));};
    ws.onmessage=e=>{
      if(gen!==this.generation)return;
      try{
        const frame=decodeServerFrame(JSON.parse(String(e.data)));
        if(frame.type==='snapshot'){if(acceptSnapshot(this.state.view,frame)){const resolved=this.awaitingRev!==null&&frame.rev>=this.awaitingRev;if(resolved){this.awaitingRev=null;window.clearTimeout(this.timeout);}else if(this.state.connection==='connecting')window.clearTimeout(this.timeout);this.update({view:frame,connection:'connected',pending:resolved?false:this.state.pending});}return;}
        if(frame.type==='ack'){if(this.pending?.commandId===frame.commandId){this.pending=null;window.clearTimeout(this.timeout);const waiting=(this.state.view?.rev??-1)<frame.acceptedRev;this.awaitingRev=waiting?frame.acceptedRev:null;this.update({pending:waiting,feedback:'Accepted · r'+frame.acceptedRev});if(waiting)this.timeout=window.setTimeout(()=>{if(this.awaitingRev!==null){this.awaitingRev=null;ws.close();}},8000);}return;}
        if(frame.commandId===this.pending?.commandId||frame.commandId===null){this.pending=null;window.clearTimeout(this.timeout);this.update({pending:false,feedback:frame.code});}
      }catch{this.stop();this.update({connection:'error',pending:false,feedback:'Invalid server frame'});}
    };
    ws.onclose=e=>{if(gen!==this.generation)return;this.pending=null;window.clearTimeout(this.timeout);this.update({connection:e.reason==='Replaced'?'replaced':'disconnected',pending:false,feedback:e.reason==='Replaced'?'Connection replaced in another tab':'Connection closed. Reconnect to check your committed state.'});};
    ws.onerror=()=>{if(gen===this.generation)this.update({feedback:'Connection error'});};
  }
  send(action:Action):void{
    const v=this.state.view,ws=this.socket;if(!v||!ws||ws.readyState!==WebSocket.OPEN||this.state.connection!=='connected'||this.pending||this.awaitingRev!==null)return;
    const c:Command={v:1,type:'command',matchId:v.matchId,phaseId:v.phaseId,seenRev:v.rev,commandId:crypto.randomUUID(),action};
    this.pending=c;this.update({pending:true,feedback:''});ws.send(JSON.stringify(c));
    this.timeout=window.setTimeout(()=>{if(this.pending===c){this.pending=null;this.update({pending:false,feedback:'No receipt. Resync before retrying.'});ws.close();}},8000);
  }
}
