import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {startRoomServer} from '../scripts/room-server.mjs';
const files=['play/index.html','play/shared/ui.js','play/shared/style.css','play/shared/rules.js','play/friend-court/index.html','play/friend-court/game.js','play/friend-court/dockets.js','play/corporate-chaos/index.html','play/corporate-chaos/game.js'];
async function staticPlaytests(){
 const paths=new Map(files.map(path=>['/party-paper/'+path.replace(/index\.html$/,''),path]));
 const server=createServer((req,res)=>{const path=paths.get(req.url);if(!path){res.writeHead(404).end();return;}const mime=path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':'text/html';res.writeHead(200,{'content-type':mime+'; charset=utf-8'});res.end(readFileSync(new URL('../'+path,import.meta.url)));});
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 return {base:'http://127.0.0.1:'+server.address().port+'/party-paper/play/',close:()=>new Promise(ok=>server.close(ok))};
}
async function fit(page,width){await page.setViewportSize({width,height:844});await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);}
test('Friend Court: four complete hearings, replacement, private handoffs, scores and rematch',async({page},info)=>{
 const server=await staticPlaytests();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(server.base+'friend-court/');await fit(page,320);await expect(page.getByRole('heading',{name:'Friend Court'})).toBeVisible();await page.screenshot({path:info.outputPath('friend-setup.png'),fullPage:true});
  await page.locator('#start').click();await page.locator('#replace').click();await expect(page.locator('#replace')).toBeDisabled();
  for(let i=0;i<4;i++){
   await page.locator('#accept').click();
   if(i===0){await page.locator('#argument').fill('Fictional test argument');await page.locator('#submit-text').click();await page.getByRole('button',{name:'Conceal text'}).click();await expect(page.getByText('Fictional test argument',{exact:true})).toHaveCount(0);}
   else await page.locator('#speak').click();
   await page.locator('#speak').click();
   for(let j=0;j<2;j++){await expect(page.locator('#reveal')).toBeVisible();await expect(page.locator('#vote-a')).toHaveCount(0);await page.locator('#reveal').click();await page.locator(j===0?'#vote-a':'#vote-b').click();}
   await expect(page.getByText('Shared point',{exact:true})).toBeVisible();if(i===0)await page.screenshot({path:info.outputPath('friend-verdict.png'),fullPage:true});
   await page.locator('#next-hearing').click();
  }
  await expect(page.getByRole('heading',{name:'Final verdict'})).toBeVisible();await expect(page.locator('table td')).toHaveText(['2','2','2','2']);
  await page.locator('#rematch').click();await expect(page.getByRole('heading',{name:'Hearing 1 / 4'})).toBeVisible();await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('lang','vi');await fit(page,320);await page.screenshot({path:info.outputPath('friend-vi-320.png'),fullPage:true});expect(errors).toEqual([]);
 }finally{await server.close();}
});
test('Corporate Chaos: four quarters, private commitments, audit, rankings and mobile VI',async({page},info)=>{
 const server=await staticPlaytests();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(server.base+'corporate-chaos/');await fit(page,390);await page.locator('#start').click();
  for(let q=0;q<4;q++){
   await page.locator('#brief-next').click();
   for(let p=0;p<4;p++){await expect(page.locator('#reveal')).toBeVisible();await page.locator('#reveal').click();await expect(page.getByText('Your secret mandate',{exact:true})).toBeVisible();await page.locator('#mandate-next').click();}
   await page.locator('#commit-orders').click();
   for(let p=0;p<4;p++){await page.locator('#reveal').click();await expect(page.locator('#seal')).toBeDisabled();await page.locator('#plus-D').click();await page.locator('#plus-T').click();await expect(page.locator('#plus-V')).toBeDisabled();if(q===0&&p===0)await page.screenshot({path:info.outputPath('corporate-order.png'),fullPage:true});await page.locator('#seal').click();}
   await expect(page.getByRole('heading',{name:'Project succeeds'})).toBeVisible();await expect(page.getByText('Your secret mandate',{exact:false})).toHaveCount(0);if(q===0)await page.screenshot({path:info.outputPath('corporate-audit.png'),fullPage:true});await page.locator('#audit-next').click();
  }
  await expect(page.getByRole('heading',{name:'Company survives'})).toBeVisible();await expect(page.locator('table tr')).toHaveCount(5);
  await page.locator('#rematch').click();await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('lang','vi');await fit(page,320);await page.screenshot({path:info.outputPath('corporate-vi-320.png'),fullPage:true});expect(errors).toEqual([]);
 }finally{await server.close();}
});
test('P1 actual browser controls use real local server and distinct sessions',async({browser})=>{
 const app=await startRoomServer();const contexts=await Promise.all([browser.newContext(),browser.newContext()]);const [a,b]=await Promise.all(contexts.map(c=>c.newPage()));
 try{
  await Promise.all([a.goto(app.origin+'/local-room/'),b.goto(app.origin+'/local-room/')]);
  await a.locator('#alias').fill('Alex');await a.getByRole('button',{name:'Create',exact:true}).click();await expect(a.locator('#connection')).toHaveText('connected');
  const heading=await a.locator('#room h2').textContent();const code=/Room ([A-Z2-9]{6})/.exec(heading)[1];
  await b.locator('#alias').fill('Minh');await b.locator('#code').fill(code);await b.getByRole('button',{name:'Join',exact:true}).click();await expect(b.locator('#connection')).toHaveText('connected');
  await a.getByRole('button',{name:'Ready',exact:true}).click();await b.getByRole('button',{name:'Ready',exact:true}).click();
  await a.getByRole('button',{name:'Start',exact:true}).click();await a.getByRole('button',{name:'Amber',exact:true}).click();await expect(a.locator('#room')).toContainText('Your choice: Amber');
  await expect(b.locator('#room')).toContainText('Your choice: No choice');await a.getByRole('button',{name:'Disconnect',exact:true}).click();await expect(a.locator('#connection')).toHaveText('disconnected');
  await a.getByRole('button',{name:'Reconnect',exact:true}).click();await expect(a.locator('#connection')).toHaveText('connected');await expect(a.locator('#room')).toContainText('Your choice: Amber');
  await b.getByRole('button',{name:'Violet',exact:true}).click();await expect(a.locator('#room')).toContainText('Amber: 1 · Violet: 1');await a.getByRole('button',{name:'Rematch',exact:true}).click();await expect(a.locator('#room h2')).toContainText('lobby');await fit(a,320);
 }finally{await Promise.all(contexts.map(c=>c.close()));await app.close();}
});
