import {scene} from '../shared/scene.js';
import {createShell,el,button,group,panel,grid,stat,rules,shuffled} from '../shared/ui.js';
import {roles,departments,events,targets,validateOrder,auditQuarter,rank} from '../shared/rules.js';

const words={
 en:{quarter:'Quarter',runway:'Company runway',brief:'Quarterly briefing',mandate:'Your secret mandate',credits:'Work credits',prestige:'Prestige',role:'Your role',power:'Role power',used:'Already used',available:'Available once this game',negotiate:'Negotiate together',negotiation:'Discuss how to meet both targets. Do not show your private mandate or promise your actual order.',commit:'Seal orders',order:'Allocate exactly two effort',remaining:'Effort remaining',seal:'Commit private order',default:'Use default order (no reward)',activate:'Activate role power',disable:'Keep power for later',audit:'Project audit',success:'Project succeeds',failure:'Project fails',total:'Aggregate effort',target:'Target',next:'Next quarter',end:'See results',survived:'Company survives',insolvent:'Company insolvent — everybody loses',winner:'Top prestige',ranking:'Final ranking',work:'Successful work quarters',dept:{D:'Delivery',T:'Trust',V:'Visibility'},roleNames:{Lead:'Lead',Engineer:'Engineer',QA:'QA',Steward:'Steward'},powers:{Lead:'+1 Delivery for project totals',Engineer:'Convert one Visibility into one base Delivery and one project-only bonus Delivery',QA:'+1 Trust for project totals',Steward:'+1 runway if the project succeeds'},event:{normal:'Normal quarter',crunch:'Delivery crunch (+1 D target)',audit:'Audit (+1 T target)',contract:'Small contract (+1 runway on success)'},rules:['Keep runway above zero through four quarters. If it reaches zero, everyone loses.','Each player has a public role, private mandate and one starting work credit. Allocate exactly two effort in each quarter.','Delivery and Trust keep the company alive. Visibility can spend existing work credits for prestige.','A successful project rewards work in the featured department; two work units replenish a credit.','Role powers are usable once; defaults help the company but award nothing personally.','At the end, four units toward your mandate give three bonus prestige. Ties use successful work quarters.']},
 vi:{quarter:'Quý',runway:'Quỹ duy trì công ty',brief:'Kế hoạch quý',mandate:'Nhiệm vụ bí mật',credits:'Tín chỉ công việc',prestige:'Uy tín',role:'Vai trò của bạn',power:'Năng lực',used:'Đã dùng',available:'Dùng một lần mỗi ván',negotiate:'Cùng thương lượng',negotiation:'Thảo luận cách đạt cả hai mục tiêu. Không tiết lộ nhiệm vụ bí mật hay lựa chọn thực tế.',commit:'Gửi lệnh kín',order:'Phân đúng hai đơn vị nỗ lực',remaining:'Nỗ lực còn lại',seal:'Gửi lệnh riêng',default:'Dùng lệnh mặc định (không thưởng)',activate:'Dùng năng lực vai',disable:'Giữ năng lực cho sau',audit:'Kiểm toán dự án',success:'Dự án thành công',failure:'Dự án thất bại',total:'Tổng nỗ lực',target:'Mục tiêu',next:'Quý tiếp theo',end:'Xem kết quả',survived:'Công ty sống sót',insolvent:'Công ty hết quỹ — tất cả thua',winner:'Uy tín cao nhất',ranking:'Xếp hạng cuối',work:'Quý đóng góp thành công',dept:{D:'Giao hàng',T:'Niềm tin',V:'Nổi bật'},roleNames:{Lead:'Trưởng nhóm',Engineer:'Kỹ sư',QA:'QA',Steward:'Điều phối'},powers:{Lead:'+1 Giao hàng cho tổng dự án',Engineer:'Đổi một Nổi bật thành một Giao hàng cơ bản và một Giao hàng thưởng',QA:'+1 Niềm tin cho tổng dự án',Steward:'+1 quỹ nếu dự án thành công'},event:{normal:'Quý bình thường',crunch:'Giao gấp (+1 mục tiêu D)',audit:'Kiểm toán (+1 mục tiêu T)',contract:'Hợp đồng nhỏ (+1 quỹ nếu thành công)'},rules:['Giữ quỹ trên 0 qua bốn quý. Quỹ bằng 0 thì tất cả thua.','Mỗi người có vai công khai, nhiệm vụ bí mật và một tín chỉ ban đầu. Phân đúng hai nỗ lực mỗi quý.','Giao hàng và Niềm tin giúp công ty sống sót. Nổi bật đổi tín chỉ có sẵn lấy uy tín.','Dự án thành công thưởng bộ phận trọng tâm; hai đơn vị làm việc tạo thêm tín chỉ.','Năng lực vai chỉ dùng một lần; lệnh mặc định giúp công ty nhưng không có thưởng riêng.','Cuối ván, đủ bốn đơn vị cho nhiệm vụ được cộng ba uy tín. Hòa thì so quý đóng góp thành công.']}
};
let state;
const copy=api=>words[api.lang];
const tr=(api,key)=>copy(api)[key]??key;
const dept=(api,key)=>copy(api).dept[key];
const role=(api,key)=>copy(api).roleNames[key];
function start(names,api){
 const roleDeck=shuffled(names.map((_,i)=>roles[i%roles.length]));
 state={players:names.map((name,i)=>({name,role:roleDeck[i],mandate:departments[crypto.getRandomValues(new Uint32Array(1))[0]%3],credits:1,prestige:0,used:false,earned:[0,0,0],successfulWork:0})),runway:2,q:0,stage:'brief',index:0,orders:[],history:[],draft:null};
 api.redraw();
}
function stats(api){const n=el('div','','stats');const [d,t]=targets(state.players.length,events[state.q]);const runway=stat(tr(api,'runway'),state.runway+' / 4');runway.append(runwayTrack(state.runway,tr(api,'runway')));n.append(runway,stat(dept(api,'D'),d),stat(dept(api,'T'),t));return n;}
function brief(api){const w=copy(api);const rolesList=el('ul','','list');for(const p of state.players)rolesList.append(el('li',p.name+' · '+role(api,p.role)));
 return [api.heading(tr(api,'quarter')+' '+(state.q+1)+' / 4',w.event[events[state.q]]),stats(api),panel(tr(api,'brief'),el('p',api.lang==='en'?'Featured department: '+dept(api,departments[state.q%2]):'Bộ phận trọng tâm: '+dept(api,departments[state.q%2])),rolesList)];}
