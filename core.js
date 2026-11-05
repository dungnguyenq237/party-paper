export function cleanItems(text){return [...new Set(text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean))];}
function shuffle(items,random){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function bingo(items,count,random=Math.random){
 const unique=[...new Set(items)];
 if(unique.length<24)throw new Error('Add at least 24 different items, one per line.');
 if(unique.length>200||unique.some(s=>s.length>45))throw new Error('Use up to 200 items, each no longer than 45 characters.');
 if(!Number.isInteger(count)||count<1||count>30)throw new Error('Choose between 1 and 30 cards.');
 const cards=[],seen=new Set();
 for(let attempt=0;cards.length<count&&attempt<300;attempt++){const values=shuffle(unique,random).slice(0,24);values.splice(12,0,'FREE');const key=JSON.stringify(values);if(!seen.has(key)){cards.push(values);seen.add(key);}}
 if(cards.length!==count)throw new Error('Could not create unique cards. Try again.');
 return cards;
}
export function wordSearch(items,size=14,random=Math.random){
 const words=[...new Set(items.map(w=>w.toUpperCase().replace(/[\s-]/g,'')))];
 if(!words.length||words.length>20)throw new Error('Add between 1 and 20 words.');
 if(!Number.isInteger(size)||size<10||size>20)throw new Error('Grid size must be between 10 and 20.');
 if(words.some(w=>!/^[A-Z]{2,}$/.test(w)||w.length>size))throw new Error(`Use English letters only, 2–${size} letters per word. Spaces and hyphens are removed.`);
 for(let retry=0;retry<15;retry++){
  const grid=Array.from({length:size},()=>Array(size).fill('')),placements=[];let failed=false;
  for(const word of [...words].sort((a,b)=>b.length-a.length)){
   let placed=false;
   for(let attempt=0;attempt<800;attempt++){
    const [dx,dy]=[[1,0],[0,1],[1,1],[-1,1]][Math.floor(random()*4)];const x=Math.floor(random()*size),y=Math.floor(random()*size);
    const cells=[...word].map((char,i)=>({x:x+dx*i,y:y+dy*i,char}));
    if(cells.every(c=>c.x>=0&&c.y>=0&&c.x<size&&c.y<size&&(!grid[c.y][c.x]||grid[c.y][c.x]===c.char))){for(const c of cells)grid[c.y][c.x]=c.char;placements.push({word,cells});placed=true;break;}
   }
   if(!placed){failed=true;break;}
  }
  if(!failed){for(const row of grid)for(let i=0;i<size;i++)if(!row[i])row[i]='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(random()*26)];return {grid,words,placements};}
 }
 throw new Error('These words do not fit. Use fewer words or a larger grid.');
}
