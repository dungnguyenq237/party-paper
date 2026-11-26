// Original vector cast inspired by the owner-reviewed concept sheets.
// The art layer consumes presentation-only data. Never pass private ballots or mandates.
function el(tag,text='',className=''){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;}

const palette={
 judge:{skin:'#efb689',shade:'#c98462',hair:'#e4dbcb',coat:'#9d343c',trim:'#efc070',shirt:'#fff2d4',pants:'#4c3942',kind:'judge'},
 advocateA:{skin:'#efb58a',shade:'#c17b59',hair:'#392c36',coat:'#3d557b',trim:'#dfb76b',shirt:'#fff5dc',pants:'#b4a28f',kind:'lawyer'},
 advocateB:{skin:'#efba95',shade:'#ce886c',hair:'#c95d71',coat:'#ad405c',trim:'#f1bd64',shirt:'#fff2dc',pants:'#814356',kind:'ribbon'},
 jury:{skin:'#dba273',shade:'#b97552',hair:'#65432e',coat:'#627354',trim:'#d5ba7d',shirt:'#fff4dd',pants:'#715141',kind:'jury'},
 Lead:{skin:'#a96749',shade:'#84472f',hair:'#282737',coat:'#fff0cd',trim:'#e3ae4d',shirt:'#146760',pants:'#344460',kind:'lead'},
 Engineer:{skin:'#edb98d',shade:'#c68661',hair:'#654536',coat:'#256969',trim:'#9dd1bf',shirt:'#f6e6c9',pants:'#3b4a5b',kind:'engineer'},
 QA:{skin:'#e9ba98',shade:'#bd866f',hair:'#263e4c',coat:'#f4e7cd',trim:'#60a59a',shirt:'#f9eacb',pants:'#37636a',kind:'qa'},
 Steward:{skin:'#8e523b',shade:'#673d2e',hair:'#302831',coat:'#237366',trim:'#f1bf64',shirt:'#f5e4c3',pants:'#394b55',kind:'steward'}
};
const moods=new Set(['idle','speak','think','react','celebrate','sad']);
const outline='#382c3a';
function hair(p){
 switch(p.kind){
  case 'judge':return '<path d="M51 74 Q30 56 45 34 Q49 11 77 18 Q91 3 112 18 Q140 7 151 33 Q168 44 154 75 L145 92 Q152 110 136 118 L53 113 Q33 108 43 88Z" fill="'+p.hair+'"/><g fill="#f8eddc"><circle cx="48" cy="52" r="18"/><circle cx="55" cy="31" r="17"/><circle cx="82" cy="23" r="17"/><circle cx="109" cy="22" r="17"/><circle cx="135" cy="34" r="18"/><circle cx="151" cy="55" r="16"/><circle cx="45" cy="81" r="15"/><circle cx="150" cy="82" r="15"/></g>';
  case 'ribbon':return '<path d="M45 93 Q13 78 29 47 Q19 21 44 18 Q48 0 72 13 Q101 0 118 20 Q154 8 170 40 Q184 65 163 84 L152 108 Q176 120 154 143 Q140 152 128 131 L66 137 Q38 158 28 132 Q15 113 45 93Z" fill="'+p.hair+'"/><path d="M43 36Q64 18 78 38L65 52Q42 56 35 48ZM137 33L161 18L169 46L143 49Z" fill="#873348"/><path d="M47 45Q70 12 112 24Q138 27 151 56L135 68Q116 43 99 49Q75 66 52 67Z" fill="'+p.hair+'"/>';
  case 'lead':return '<g fill="'+p.hair+'"><circle cx="126" cy="24" r="27"/><circle cx="147" cy="32" r="22"/><circle cx="137" cy="54" r="24"/><path d="M47 85Q17 46 48 22Q84 1 126 21Q153 32 145 77L127 91L55 102Z"/><circle cx="43" cy="35" r="16"/><circle cx="60" cy="20" r="18"/></g><path d="M116 16Q127 23 133 41" fill="none" stroke="#e8b65a" stroke-width="7"/>';
  case 'qa':return '<path d="M43 96Q23 70 41 34Q63 10 100 13Q151 14 160 58L156 103Q151 128 132 130L51 121Q31 114 43 96Z" fill="'+p.hair+'"/><path d="M37 90Q43 113 59 114L63 128L43 121Q27 114 37 90ZM143 100Q144 114 153 105L155 123L133 128Z" fill="#46a59b"/>';
  case 'steward':return '<g fill="'+p.hair+'"><ellipse cx="101" cy="42" rx="61" ry="34"/><circle cx="136" cy="24" r="20"/><circle cx="154" cy="39" r="18"/><circle cx="42" cy="34" r="18"/><circle cx="61" cy="22" r="20"/><circle cx="83" cy="15" r="20"/></g>';
  default:return '<path d="M40 74Q25 45 45 25L34 15Q61 25 70 12Q92 5 107 23Q126 10 145 27L155 15Q149 39 158 61L144 89L49 92Z" fill="'+p.hair+'"/>';
 }
}
function fringe(p){
 if(p.kind==='judge')return '<path d="M54 45Q70 23 94 33L100 51Q72 40 56 64ZM101 33Q131 21 145 45L144 65Q132 43 101 51Z" fill="#fff4df"/>';
 if(p.kind==='jury')return '<path d="M43 48Q44 13 96 14Q144 8 160 44L148 55L54 57Z" fill="#77815b"/><path d="M51 42Q99 28 148 44M77 19L70 45M111 18L122 42" stroke="#a6aa78" fill="none"/><path d="M56 56Q74 46 92 55L69 69L53 72Z" fill="'+p.hair+'"/>';
 if(p.kind==='steward')return '<path d="M48 65Q46 34 83 32L99 43Q121 25 145 45L150 66L137 59Q114 38 92 57Q69 45 48 65Z" fill="'+p.hair+'"/>';
 if(p.kind==='qa')return '<path d="M48 62Q35 43 59 28Q109 4 147 37L150 70Q127 48 106 44L92 65Q85 49 76 44L48 77Z" fill="'+p.hair+'"/><path d="M53 46L73 39M51 54L70 47" stroke="#f7c762" stroke-width="5"/>';
 return '<path d="M48 67Q33 45 54 30Q84 6 123 30L146 43L150 70Q128 55 111 42Q100 65 76 64L87 44Q66 66 48 76Z" fill="'+p.hair+'"/><path d="M60 32Q83 19 99 30" fill="none" stroke="#ffffff" opacity=".19" stroke-width="5"/>';
}
function prop(p){
 switch(p.kind){
 case 'judge':return '<g transform="translate(-10 0) rotate(-35 158 157)"><path d="M158 140V190" stroke="#80502e" stroke-width="10"/><rect x="135" y="130" width="46" height="24" rx="5" fill="#b47c43"/><path d="M143 131V154M173 131V154" stroke="#f3c46c" stroke-width="6"/></g>';
 case 'lawyer':return '<g transform="rotate(-12 54 168)"><rect x="26" y="137" width="50" height="58" rx="4" fill="#764b3b"/><path d="M35 142V191M45 151H66M55 152V177M45 169L50 158L55 169ZM56 169L61 158L66 169Z" stroke="#eec477" fill="none" stroke-width="2.5"/><path d="M30 190H70" stroke="#fff0ce"/></g>';
 case 'engineer':return '<g transform="translate(8 6)"><path d="M26 144H81L90 184H36Z" fill="#35495c"/><path d="M36 184H100L108 190H31Z" fill="#9bafac"/><path d="M48 161L42 168L48 173M62 161L68 168L62 173" stroke="#b6f3d6" fill="none" stroke-width="3"/></g>';
 case 'steward':return '<g><path d="M31 146H66V179Q66 189 49 189Q31 189 31 179Z" fill="#f5e7c8"/><path d="M66 153Q86 150 79 168Q75 176 66 173" stroke="#f5e7c8" stroke-width="8" fill="none"/><path d="M43 137Q37 129 43 121M55 137Q61 130 56 123" fill="none" stroke="#ead5b8" opacity=".8"/></g>';
 default:return '<g transform="rotate(-10 53 168)"><rect x="28" y="136" width="50" height="60" rx="4" fill="'+(p.kind==='ribbon'?'#f4e4bb':'#895c47')+'"/><rect x="35" y="144" width="36" height="44" rx="2" fill="#fff5df"/><path d="M44 142H62V150H44Z" fill="#ddb46e"/><path d="M42 158H65M42 166H63M42 174H60" stroke="#ac8e72" fill="none" stroke-width="2"/></g>';
 }
}
function avatarSvg(p,mood){
 const happy=mood==='celebrate',sad=mood==='sad',open=mood==='speak'||mood==='react';
 const glasses=['lawyer','jury','engineer','qa'].includes(p.kind);
 return '<svg class="cast-svg" viewBox="0 0 200 250" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">'+
 '<ellipse cx="100" cy="237" rx="61" ry="8" fill="#39293c" opacity=".24"/>'+
 '<g class="cast-body" stroke="'+outline+'" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">'+
 '<g class="cast-legs"><path d="M69 189L68 224H93L99 192M103 191L108 224H132L130 189" fill="'+p.pants+'"/><path d="M68 221L92 221L93 236H57Q52 230 68 221ZM109 221H132Q147 228 143 236H108Z" fill="#40343f"/><path d="M59 233H93M109 233H142" stroke="'+p.trim+'"/></g>'+
 '<path d="M74 111Q100 100 126 112Q142 123 145 164L140 203Q100 217 60 203L56 164Q57 126 74 111Z" fill="'+p.coat+'"/><path d="M81 112L100 151L119 112L126 160L105 206L95 207L74 160Z" fill="'+p.shirt+'"/><path d="M71 119L83 139L77 160L91 202M129 119L117 139L123 160L109 202" stroke="'+p.trim+'" stroke-width="5" fill="none"/><path d="M91 151L100 145L109 151L104 163L110 180L100 190L90 180L96 163Z" fill="'+p.trim+'"/>'+
 '<g class="cast-arm cast-arm-left"><path d="M63 124Q42 130 35 158L49 171L67 150" fill="'+p.coat+'"/><path d="M39 155Q29 159 33 172Q39 183 48 174L54 164Z" fill="'+p.skin+'"/>'+(p.kind==='judge'?'':prop(p))+'</g>'+
 '<g class="cast-arm cast-arm-right"><path d="M137 126Q151 133 164 153L153 171L135 150" fill="'+p.coat+'"/><path d="M159 153Q170 151 175 159L177 168Q168 177 157 169Z" fill="'+p.skin+'"/>'+(p.kind==='judge'?prop(p):'')+'</g>'+
 '<g class="cast-head">'+hair(p)+'<path d="M86 98H114V124Q101 139 86 124Z" fill="'+p.shade+'"/><ellipse cx="47" cy="80" rx="10" ry="14" fill="'+p.skin+'"/><ellipse cx="153" cy="80" rx="10" ry="14" fill="'+p.skin+'"/><path d="M51 49Q61 26 100 28Q139 28 149 49L151 85Q148 117 100 123Q54 117 49 85Z" fill="'+p.skin+'"/><path d="M55 91Q62 114 100 119Q134 115 146 93Q142 117 100 123Q58 118 55 91Z" fill="'+p.shade+'" stroke="none" opacity=".5"/>'+fringe(p)+
 '<path d="M66 69Q76 '+(sad?'60':'63')+' 87 70M113 70Q125 '+(sad?'60':'63')+' 135 69" stroke="'+p.hair+'" stroke-width="5" fill="none"/>'+
 (happy?'<path d="M68 83Q77 74 86 83M115 83Q125 74 134 83" stroke-width="4" fill="none"/>':'<g class="cast-eyes" fill="#fff8ea"><ellipse cx="77" cy="83" rx="10" ry="'+(mood==='react'?13:10)+'"/><ellipse cx="124" cy="83" rx="10" ry="'+(mood==='react'?13:10)+'"/><ellipse cx="79" cy="84" rx="5" ry="6" fill="#382c3a" stroke="none"/><ellipse cx="122" cy="84" rx="5" ry="6" fill="#382c3a" stroke="none"/><circle cx="80" cy="81" r="1.8" fill="white" stroke="none"/><circle cx="123" cy="81" r="1.8" fill="white" stroke="none"/></g>')+
 (glasses?'<g fill="none" stroke="#554331" stroke-width="3"><rect x="61" y="71" width="31" height="24" rx="9"/><rect x="109" y="71" width="31" height="24" rx="9"/><path d="M92 80Q100 75 109 80"/></g>':'')+
 '<path d="M100 84L96 94L104 94" fill="none" stroke="'+p.shade+'" stroke-width="2.5"/><ellipse cx="65" cy="96" rx="8" ry="4" fill="#d57872" opacity=".45" stroke="none"/><ellipse cx="135" cy="96" rx="8" ry="4" fill="#d57872" opacity=".45" stroke="none"/>'+
 (open||happy?'<g class="cast-mouth"><path d="M88 101Q100 95 113 101Q108 117 100 117Q91 116 88 101Z" fill="#603340"/><path d="M91 102H110L106 107H94Z" fill="#fff3df" stroke="none"/><path d="M96 114Q102 108 107 114" stroke="#e68c87" fill="none"/></g>':sad?'<path d="M89 110Q100 100 112 110" fill="none"/>':'<path d="M89 104Q100 112 112 103" fill="none"/>')+
 (p.kind==='judge'?'<path d="M100 99Q87 88 75 99Q72 109 85 109Q94 108 100 103Q106 109 116 109Q130 106 125 99Q113 89 100 99Z" fill="#f5e9d8"/>':p.kind==='steward'?'<path d="M54 94Q69 114 100 114Q133 113 146 94Q145 127 101 133Q57 128 54 94Z" fill="'+p.hair+'"/><path d="M91 111Q101 117 111 110" stroke="#fff0d3" fill="none"/>':'')+
 (p.kind==='lead'?'<g fill="#efbd60" stroke="#9b6937"><circle cx="45" cy="91" r="7"/><circle cx="155" cy="91" r="7"/></g>':'')+
 '</g></g><g class="cast-spark" fill="#ffcf6f" stroke="#864e39" stroke-width="2"><path d="M22 45L28 31L33 45L47 51L33 56L28 70L22 56L8 51Z"/><path d="M169 27L173 15L177 27L190 31L177 36L173 48L169 36L156 31Z"/><circle cx="181" cy="90" r="4"/></g></svg>';
}
function figure({role,mood='idle',label='',caption=''}) {
 const p=palette[role];if(!p)throw new Error('Unknown cast role');
 const m=moods.has(mood)?mood:'idle';const f=el('figure','','cast-slot');f.dataset.role=role;f.dataset.mood=m;
 const visual=el('div','','cast-character');
 // All SVG markup is generated from the constant palette and finite mood set.
 visual.innerHTML=avatarSvg(p,m);
 const title=el('figcaption','','cast-caption');title.append(el('strong',label),el('small',caption));
 f.append(visual,title);return f;
}
const courtBackdrop='<svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="courtwall" x2="0" y2="1"><stop stop-color="#c79b65"/><stop offset="1" stop-color="#755148"/></linearGradient><linearGradient id="courtlight" x2="0" y2="1"><stop stop-color="#fff0b2"/><stop offset="1" stop-color="#d79d65"/></linearGradient></defs><path fill="url(#courtwall)" d="M0 0H800V360H0Z"/><g fill="#8e5a52" stroke="#f0c687" stroke-width="5"><path d="M65 215V76Q123-5 181 76V215Z"/><path d="M342 215V63Q400-20 458 63V215Z"/><path d="M619 215V76Q677-5 735 76V215Z"/></g><g fill="url(#courtlight)"><path d="M77 203V78Q123 15 169 78V203Z"/><path d="M354 203V65Q400 3 446 65V203Z"/><path d="M631 203V78Q677 15 723 78V203Z"/></g><g stroke="#86584c" stroke-width="5" opacity=".65"><path d="M123 43V208M77 115H169M400 30V208M355 111H445M677 43V208M631 115H723"/></g><g fill="#814a43" stroke="#d3a86d" stroke-width="6"><path d="M10 0H44V257H10Z M204 0H242V257H204Z M558 0H596V257H558Z M756 0H790V257H756Z"/><path d="M250 4H330V115L290 143L250 115Z M470 4H550V115L510 143L470 115Z" fill="#85414d"/></g><g fill="#edc17a"><path d="M290 35L309 78H271ZM510 35L529 78H491Z"/><circle cx="290" cy="32" r="7"/><circle cx="510" cy="32" r="7"/></g><path d="M0 234L800 234V360H0Z" fill="#623d39"/><path d="M0 262H800M0 301H800M0 340H800M160 234L110 360M320 234L290 360M480 234L510 360M640 234L690 360" fill="none" stroke="#ab7855" stroke-width="3" opacity=".7"/><path d="M290 205H510V265H290Z" fill="#513331" stroke="#d9a963" stroke-width="5"/><path d="M0 260H800V282H0Z" fill="#b78556" stroke="#694233" stroke-width="4"/></svg>';
const officeBackdrop='<svg viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="officewall" x2="0" y2="1"><stop stop-color="#7fa59d"/><stop offset="1" stop-color="#294954"/></linearGradient><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#b7e0dc"/><stop offset="1" stop-color="#eddbb3"/></linearGradient></defs><path d="M0 0H800V360H0Z" fill="url(#officewall)"/><rect x="50" y="28" width="414" height="175" rx="12" fill="url(#sky)" stroke="#304b58" stroke-width="8"/><g fill="#668a96" opacity=".75"><path d="M57 200V129H95V200M98 200V97H137V200M142 200V146H183V200M189 200V66H233V200M239 200V120H280V200M289 200V101H339V200M346 200V133H381V200M385 200V76H420V200M425 200V145H458V200"/></g><path d="M153 29V200M258 29V200M361 29V200M50 112H464" stroke="#42626b" stroke-width="6"/><rect x="513" y="35" width="235" height="154" rx="8" fill="#20333f" stroke="#afc3ae" stroke-width="5"/><path d="M535 163H725M535 62V163" stroke="#5f8f8d" fill="none"/><g fill="#79c9ae"><rect x="554" y="129" width="24" height="34" rx="2"/><rect x="594" y="112" width="24" height="51" rx="2"/><rect x="634" y="96" width="24" height="67" rx="2"/><rect x="674" y="75" width="24" height="88" rx="2"/></g><path d="M549 120L591 101L636 111L704 59" stroke="#f7ca74" stroke-width="4" fill="none"/><g fill="#e9c977" stroke="#496970" stroke-width="4"><path d="M170 0V33H135L114 61H226L205 33H170Z"/><path d="M600 0V33H565L544 61H656L635 33H600Z"/></g><path d="M0 219H800V360H0Z" fill="#4c5d62"/><path d="M0 254H800M0 290H800M0 330H800M160 219L110 360M320 219L290 360M480 219L510 360M640 219L690 360" stroke="#71868a" stroke-width="2" fill="none"/><g fill="#416b59" stroke="#304a43" stroke-width="3"><path d="M15 231Q-4 180 31 160Q48 196 35 230Q45 167 73 182Q71 221 45 233Z"/><path d="M759 230Q737 179 771 166Q790 193 777 231Q789 171 800 193V233Z"/></g><path d="M17 229H64L55 271H26Z M753 229H796L786 271H762Z" fill="#b98a61"/></svg>';
export function scene({theme,stage,cast,headline='',progress=null,privateView=false,outcome=null}){
 const board=el('section','','game-scene');board.dataset.scene=theme;board.dataset.stage=stage;board.dataset.private=String(privateView);if(outcome)board.dataset.outcome=outcome;
 // The scene is supplementary to the fully accessible text controls and scores.
 board.setAttribute('aria-label',headline||'Game scene');
 const backdrop=el('div','','scene-backdrop');backdrop.setAttribute('aria-hidden','true');backdrop.innerHTML=theme==='court'?courtBackdrop:officeBackdrop;
 const top=el('div','','scene-top');top.append(el('span',headline,'scene-banner'));
 if(progress){const steps=el('span','','scene-progress');steps.setAttribute('aria-label',progress.label);for(let i=0;i<progress.total;i++){const dot=el('span');dot.dataset.filled=String(i<progress.current);steps.append(dot);}top.append(steps);}
 const figures=el('div','','cast-grid');for(const member of cast)figures.append(figure(member));figures.style.setProperty('--cast-count',String(cast.length));
 board.append(backdrop,top,figures);
 if(outcome==='success'||outcome==='tie'){const fx=el('div','','scene-confetti');fx.setAttribute('aria-hidden','true');for(let i=0;i<12;i++){const bit=el('i');bit.style.setProperty('--i',String(i));fx.append(bit);}board.append(fx);}
 return board;
}
export function introScene(theme,lang){
 const vi=lang==='vi';
 const cast=theme==='court'?[{role:'advocateA',label:vi?'Bên A':'Advocate A',mood:'idle'},{role:'judge',label:vi?'Thẩm phán':'Judge',mood:'speak'},{role:'advocateB',label:vi?'Bên B':'Advocate B',mood:'idle'},{role:'jury',label:vi?'Bồi thẩm':'Juror',mood:'think'}]:[{role:'Lead',label:vi?'Trưởng nhóm':'Lead',mood:'speak'},{role:'Engineer',label:vi?'Kỹ sư':'Engineer',mood:'think'},{role:'QA',label:'QA',mood:'idle'},{role:'Steward',label:vi?'Điều phối':'Steward',mood:'idle'}];
 return scene({theme,stage:'setup',cast,headline:theme==='court'?(vi?'TÒA ÁN HƯ CẤU':'THE FICTIONAL COURT'):(vi?'VĂN PHÒNG HỖN LOẠN':'THE COMPANY FLOOR')});
}
