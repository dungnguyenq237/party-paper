// Original P0 analytical rules; deliberately not a production multiplayer engine.
export function hearingScore(a,b,votes){
 const x=votes.filter(v=>v==='A').length,y=votes.filter(v=>v==='B').length;
 return {a:a&&x+y>0&&(x>y||(b&&x===y))?1:0,b:b&&x+y>0&&(y>x||(a&&x===y))?1:0,A:x,B:y,abstain:votes.length-x-y};
}
export const roles=['Lead','Engineer','QA','Steward'];
export const departments=['D','T','V'];
export const events=['normal','crunch','audit','contract'];
export function targets(n,event){return [Math.ceil(n/2)+(event==='crunch'?1:0),Math.floor(n/2)+(event==='audit'?1:0)];}
export function validateOrder(order,p){
 if(!order||!Array.isArray(order.units)||order.units.length!==3||order.units.some(x=>!Number.isInteger(x)||x<0)||order.units.reduce((a,b)=>a+b,0)!==2||typeof order.power!=='boolean')return false;
 return !order.power||(!p.used&&(p.role!=='Engineer'||order.units[2]>0));
}
export function auditQuarter(players,orders,runway,event,quarter){
 const totals=[0,0,0],powers=[],effective=[];
 for(let i=0;i<players.length;i++){
  const p=players[i],order=orders[i],valid=validateOrder(order,p),units=valid?[...order.units]:[1,1,0],power=valid&&order.power;
  const bonus=[0,0,0];
  if(power){powers.push(p.role);if(p.role==='Lead')bonus[0]++;if(p.role==='QA')bonus[1]++;if(p.role==='Engineer'){units[2]--;units[0]++;bonus[0]++;}}
  units.forEach((x,j)=>totals[j]+=x+bonus[j]);effective.push({units,power,valid});
 }
 const target=targets(players.length,event),success=totals[0]>=target[0]&&totals[1]>=target[1];
 const next=players.map((p,i)=>{
  const {units,power,valid}=effective[i],next={...p,used:p.used||power,earned:[...p.earned]};
  if(!valid)return next;
  const redeemed=Math.min(units[2],p.credits);
  next.credits=p.credits-redeemed;next.prestige=p.prestige+redeemed;
  if(success){if(units[quarter%2]>0)next.prestige++;if(units[0]+units[1]===2)next.credits=Math.min(2,next.credits+1);if(units[0]+units[1]>0)next.successfulWork++;}
  units.forEach((x,j)=>next.earned[j]+=x);return next;
 });
 const change=success?1+(event==='contract'?1:0)+powers.filter(x=>x==='Steward').length:-1-(event==='freeze'?1:0);
 return {players:next,runway:Math.max(0,Math.min(4,runway+change)),totals,target,success,powers:[...new Set(powers)]};
}
export function rank(players){return players.map(p=>({...p,score:p.prestige+(p.earned[departments.indexOf(p.mandate)]>=4?3:0)})).sort((a,b)=>b.score-a.score||b.successfulWork-a.successfulWork);}
