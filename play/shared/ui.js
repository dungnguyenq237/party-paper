// Browser-only P0 components. No network, cookies, storage or production authority.
export const names=['Alex','Minh','Sam','Linh','Kai','An'];
export function el(tag,text='',className=''){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;}
export function button(text,fn,{secondary=false,disabled=false,id='',className=''}={}){const b=el('button',text,(secondary?'secondary ':'')+className);b.type='button';b.disabled=disabled;if(id)b.id=id;b.addEventListener('click',fn);return b;}
export function group(...nodes){const n=el('div','','actions');n.append(...nodes);return n;}
export function panel(title,...nodes){const n=el('section','','panel');if(title)n.append(el('h2',title));n.append(...nodes);return n;}
export function grid(...nodes){const n=el('div','','grid');n.append(...nodes);return n;}
export function list(items){const n=el('ul','','list');for(const item of items)n.append(el('li',item));return n;}
export function stat(label,value){const n=el('div','','stat');n.append(el('small',label),el('strong',String(value)));return n;}
export function label(text,input){const n=el('label');n.append(el('span',text),input);return n;}
export function field(value){const input=el('input');input.value=value;input.maxLength=24;input.required=true;input.autocomplete='off';return input;}
export function rules(title,items){const n=el('details','','rules');n.append(el('summary',title),list(items));return n;}
export function shuffled(items){const out=[...items];for(let i=out.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;}
export function cleanName(s,fallback){return [...s.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/gu,'').trim()].slice(0,24).join('')||fallback;}
const common={
en:{home:'Playtest studio',preview:'P0 PLAYTEST · SINGLE DEVICE',notice:'Pass the device between players. This is an offline-style browser prototype, not online multiplayer. Private screens prevent casual viewing only; do not enter sensitive information. Reload resets the game.',setup:'Set up your table',players:'Players',name:'Player',start:'Start playtest',manual:'Untimed / host-controlled',timed:'Timed turns',timing:'Turn timing',private:'Private handoff',hand:'Pass the device to',look:'Everyone else look away.',reveal:'Reveal my turn',continue:'Continue',next:'Next',reset:'Exit to setup',back:'All playtests',rules:'How to play',remaining:'Remaining',seconds:'s',shared:'Shared screen',round:'Round',complete:'Playtest complete',rematch:'Rematch',confirmExit:'End this playtest and return to setup?',notStored:'No results or personal data are stored or transmitted.',language:'Tiếng Việt',close:'Close'},
vi:{home:'Phòng chơi thử',preview:'THỬ NGHIỆM P0 · MỘT THIẾT BỊ',notice:'Chuyền thiết bị giữa người chơi. Đây là bản thử nghiệm trong trình duyệt, không phải chơi trực tuyến. Màn hình riêng chỉ tránh nhìn nhầm; không nhập dữ liệu nhạy cảm. Tải lại sẽ xóa ván.',setup:'Chuẩn bị bàn chơi',players:'Người chơi',name:'Người chơi',start:'Bắt đầu chơi thử',manual:'Không giới hạn / chủ bàn điều khiển',timed:'Có giới hạn thời gian',timing:'Thời gian lượt',private:'Chuyền thiết bị riêng',hand:'Chuyền thiết bị cho',look:'Những người khác vui lòng quay đi.',reveal:'Mở lượt của tôi',continue:'Tiếp tục',next:'Tiếp theo',reset:'Về màn hình chuẩn bị',back:'Các trò chơi thử',rules:'Cách chơi',remaining:'Còn lại',seconds:' giây',shared:'Màn hình chung',round:'Vòng',complete:'Hoàn thành ván thử',rematch:'Chơi lại',confirmExit:'Kết thúc ván và về màn hình chuẩn bị?',notStored:'Không lưu hoặc gửi kết quả hay dữ liệu cá nhân.',language:'English',close:'Đóng'}
};
export function createShell({title,description,theme,min=4,max=6,onStart,onRender}){
 let lang='en',timed=false,deadline=null,timeout=null,interval=null,onTimeout=null,phaseKey='',lastStage='',setupNames=names.slice(0,min),isPlaying=false;
 const header=document.querySelector('header'),main=document.querySelector('main'),footer=document.querySelector('footer');
 document.body.dataset.theme=theme;
 const tr=k=>common[lang][k]??k;
 const clock=el('span','','clock');clock.hidden=true;clock.setAttribute('role','timer');
 function clearClock(){clearTimeout(timeout);clearInterval(interval);timeout=null;interval=null;deadline=null;onTimeout=null;phaseKey='';clock.hidden=true;}
 function updateClock(){if(deadline!==null)clock.textContent=tr('remaining')+' '+Math.max(0,Math.ceil((deadline-performance.now())/1000))+tr('seconds');}
 function timer(key,seconds,callback){if(!timed){clearClock();return;}if(phaseKey===key&&deadline!==null){clock.hidden=false;updateClock();return;}
  clearClock();phaseKey=key;deadline=performance.now()+seconds*1000;onTimeout=callback;clock.hidden=false;updateClock();interval=setInterval(updateClock,250);timeout=setTimeout(()=>{const fn=onTimeout;clearClock();fn?.();},seconds*1000);}
 function chrome(){header.replaceChildren();const a=el('a','Party Paper / '+tr('home'),'brand');a.href='../';const actions=group(button(tr('language'),()=>{lang=lang==='en'?'vi':'en';draw();},{secondary:true,id:'language'}));header.append(a,actions);if(isPlaying){actions.append(button(tr('reset'),()=>{if(confirm(tr('confirmExit')))setup();},{secondary:true,id:'exit'}));}
  footer.textContent=tr('notStored');document.documentElement.lang=lang;}
 function heading(title,subtitle='',privateView=false){const h=el('section','','heading');h.append(el('p',privateView?tr('private'):tr('shared'),'eyebrow'),el('h1',title));if(subtitle)h.append(el('p',subtitle,'muted'));return h;}
 function draw(){chrome();if(isPlaying)onRender(api);else renderSetup();}
 function show(...nodes){const focusId=document.activeElement instanceof HTMLElement&&main.contains(document.activeElement)?document.activeElement.id:'';main.replaceChildren(...nodes);if(!clock.hidden)main.prepend(clock);const key=main.querySelector('h1,h2')?.textContent??'';if(lastStage!==key){lastStage=key;const h=main.querySelector('h1,h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}else if(focusId){const target=document.getElementById(focusId);if(target&&!target.disabled)target.focus({preventScroll:true});}}
 function handoff(name,reveal){clearClock();show(heading(tr('hand')+' '+name,tr('look'),true),panel('',button(tr('reveal'),reveal,{id:'reveal'}))); }
 function renderSetup(){const hero=el('section','','hero');hero.append(el('p',tr('preview'),'eyebrow'),el('h1',title[lang]),el('p',description[lang],'lede'),el('p',tr('notice'),'notice'));
  const count=el('select');count.id='player-count';for(let i=min;i<=max;i++){const option=el('option',String(i));option.value=String(i);option.selected=i===setupNames.length;count.append(option);}
  count.addEventListener('change',()=>{const n=Number(count.value);setupNames=Array.from({length:n},(_,i)=>setupNames[i]??names[i]??tr('name')+' '+(i+1));renderSetup();});
  const inputs=setupNames.map((name,i)=>{const x=field(name);x.id='player-'+i;x.addEventListener('input',()=>{setupNames[i]=x.value;});return label(tr('name')+' '+(i+1),x);});
  const mode=el('select');mode.id='timing';for(const [key,value] of [['manual','manual'],['timed','timed']]){const o=el('option',tr(key));o.value=value;o.selected=timed===(value==='timed');mode.append(o);}mode.onchange=()=>{timed=mode.value==='timed';};
  const form=el('form');form.append(grid(label(tr('players'),count),label(tr('timing'),mode)),el('div','','names'));form.querySelector('.names').append(...inputs);const submit=el('button',tr('start'));submit.id='start';submit.type='submit';form.append(submit);
  form.onsubmit=e=>{e.preventDefault();setupNames=setupNames.map((n,i)=>cleanName(n,tr('name')+' '+(i+1)));if(new Set(setupNames.map(n=>n.toLowerCase())).size!==setupNames.length){const msg=lang==='en'?'Use a different alias for each seat.':'Mỗi ghế cần một biệt danh khác nhau.';form.querySelector('.error')?.remove();form.prepend(el('p',msg,'error'));return;}isPlaying=true;onStart([...setupNames],api);};
  show(hero,panel(tr('setup'),form),rules(tr('rules'),api.rules?.[lang]??[]));}
 function setup(){clearClock();isPlaying=false;draw();}
 const api={get lang(){return lang},get timed(){return timed},tr,show,heading,handoff,timer,clearClock,redraw:draw,setup,clock,rules:null};
 setup();return api;
}
