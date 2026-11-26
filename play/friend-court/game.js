import {scene} from '../shared/scene.js';
import {createShell,el,button,group,panel,grid,list,stat,label,rules,shuffled} from '../shared/ui.js';
import {hearingScore} from '../shared/rules.js';
import {dockets} from './dockets.js';

const words={
en:{hearing:'Hearing',case:'Fictional docket',evidence:'Exhibit',remedy:'Remedy',clerk:'Clerk',advocate:'Advocate',juror:'Juror',replace:'Request new docket',accept:'Accept docket',draw:'Both advocates approve the fictional docket or request one replacement. Only one replacement per hearing.',arg:'Make your case',argHelp:'Speak aloud or write one short fictional argument. You can always pass. No real accusations.',spoken:'I spoke',submit:'Submit text',pass:'Pass',typed:'Typed argument',conceal:'Conceal text',concealed:'Text concealed',said:'Spoken argument',passed:'Passed',voting:'Sealed jury ballot',votingHelp:'Pass the device to each juror. No individual votes are revealed.',vote:'Choose the remedy you support',abstain:'Abstain',verdict:'Verdict',noScore:'No points awarded',tie:'Shared point',winner:'Point awarded to',votes:'Votes',score:'Score',points:'Points',final:'Final verdict',leaders:'Winner(s)',nextHearing:'Next hearing',result:'See final scores',reserve:'Replacement used',read:'Read the case aloud',review:'Read the arguments',ballot:'Submit private ballot',select:'Choose one remedy or abstain',zero:'No votes',argLabel:'Argument (max 180 characters)',rules:['Everyone advocates twice and juries the other hearings. The clerk also votes.','The advocates may request one replacement before arguments.','Each advocate may speak, type or pass; jurors privately vote A, B or abstain.','A nonempty tie awards both participating advocates one point. A sole active advocate needs a strict majority. Both passes or all abstentions score zero.','Highest total wins, ties shared. Use fictional cases only.']},
vi:{hearing:'Phiên xử',case:'Hồ sơ hư cấu',evidence:'Vật chứng',remedy:'Cách xử lý',clerk:'Thư ký',advocate:'Người tranh luận',juror:'Bồi thẩm',replace:'Yêu cầu đổi đề',accept:'Chấp nhận đề',draw:'Hai bên đọc đề hư cấu hoặc yêu cầu đổi đề. Chỉ đổi một lần mỗi phiên.',arg:'Trình bày lý lẽ',argHelp:'Nói thành tiếng hoặc viết một lý lẽ hư cấu ngắn. Có thể bỏ lượt. Không cáo buộc người thật.',spoken:'Tôi đã nói',submit:'Gửi lý lẽ',pass:'Bỏ lượt',typed:'Lý lẽ viết',conceal:'Ẩn nội dung',concealed:'Nội dung đã ẩn',said:'Lý lẽ nói',passed:'Bỏ lượt',voting:'Bỏ phiếu kín',votingHelp:'Chuyền thiết bị cho từng bồi thẩm. Không công bố phiếu cá nhân.',vote:'Chọn cách xử lý bạn ủng hộ',abstain:'Không chọn',verdict:'Phán quyết',noScore:'Không có điểm',tie:'Cùng được điểm',winner:'Điểm thuộc về',votes:'Phiếu',score:'Điểm',points:'Điểm',final:'Phán quyết cuối',leaders:'Người thắng',nextHearing:'Phiên tiếp theo',result:'Xem điểm cuối',reserve:'Đã đổi đề',read:'Đọc to tình huống',review:'Đọc lý lẽ',ballot:'Gửi phiếu kín',select:'Chọn một cách xử lý hoặc không chọn',zero:'Không có phiếu',argLabel:'Lý lẽ (tối đa 180 ký tự)',rules:['Mỗi người tranh luận hai lần và làm bồi thẩm các phiên khác. Thư ký cũng bỏ phiếu.','Hai bên có thể yêu cầu đổi đề một lần trước khi tranh luận.','Mỗi bên có thể nói, viết hoặc bỏ lượt; bồi thẩm bỏ phiếu kín A, B hoặc không chọn.','Hòa có phiếu: hai bên tham gia đều được một điểm. Nếu một bên bỏ lượt, bên còn lại cần nhiều phiếu hơn. Cả hai bỏ lượt hoặc không có phiếu thì không có điểm.','Điểm cao nhất thắng, đồng hạng cùng thắng. Chỉ dùng tình huống hư cấu.']}
};
let state,previousIds=[],rotation=0;
const t=(api,k)=>words[api.lang][k]??k;
function newGame(names,api,rematch=false){
 if(!rematch){previousIds=[];rotation=0;}
 const unused=shuffled(dockets.map((_,i)=>i).filter(i=>!previousIds.includes(i)));
 const used=shuffled(previousIds);
 const deck=[...unused,...used];
 state={names:[...names],scores:names.map(()=>0),deck,history:[],i:0,stage:'brief',current:null};
 begin(api);
}
function begin(api){
 const n=state.names.length,a=(state.i+rotation)%n,b=(a+1)%n;
 state.current={a,b,clerk:(b+1)%n,jury:Array.from({length:n},(_,i)=>i).filter(i=>i!==a&&i!==b),
  docket:state.deck.shift(),replaced:false,args:{},order:state.i%2?[b,a]:[a,b],argIndex:0,draft:'',votes:[],ballotIndex:0};
 state.stage='brief';api.redraw();
}
function brief(api){
 const c=state.current,copy=dockets[c.docket][api.lang];
 const h=api.heading(t(api,'hearing')+' '+(state.i+1)+' / '+state.names.length,t(api,'clerk')+': '+state.names[c.clerk]);
 const remedies=grid(...[['A',c.a,copy[2]],['B',c.b,copy[3]]].map(([side,seat,text])=>{const node=el('div','','remedy');node.append(el('h3',side+' · '+state.names[seat]),el('p',text));return node;}));
 const casePanel=panel(t(api,'case'),el('p',copy[0]),el('p',t(api,'evidence')+': '+copy[1],'muted'),remedies);casePanel.classList.add('docket');return [h,casePanel];
}
function argumentsView(api){
 const c=state.current;const items=[];
 for(const p of [c.a,c.b])if(c.args[p]){const arg=c.args[p];const text=arg.kind==='text'?(arg.hidden?t(api,'concealed'):arg.text):t(api,arg.kind==='speak'?'said':'passed');const row=el('div','','remedy');row.append(el('h3',state.names[p]),el('p',text));if(arg.kind==='text'&&!arg.hidden)row.append(button(t(api,'conceal'),()=>{arg.hidden=true;api.redraw();},{secondary:true}));items.push(row);}
 return items.length?panel(t(api,'review'),grid(...items)):el('div');
}
function accept(api){api.clearClock();state.stage='argument';api.redraw();}
function submitArgument(api,kind,text=''){
 if(state.stage!=='argument')return;
 api.clearClock();const c=state.current,p=c.order[c.argIndex];c.args[p]={kind,text,hidden:false};c.argIndex++;c.draft='';
 if(c.argIndex<2){api.redraw();return;}
 if(c.args[c.a].kind==='pass'&&c.args[c.b].kind==='pass'){finish(api);return;}
 state.stage='jury';api.redraw();
}
function finish(api){api.clearClock();const c=state.current;const result=hearingScore(c.args[c.a]?.kind!=='pass',c.args[c.b]?.kind!=='pass',c.votes);
 state.scores[c.a]+=result.a;state.scores[c.b]+=result.b;c.result=result;state.history.push({docket:c.docket,result});state.stage='verdict';api.redraw();
}
function courtScene(api){
 const c=state.current,vi=api.lang==='vi',stage=state.stage;
 const hearing=t(api,'hearing')+' '+(state.i+1)+' / '+state.names.length;
 const progress={current:state.i+1,total:state.names.length,label:hearing};
 const privateView=stage==='jury'||stage==='ballot';
 if(privateView){const board=scene({theme:'court',stage,cast:[{role:'jury',mood:stage==='ballot'?'think':'idle',label:vi?'Bồi thẩm':'Juror'}],headline:vi?'PHIẾU KÍN · CHỈ BẠN':'SEALED BALLOT · YOUR VIEW',privateView:true,progress});board.dataset.cue=stage+'-'+state.i+'-'+c.ballotIndex;return board;}
 const aMood=stage==='argument'?(c.order[c.argIndex]===c.a?'speak':'think'):stage==='verdict'?(c.result.a?'celebrate':c.result.b?'sad':'idle'):'idle';
 const bMood=stage==='argument'?(c.order[c.argIndex]===c.b?'speak':'think'):stage==='verdict'?(c.result.b?'celebrate':c.result.a?'sad':'idle'):'idle';
 const judgeMood=stage==='brief'?'speak':stage==='verdict'||stage==='final'?'celebrate':'idle';
 const outcome=stage==='verdict'?(c.result.a&&c.result.b?'tie':c.result.a||c.result.b?'success':'neutral'):stage==='final'?'success':null;
 const headline=stage==='brief'?(vi?'MỞ PHIÊN XỬ':'COURT IN SESSION'):stage==='argument'?(vi?'TRANH LUẬN':'THE ARGUMENTS'):stage==='verdict'?(vi?'TUYÊN ÁN':'THE VERDICT'):vi?'KẾT THÚC':'COURT ADJOURNED';
 const board=scene({theme:'court',stage,headline,progress,outcome,cast:[
 {role:'advocateA',mood:aMood,label:state.names[c.a],caption:vi?'Bên A':'Advocate A'},
 {role:'judge',mood:judgeMood,label:vi?'Thẩm phán':'Judge',caption:vi?'Phiên xử':'Presiding'},
 {role:'advocateB',mood:bMood,label:state.names[c.b],caption:vi?'Bên B':'Advocate B'},
 {role:'jury',mood:stage==='argument'?'react':stage==='verdict'?'celebrate':'idle',label:vi?'Bồi thẩm đoàn':'Jury',caption:state.names.length-2+' '+(vi?'người':'jurors')}
 ]});board.dataset.cue=stage+'-'+state.i+'-'+c.argIndex;return board;
}
function render(api){
 const c=state.current,w=k=>t(api,k),base=()=>brief(api);
 if(state.stage==='brief'){
  api.timer('draw-'+state.i,10,()=>accept(api));
  const change=()=>{if(c.replaced||state.deck.length<state.names.length-state.i)return;c.docket=state.deck.shift();c.replaced=true;api.redraw();};
  api.show(...base(),panel(w('read'),el('p',w('draw')),group(button(w('accept'),()=>accept(api),{id:'accept'}),button(c.replaced?w('reserve'):w('replace'),change,{secondary:true,disabled:c.replaced||state.deck.length<state.names.length-state.i,id:'replace'}))));return;
 }
 if(state.stage==='argument'){
  const p=c.order[c.argIndex],side=p===c.a?'A':'B',copy=dockets[c.docket][api.lang];api.timer('arg-'+state.i+'-'+c.argIndex,25,()=>submitArgument(api,'pass'));
  const area=el('textarea');area.id='argument';area.maxLength=180;area.value=c.draft;area.placeholder=w('argHelp');
  const send=button(w('submit'),()=>{const text=area.value.trim();if(text)submitArgument(api,'text',[...text].slice(0,180).join(''));},{id:'submit-text',disabled:!area.value.trim()});area.oninput=()=>{c.draft=area.value;send.disabled=!area.value.trim();};
  api.show(...base(),argumentsView(api),panel(w('arg')+' · '+state.names[p]+' ('+side+')',el('p',w('remedy')+': '+copy[side==='A'?2:3]),el('p',w('argHelp'),'muted'),label(w('argLabel'),area),group(button(w('spoken'),()=>submitArgument(api,'speak'),{id:'speak'}),send,button(w('pass'),()=>submitArgument(api,'pass'),{secondary:true,id:'pass'}))));return;
 }
 if(state.stage==='jury'){
  api.clearClock();const name=state.names[c.jury[c.ballotIndex]];
  api.handoff(name,()=>{state.stage='ballot';api.redraw();});return;
 }
 if(state.stage==='ballot'){
  const name=state.names[c.jury[c.ballotIndex]],copy=dockets[c.docket][api.lang];
  const choose=v=>{if(state.stage!=='ballot')return;api.clearClock();c.votes.push(v);c.ballotIndex++;if(c.ballotIndex===c.jury.length)finish(api);else{state.stage='jury';api.redraw();}};
  api.timer('vote-'+state.i+'-'+c.ballotIndex,15,()=>choose('abstain'));
  api.show(api.heading(w('vote')+' · '+name,w('votingHelp'),true),panel(w('case'),el('p',copy[0]),el('p',w('evidence')+': '+copy[1],'muted')),argumentsView(api),panel(w('select'),grid(button('A · '+copy[2],()=>choose('A'),{className:'choice',id:'vote-a'}),button('B · '+copy[3],()=>choose('B'),{className:'choice',id:'vote-b'})),button(w('abstain'),()=>choose('abstain'),{secondary:true,id:'abstain'})));return;
 }
 if(state.stage==='verdict'){
  const r=c.result,award=r.a&&r.b?w('tie'):r.a||r.b?w('winner')+' '+state.names[r.a?c.a:c.b]:w('noScore');
  const stats=el('div','','stats');stats.append(stat('A',r.A),stat('B',r.B),stat(w('abstain'),r.abstain));
  const next=()=>{if(state.i+1>=state.names.length){state.stage='final';previousIds=[...new Set([...previousIds,...state.history.map(x=>x.docket)])];api.redraw();}else{state.i++;begin(api);}};
  api.show(...base(),panel(w('verdict'),el('p',award,'stamp'),stats,button(state.i+1>=state.names.length?w('result'):w('nextHearing'),next,{id:'next-hearing'})));return;
 }
 if(state.stage==='final'){
  const order=state.names.map((name,i)=>({name,score:state.scores[i]})).sort((a,b)=>b.score-a.score);
  const top=order.filter(p=>p.score===order[0].score).map(p=>p.name).join(', ');
  const table=el('table','','table');const caption=el('caption',w('score'));table.append(caption);for(const p of order){const row=el('tr');row.append(el('th',p.name),el('td',String(p.score)));table.append(row);}
  api.show(api.heading(w('final'),api.tr('complete')),panel(w('leaders'),el('p',top,'stamp'),table,group(button(api.tr('rematch'),()=>{rotation=(rotation+1)%state.names.length;newGame(state.names,api,true);},{id:'rematch'}),button(api.tr('reset'),api.setup,{secondary:true}))));return;
 }
}
const shell=createShell({title:{en:'Friend Court',vi:'Phiên tòa bạn bè'},description:{en:'A fictional dispute. Two ridiculous remedies. One jury of your friends. Rotate roles, make your case and vote in secret.',vi:'Một tình huống hư cấu. Hai cách xử lý hài hước. Bồi thẩm đoàn là bạn bè. Đổi vai, tranh luận và bỏ phiếu kín.'},theme:'court',onStart:newGame,onRender:render,getScene:courtScene});shell.rules={en:words.en.rules,vi:words.vi.rules};shell.redraw();
