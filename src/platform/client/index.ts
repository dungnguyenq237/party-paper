import {RoomClient} from './room-client.js';
import type {RoomClientState} from './room-client.js';
import type {Action} from '../../contracts/protocol.js';

const get=<T extends HTMLElement>(id:string):T=>{const el=document.getElementById(id);if(!el)throw Error('Missing '+id);return el as T;};
const root=get('room'), form=get<HTMLFormElement>('join-form'), alias=get<HTMLInputElement>('alias'), code=get<HTMLInputElement>('code'), status=get('connection'), feedback=get('feedback'), timer=get('timer'), lang=get<HTMLButtonElement>('language');
let locale:'en'|'vi'='en',last:RoomClientState={connection:'idle',view:null,feedback:'',pending:false};
const vi:Record<string,string>={idle:'Chưa kết nối',connecting:'Đang kết nối',connected:'Đã kết nối',disconnected:'Mất kết nối',replaced:'Kết nối bị thay thế',error:'Lỗi',lobby:'Phòng chờ',active:'Bỏ phiếu kín',paused:'Tạm dừng',results:'Kết quả',abandoned:'Đã hủy',Ready:'Sẵn sàng',Unready:'Chưa sẵn sàng',Start:'Bắt đầu',Amber:'Hổ phách',Violet:'Tím',Claim:'Nhận vật phẩm',Rematch:'Chơi lại',Reconnect:'Kết nối lại',Disconnect:'Ngắt kết nối',Reset:'Rời giao diện','Your choice':'Lựa chọn của bạn','Choices committed':'Đã gửi lựa chọn','Host':'Chủ phòng','Room':'Phòng','No choice':'Chưa chọn','Create':'Tạo phòng','Join':'Tham gia','Alias':'Biệt danh','Room code':'Mã phòng','Local multiplayer fixture':'Phòng thử nghiệm nội bộ','Remaining':'Còn lại','Offline':'Mất kết nối','Online':'Đang kết nối','Role':'Vai trò','Player':'Người chơi','This is the synthetic local runtime, not a released game.':'Đây là máy chủ mô phỏng nội bộ, chưa phải game phát hành.'};
const tr=(s:string)=>locale==='vi'?(vi[s]??s):s;
const client=new RoomClient(s=>{last=s;render();});
function button(text:string,fn:()=>void,disabled=false):HTMLButtonElement{const b=document.createElement('button');b.type='button';b.textContent=tr(text);b.disabled=disabled;b.onclick=fn;return b;}
function node<K extends keyof HTMLElementTagNameMap>(tag:K,text:string):HTMLElementTagNameMap[K]{const el=document.createElement(tag);el.textContent=text;return el;}
let clockBase=0,clockRev=-1;
function render():void{
 const v=last.view;document.documentElement.lang=locale;lang.textContent=locale==='en'?'Tiếng Việt':'English';
 for(const el of document.querySelectorAll<HTMLElement>('[data-copy]'))el.textContent=tr(el.dataset.copy??'');
 status.textContent=tr(last.connection);feedback.textContent=last.feedback;
 const focused=document.activeElement instanceof HTMLElement?document.activeElement.dataset.action:undefined;
 form.hidden=v!==null;root.replaceChildren();timer.hidden=!v||v.deadlineAt===null;
 if(!v){form.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=last.connection==='connecting');return;}
 if(v.rev!==clockRev){clockRev=v.rev;clockBase=performance.now();}
 root.append(node('h2',tr('Room')+' '+v.code+' · '+tr(v.status)),node('p',tr('Role')+': '+tr(v.self.canHost?'Host':'Player')));
 const list=document.createElement('ul');for(const seat of v.seats)if(!seat.revoked)list.append(node('li',seat.alias+' · '+tr(seat.connected?'Online':'Offline')+(seat.ready?' · '+tr('Ready'):'')+(seat.id===v.hostSeatId?' · '+tr('Host'):'')));root.append(list);
 const actions=document.createElement('div');actions.className='actions';
 const locked=last.connection!=='connected'||last.pending;
 const add=(label:string,action:Action,disabled=false)=>{const b=button(label,()=>client.send(action),locked||disabled);b.dataset.action=label;actions.append(b);};
 if(v.status==='lobby'){add(v.seats.find(s=>s.id===v.self.seatId)?.ready?'Unready':'Ready',{kind:'ready',ready:!v.seats.find(s=>s.id===v.self.seatId)?.ready});if(v.self.canHost)add('Start',{kind:'start',expectedRev:v.rev},v.seats.filter(s=>!s.revoked).length<2||v.seats.some(s=>!s.revoked&&(!s.ready||!s.connected)));}
 if(v.status==='active'){add('Amber',{kind:'choose',choice:'amber'},v.self.choice!==null);add('Violet',{kind:'choose',choice:'violet'},v.self.choice!==null);add('Claim',{kind:'claim',itemVersion:v.itemVersion},v.claimedBy!==null);}
 if(v.status==='results'||v.status==='abandoned'){if(v.result)root.append(node('p',tr('Amber')+': '+v.result.amber+' · '+tr('Violet')+': '+v.result.violet));if(v.self.canHost)add('Rematch',{kind:'rematch',expectedRev:v.rev});}
 root.append(node('p',tr('Choices committed')+': '+v.submittedCount+' · '+tr('Your choice')+': '+tr(v.self.choice==='amber'?'Amber':v.self.choice==='violet'?'Violet':'No choice')));
 root.append(actions);
 const controls=document.createElement('div');controls.className='actions';controls.append(button('Reconnect',()=>void client.reconnect(),last.connection==='connecting'||last.connection==='connected'),button('Disconnect',()=>client.disconnect(),last.connection!=='connected'),button('Reset',()=>{clockRev=-1;client.reset();}));root.append(controls);
 if(focused)root.querySelector<HTMLButtonElement>('[data-action="'+focused+'"]:not(:disabled)')?.focus();
}
form.addEventListener('submit',e=>{e.preventDefault();const kind=e.submitter instanceof HTMLButtonElement&&e.submitter.value==='join'?'join':'create';void client.open(kind,alias.value,code.value.trim().toUpperCase());});
lang.onclick=()=>{locale=locale==='en'?'vi':'en';render();};
setInterval(()=>{const v=last.view;if(v&&v.deadlineAt!==null)timer.textContent=tr('Remaining')+': '+Math.max(0,Math.ceil((v.deadlineAt-v.serverNow-(performance.now()-clockBase))/1000))+'s';},250);
render();
