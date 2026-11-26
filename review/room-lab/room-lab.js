// Intentionally isolated synthetic browser model. No transport, server state, storage or real secrets.
const $=id=>document.getElementById(id);
const copy={
 en:{eyebrow:'FOUNDATION / F2 + F3',title:'Room Lab',description:'Try the room lifecycle with four fictional seats. This is a local browser simulation, not Friend Court or an online multiplayer room.',notice:'No accounts, network rooms, database or private real-world information. Switch seats to simulate players; data resets on reload.',room:'ROOM',phase:'PHASE',revision:'REVISION',host:'HOST',seats:'Seats',seatsHelp:'Choose the seat you want to control.',join:'Add a seat',actor:'YOUR VIEW',tools:'Test recovery',toolsHelp:'Replay the last accepted command, replace the connection, or advance the clock. These are simulated, not real server tests.',retry:'Retry last command',disconnect:'Disconnect seat',reconnect:'Reconnect seat',clock:'Advance 45s',reset:'Reset lab',log:'Event receipts',footer:'Party Paper · synthetic review fixture · no production release',lobby:'Lobby',active:'Sealed choice',paused:'Paused',results:'Results',ready:'Ready',unready:'Not ready',offline:'Offline',start:'Start round',claim:'Claim shared item',rematch:'Rematch',amber:'Amber',violet:'Violet',lobbyHint:'Mark every connected seat ready, then start as the host.',activeHint:'Choose privately or claim the shared item. Other seats cannot see your choice in their displayed view.',pausedHint:'Reconnect enough seats to continue, or advance the clock to abandon the fixture.',resultHint:'Only the total choices are revealed. The host can start a fresh lobby.',submitted:'Choices committed',mine:'Your choice',unclaimed:'Shared item available',claimed:'Shared item claimed by',waiting:'No choice yet',accepted:'Accepted',duplicate:'Duplicate: same receipt',rejected:'Rejected',replaced:'Connection replaced; previous generation fenced',disconnected:'Seat disconnected',advanced:'Clock advanced',resetDone:'Fresh lab',expired:'Round timed out',added:'Seat added',abandoned:'Round abandoned',hostChanged:'Host transferred',none:'None',switch:'Viewing'},
 vi:{eyebrow:'NỀN TẢNG / F2 + F3',title:'Phòng thử nghiệm',description:'Thử vòng đời phòng với bốn ghế giả lập. Đây là mô phỏng trong trình duyệt, không phải Friend Court hay phòng chơi trực tuyến.',notice:'Không có tài khoản, phòng mạng, cơ sở dữ liệu hay thông tin riêng tư thật. Đổi ghế để mô phỏng người chơi; tải lại sẽ xóa dữ liệu.',room:'PHÒNG',phase:'GIAI ĐOẠN',revision:'PHIÊN BẢN',host:'CHỦ PHÒNG',seats:'Người chơi',seatsHelp:'Chọn ghế bạn muốn điều khiển.',join:'Thêm ghế',actor:'GÓC NHÌN CỦA BẠN',tools:'Thử khôi phục',toolsHelp:'Gửi lại lệnh đã nhận, thay kết nối hoặc tua đồng hồ. Đây là mô phỏng, không phải kiểm thử máy chủ.',retry:'Gửi lại lệnh',disconnect:'Ngắt kết nối ghế',reconnect:'Kết nối lại',clock:'Tua 45 giây',reset:'Làm mới phòng',log:'Biên nhận sự kiện',footer:'Party Paper · dữ liệu giả lập · chưa phát hành',lobby:'Phòng chờ',active:'Bỏ phiếu kín',paused:'Tạm dừng',results:'Kết quả',ready:'Sẵn sàng',unready:'Chưa sẵn sàng',offline:'Mất kết nối',start:'Bắt đầu vòng',claim:'Nhận vật phẩm chung',rematch:'Chơi lại',amber:'Hổ phách',violet:'Tím',lobbyHint:'Đánh dấu sẵn sàng cho tất cả các ghế đang kết nối, sau đó bắt đầu với tư cách chủ phòng.',activeHint:'Chọn kín hoặc nhận vật phẩm chung. Góc nhìn của ghế khác không hiển thị lựa chọn của bạn.',pausedHint:'Kết nối lại đủ ghế để tiếp tục, hoặc tua đồng hồ để hủy vòng.',resultHint:'Chỉ công bố tổng số phiếu. Chủ phòng có thể tạo phòng chờ mới.',submitted:'Đã gửi lựa chọn',mine:'Lựa chọn của bạn',unclaimed:'Vật phẩm chung còn trống',claimed:'Vật phẩm thuộc về',waiting:'Chưa chọn',accepted:'Đã nhận',duplicate:'Lệnh trùng: cùng biên nhận',rejected:'Từ chối',replaced:'Đã thay kết nối; khóa thế hệ cũ',disconnected:'Ghế mất kết nối',advanced:'Đã tua đồng hồ',resetDone:'Phòng mới',expired:'Hết thời gian',added:'Đã thêm ghế',abandoned:'Đã hủy vòng',hostChanged:'Đã đổi chủ phòng',none:'Không có',switch:'Đang xem'}
};
let lang='en',state,selected=0,last=null,events=[],message='resetDone';
const names=['Alex','Minh','Sam','Linh','Kai','An'];
const seat=i=>({id:i,name:names[i],ready:false,connected:true,generation:1,choice:null});
function fresh(){state={status:'lobby',rev:1,epoch:1,host:0,deadline:0,remaining:0,pauseUsed:false,clock:0,claimed:null,seats:[0,1,2,3].map(seat)};selected=0;last=null;events=[];message='resetDone';render();}
const tr=k=>copy[lang][k]??k;
function record(key,detail=''){message=key;events.unshift({rev:state.rev,key,detail});events=events.slice(0,16);}
function finish(reason){state.status='results';state.abandoned=reason==='abandoned';state.deadline=0;record(reason);}
function commit(action,value){
 const s=state.seats[selected];if(!s.connected){record('rejected','OFFLINE');return render();}
 if(action==='ready'&&state.status==='lobby')s.ready=!s.ready;
 else if(action==='start'&&state.status==='lobby'&&state.host===selected&&state.seats.length>=2&&state.seats.every(x=>x.connected&&x.ready)){state.status='active';state.epoch++;state.deadline=state.clock+45000;}
 else if(action==='choose'&&state.status==='active'&&s.choice===null){s.choice=value;if(state.seats.every(x=>x.choice!==null))finish('accepted');}
 else if(action==='claim'&&state.status==='active'&&state.claimed===null)state.claimed=selected;
 else if(action==='rematch'&&state.status==='results'&&state.host===selected){state.status='lobby';state.epoch++;state.claimed=null;state.pauseUsed=false;state.abandoned=false;state.seats.forEach(x=>{x.choice=null;x.ready=false;});}
 else{record('rejected',action.toUpperCase());return render();}
 state.rev++;last={rev:state.rev,action,seat:selected,generation:s.generation};record('accepted',action.toUpperCase());render();
}
function elect(){if(state.seats[state.host]?.connected)return;const next=state.seats.find(x=>x.connected);if(next){state.host=next.id;record('hostChanged');}}
function progress(){const n=state.seats.filter(x=>x.connected).length;
 if(state.status==='active'&&n<2){if(state.pauseUsed)finish('abandoned');else{state.pauseUsed=true;state.remaining=Math.max(0,state.deadline-state.clock);state.status='paused';state.deadline=state.clock+90000;}}
 if(state.status==='paused'&&n>=2&&state.clock<state.deadline){state.status='active';state.deadline=state.clock+state.remaining;}
 if(state.status==='paused'&&state.clock>=state.deadline)finish('abandoned');else if(state.status==='active'&&state.clock>=state.deadline)finish('expired');
}
function action(label,fn,disabled=false){const b=document.createElement('button');b.type='button';b.textContent=tr(label);b.disabled=disabled;b.addEventListener('click',fn);$('actions').append(b);}
function render(){
 document.documentElement.lang=lang;$('language').textContent=lang==='en'?'Tiếng Việt':'English';
 const labels={'eyebrow':'eyebrow','description':'description','notice':'notice','room-label':'room','phase-label':'phase','revision-label':'revision','host-label':'host','seats-title':'seats','seats-help':'seatsHelp','join':'join','actor-label':'actor','tools-title':'tools','tools-help':'toolsHelp','retry':'retry','disconnect':'disconnect','reconnect':'reconnect','clock':'clock','reset':'reset','log-title':'log','footer':'footer','amber-label':'amber','violet-label':'violet'};
 for(const [id,key] of Object.entries(labels))$(id).textContent=tr(key);
 $('title').firstChild.textContent=tr('title');
 const s=state.seats[selected];$('phase').textContent=tr(state.status);$('revision').textContent=String(state.rev);$('host').textContent=state.seats[state.host]?.name??tr('none');$('actor').textContent=s.name;
 $('seats').replaceChildren();for(const x of state.seats){const b=document.createElement('button');b.type='button';b.className='seat';b.setAttribute('aria-pressed',String(x.id===selected));b.append(document.createTextNode(x.name+(x.id===state.host?' ★':'')));const status=document.createElement('span');status.textContent=tr(!x.connected?'offline':x.ready?'ready':'unready');b.append(status);b.addEventListener('click',()=>{selected=x.id;render();});$('seats').append(b);}
 $('join').disabled=state.status!=='lobby'||state.seats.length>=6;
 $('instruction').textContent=tr(({lobby:'lobbyHint',active:'activeHint',paused:'pausedHint',results:'resultHint'})[state.status]);$('actions').replaceChildren();
 $('choices').hidden=state.status!=='active';$('amber').disabled=$('violet').disabled=!s.connected||s.choice!==null;
 if(state.status==='lobby'){action(s.ready?'unready':'ready',()=>commit('ready'),!s.connected);action('start',()=>commit('start'),selected!==state.host||!state.seats.every(x=>x.connected&&x.ready));}
 if(state.status==='active')action('claim',()=>commit('claim'),!s.connected||state.claimed!==null);
 if(state.status==='results')action('rematch',()=>commit('rematch'),selected!==state.host||!s.connected);
 const committed=state.seats.filter(x=>x.choice!==null).length;let counts=tr('submitted')+': '+committed+'/'+state.seats.length+' · '+tr('mine')+': '+tr(s.choice??'waiting');
 if(state.status==='results'&&!state.abandoned)counts=tr('amber')+': '+state.seats.filter(x=>x.choice==='amber').length+' · '+tr('violet')+': '+state.seats.filter(x=>x.choice==='violet').length;
 if(state.status==='results'&&state.abandoned)counts=tr('abandoned');
 $('counts').textContent=counts+(state.status==='active'?' · '+(state.claimed===null?tr('unclaimed'):tr('claimed')+' '+state.seats[state.claimed].name):'');
 $('feedback').textContent=tr(message);$('retry').disabled=last===null;$('disconnect').disabled=!s.connected;$('reconnect').disabled=false;
 $('log').replaceChildren();for(const e of events){const li=document.createElement('li');li.textContent='r'+e.rev+' · '+tr(e.key)+(e.detail?' · '+e.detail:'');$('log').append(li);}
}
$('language').addEventListener('click',()=>{lang=lang==='en'?'vi':'en';render();});$('join').addEventListener('click',()=>{if(state.status!=='lobby'||state.seats.length>=6)return;state.seats.push(seat(state.seats.length));state.rev++;record('added');render();});
$('amber').addEventListener('click',()=>commit('choose','amber'));$('violet').addEventListener('click',()=>commit('choose','violet'));
$('retry').addEventListener('click',()=>{if(!last)return;const s=state.seats[last.seat];record(s.connected&&s.generation===last.generation?'duplicate':'rejected','r'+last.rev);render();});
$('disconnect').addEventListener('click',()=>{state.seats[selected].connected=false;state.rev++;record('disconnected');elect();progress();render();});
$('reconnect').addEventListener('click',()=>{const s=state.seats[selected];s.connected=true;s.generation++;state.rev++;record('replaced');progress();render();});
$('clock').addEventListener('click',()=>{state.clock+=45000;state.rev++;record('advanced');progress();render();});$('reset').addEventListener('click',fresh);fresh();