function prepareOrders(api){api.clearClock();state.index=0;state.orders=[];state.stage='handoff';state.draft=null;api.redraw();}
function finishOrder(api,order){
 if(state.stage!=='order')return;
 api.clearClock();const p=state.players[state.index];if(order!==null&&!validateOrder(order,p))return;
 state.orders.push(order);state.index++;
 if(state.index>=state.players.length){const audit=auditQuarter(state.players,state.orders,state.runway,events[state.q],state.q);state.players=audit.players;state.runway=audit.runway;state.history.push({event:events[state.q],...audit,players:undefined});state.stage='audit';state.draft=null;}
 else{state.stage='handoff';state.draft=null;}
 api.redraw();
}
function companyScene(api){
 const stage=state.stage,vi=api.lang==='vi',privateView=['mandate-handoff','mandate','handoff','order'].includes(stage);
 const progress={current:state.q+1,total:4,label:tr(api,'quarter')+' '+(state.q+1)+' / 4'};
 if(privateView){const p=state.players[state.index];const board=scene({theme:'corporate',stage,headline:vi?'HỒ SƠ RIÊNG':'PRIVATE WORKSTATION',privateView:true,progress,cast:[{role:p.role,mood:stage==='order'?'think':'idle',label:p.name,caption:role(api,p.role)}]});board.dataset.cue=stage+'-'+state.q+'-'+state.index;return board;}
 const audit=stage==='audit'?state.history.at(-1):null,outcome=audit?(audit.success?'success':'failure'):stage==='results'?(state.runway>0?'success':'failure'):null;
 const headline=stage==='audit'?(vi?'KIỂM TOÁN':'QUARTERLY AUDIT'):stage==='results'?(vi?'TỔNG KẾT':'FINAL REVIEW'):stage==='negotiate'?(vi?'THƯƠNG LƯỢNG':'STRATEGY MEETING'):(vi?'KẾ HOẠCH QUÝ':'THE QUARTERLY BRIEF');
 const board=scene({theme:'corporate',stage,headline,progress,outcome,cast:roles.map(r=>{const p=state.players.find(x=>x.role===r);return {role:r,label:p?.name??role(api,r),caption:role(api,r),mood:outcome==='success'?'celebrate':outcome==='failure'?'sad':stage==='negotiate'?(r==='Lead'?'speak':'think'):'idle'};})});board.dataset.cue=stage+'-'+state.q;return board;
}
function runwayTrack(value,label){const track=el('div','','runway-track');track.setAttribute('role','img');track.setAttribute('aria-label',label+' '+value+' / 4');for(let i=0;i<4;i++){const pip=el('i');pip.dataset.filled=String(i<value);track.append(pip);}return track;}
function effortPips(remaining){const track=el('div','','effort-pips');track.setAttribute('aria-hidden','true');for(let i=0;i<2;i++){const pip=el('i');pip.dataset.used=String(i>=remaining);track.append(pip);}return track;}
function render(api){
 const w=copy(api),t=k=>tr(api,k),event=events[state.q];
 if(state.stage==='brief'){
  // Private briefing happens before negotiation, so each participant knows their incentives.
  state.index=0;api.show(...brief(api),panel(t('negotiate'),el('p',t('negotiation')),button(api.tr('continue'),()=>{state.stage='mandate-handoff';api.redraw();},{id:'brief-next'})));return;
 }
 if(state.stage==='mandate-handoff'){
  api.handoff(state.players[state.index].name,()=>{state.stage='mandate';api.redraw();});return;
 }
 if(state.stage==='mandate'){
  const p=state.players[state.index];api.show(api.heading(p.name,t('mandate'),true),panel(dept(api,p.mandate),el('p',t('role')+': '+role(api,p.role)),el('p',w.powers[p.role]),el('p',t('credits')+': '+p.credits+' · '+t('prestige')+': '+p.prestige),button(api.tr('continue'),()=>{state.index++;if(state.index===state.players.length){state.stage='negotiate';state.index=0;}else state.stage='mandate-handoff';api.redraw();},{id:'mandate-next'})));return;
 }
 if(state.stage==='negotiate'){
  api.timer('negotiation-'+state.q,60,()=>prepareOrders(api));
  api.show(...brief(api),panel(t('negotiate'),el('p',t('negotiation')),button(t('commit'),()=>prepareOrders(api),{id:'commit-orders'})));return;
 }
 if(state.stage==='handoff'){
  api.handoff(state.players[state.index].name,()=>{state.stage='order';state.draft={units:[0,0,0],power:false};api.redraw();});return;
 }
 if(state.stage==='order'){
  const p=state.players[state.index],draft=state.draft;
  api.timer('order-'+state.q+'-'+state.index,30,()=>finishOrder(api,null));
  const remaining=2-draft.units.reduce((a,b)=>a+b,0);const controls=el('div');
  departments.forEach((d,i)=>{
   const row=el('div','','alloc'),minus=button('−',()=>{draft.units[i]--;if(p.role==='Engineer'&&!draft.units[2])draft.power=false;api.redraw();},{secondary:true,disabled:draft.units[i]===0,id:'minus-'+d});
   minus.setAttribute('aria-label','− '+dept(api,d));const plus=button('+',()=>{draft.units[i]++;api.redraw();},{secondary:true,disabled:remaining===0,id:'plus-'+d});plus.setAttribute('aria-label','+ '+dept(api,d));
   row.append(el('strong',dept(api,d)),minus,el('strong',String(draft.units[i])),plus);controls.append(row);
  });
  const canPower=!p.used&&(p.role!=='Engineer'||draft.units[2]>0);
  const power=button(draft.power?t('disable'):t('activate'),()=>{draft.power=!draft.power;api.redraw();},{secondary:true,disabled:!canPower,id:'power'});power.setAttribute('aria-pressed',String(draft.power));
  const top=el('div','','stats');top.append(stat(t('credits'),p.credits),stat(t('prestige'),p.prestige),stat(t('remaining'),remaining));
  api.show(api.heading(p.name+' · '+t('quarter')+' '+(state.q+1),t('order'),true),stats(api),panel(t('mandate')+': '+dept(api,p.mandate),el('p',t('role')+': '+role(api,p.role)),top,effortPips(remaining),controls,el('p',w.powers[p.role]+' · '+t(p.used?'used':'available'),'muted'),power,group(button(t('seal'),()=>finishOrder(api,{units:[...draft.units],power:draft.power}),{disabled:!validateOrder(draft,p),id:'seal'}),button(t('default'),()=>finishOrder(api,null),{secondary:true,id:'default'}))));return;
 }
 if(state.stage==='audit'){
  const a=state.history.at(-1),totals=el('div','','stats');
  departments.forEach((d,i)=>totals.append(stat(dept(api,d),a.totals[i]+(i<2?' / '+a.target[i]:''))));
  const rolesUsed=a.powers.map(r=>role(api,r)).join(', ')||'—';
  const terminal=state.runway===0||state.q===3;
  api.show(api.heading(t('audit')+' · '+t('quarter')+' '+(state.q+1),w.event[event]),panel(t(a.success?'success':'failure'),el('p',t('runway')+': '+state.runway+' / 4','stamp'),runwayTrack(state.runway,t('runway')),el('h3',t('total')),totals,el('p',t('power')+': '+rolesUsed),button(t(terminal?'end':'next'),()=>{if(terminal)state.stage='results';else{state.q++;state.stage='brief';}api.redraw();},{id:'audit-next'})));return;
 }
 if(state.stage==='results'){
  const sorted=rank(state.players),leaders=sorted.filter(p=>p.score===sorted[0].score&&p.successfulWork===sorted[0].successfulWork).map(p=>p.name).join(', ');
  const table=el('table','','table'),head=el('tr');for(const title of [api.lang==='en'?'Player':'Người chơi',t('mandate'),t('prestige')])head.append(el('th',title));table.append(head);
  for(const p of sorted){const row=el('tr');row.append(el('th',p.name),el('td',dept(api,p.mandate)),el('td',String(p.score)));table.append(row);}
  const timeline=el('ul','','list');for(const [i,a] of state.history.entries())timeline.append(el('li',t('quarter')+' '+(i+1)+' · '+t(a.success?'success':'failure')+' · '+t('runway')+' '+a.runway));
  api.show(api.heading(t(state.runway>0?'survived':'insolvent'),api.tr('complete')),panel(state.runway>0?t('winner'):'',state.runway>0?el('p',leaders,'stamp'):el('p',t('insolvent')),table,timeline,group(button(api.tr('rematch'),()=>start(state.players.map(p=>p.name),api),{id:'rematch'}),button(api.tr('reset'),api.setup,{secondary:true}))));return;
 }
}
const shell=createShell({title:{en:'Corporate Chaos',vi:'Công ty hỗn loạn'},description:{en:'Keep a fictitious company alive for four quarters while pursuing a private promotion goal. Negotiate, seal two effort points, then audit the result.',vi:'Giữ công ty hư cấu sống sót qua bốn quý trong khi theo đuổi mục tiêu thăng tiến bí mật. Thương lượng, gửi hai điểm nỗ lực, rồi kiểm toán.'},theme:'corporate',onStart:start,onRender:render,getScene:companyScene});shell.rules={en:words.en.rules,vi:words.vi.rules};shell.redraw();
