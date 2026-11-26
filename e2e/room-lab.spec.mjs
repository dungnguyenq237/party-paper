import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {startRoomServer} from '../scripts/room-server.mjs';

test('Room Lab: real controls, sealed views, retry, results, reset, VI and mobile',async({page},info)=>{
 const allowed=new Map([['/party-paper/review/room-lab/',['index.html','text/html; charset=utf-8']],['/party-paper/review/room-lab/room-lab.js',['room-lab.js','text/javascript; charset=utf-8']],['/party-paper/review/room-lab/room-lab.css',['room-lab.css','text/css; charset=utf-8']]]);
 const server=createServer((req,res)=>{const f=allowed.get(req.url);if(!f){res.writeHead(404).end();return;}res.writeHead(200,{'content-type':f[1]});res.end(readFileSync(new URL('../review/room-lab/'+f[0],import.meta.url)));});
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 try{
  const url='http://127.0.0.1:'+server.address().port+'/party-paper/review/room-lab/';
  await page.setViewportSize({width:390,height:844});await page.goto(url);
  await expect(page.getByText('This is a local browser simulation', {exact:false})).toBeVisible();
  await page.screenshot({path:info.outputPath('lab-lobby.png'),fullPage:true});
  for(let i=0;i<4;i++){await page.locator('.seat').nth(i).click();await page.getByRole('button',{name:'Ready',exact:true}).click();}
  await page.locator('.seat').nth(0).click();await page.getByRole('button',{name:'Start round'}).click();
  await expect(page.locator('#phase')).toHaveText('Sealed choice');
  await page.locator('#amber').click();const rev=await page.locator('#revision').textContent();
  await page.locator('#retry').click();await expect(page.locator('#feedback')).toHaveText('Duplicate: same receipt');await expect(page.locator('#revision')).toHaveText(rev);
  await page.locator('.seat').nth(1).click();await expect(page.locator('#counts')).toContainText('No choice yet');
  await page.getByRole('button',{name:'Claim shared item'}).click();
  await page.locator('.seat').nth(2).click();await expect(page.getByRole('button',{name:'Claim shared item'})).toBeDisabled();
  await page.locator('#violet').click();
  await page.locator('.seat').nth(1).click();await page.locator('#amber').click();
  await page.locator('.seat').nth(3).click();await page.locator('#violet').click();
  await expect(page.locator('#phase')).toHaveText('Results');await expect(page.locator('#counts')).toHaveText('Amber: 2 · Violet: 2');
  await page.screenshot({path:info.outputPath('lab-results.png'),fullPage:true});
  await page.locator('.seat').nth(0).click();await page.getByRole('button',{name:'Rematch'}).click();await expect(page.locator('#phase')).toHaveText('Lobby');
  await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('lang','vi');
  await page.setViewportSize({width:320,height:820});await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({path:info.outputPath('lab-vi-320.png'),fullPage:true});
  await page.locator('#reset').click();await expect(page.locator('#revision')).toHaveText('1');
 }finally{await new Promise(ok=>server.close(ok));}
});

test('independent browser sessions reconnect to intact SQLite after server restart',async({browser})=>{
 const dir=mkdtempSync(join(tmpdir(),'party-browser-'));const path=join(dir,'room.sqlite');
 let app=await startRoomServer({path});const port=Number(new URL(app.origin).port);
 const contexts=await Promise.all([browser.newContext(),browser.newContext()]);
 const pages=await Promise.all(contexts.map(c=>c.newPage()));
 async function bootstrap(page){await page.goto(app.origin+'/health');return page.evaluate(async()=>{
  const r=await fetch('/api/session',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
  if(!r.ok)throw Error('bootstrap '+r.status);return (await r.json()).csrf;
 });}
 async function post(page,csrf,route,payload){return page.evaluate(async({csrf,route,payload})=>{
  const r=await fetch(route,{method:'POST',headers:{'content-type':'application/json','x-csrf-token':csrf},body:JSON.stringify(payload)});
  if(!r.ok)throw Error(route+' '+r.status);return r.json();
 },{csrf,route,payload});}
 async function connect(page,csrf,id){
  const {ticket}=await post(page,csrf,'/api/rooms/'+id+'/socket-ticket',{});
  await page.evaluate(ticket=>new Promise((resolve,reject)=>{
   window.framesReceived=[];const ws=new WebSocket(location.origin.replace('http','ws')+'/ws');window.roomSocket=ws;
   ws.onerror=()=>reject(Error('WebSocket failed'));ws.onmessage=e=>{const v=JSON.parse(e.data);window.framesReceived.push(v);if(v.type==='snapshot')resolve();};
   ws.onopen=()=>ws.send(JSON.stringify({v:1,type:'hello',ticket}));
   setTimeout(()=>reject(Error('snapshot timeout')),5000);
  }),ticket);
 }
 const latest=page=>page.evaluate(()=>window.framesReceived.filter(x=>x.type==='snapshot').at(-1));
 async function cmd(page,action,id){
  await page.evaluate(({action,id})=>{const v=window.framesReceived.filter(x=>x.type==='snapshot').at(-1);window.roomSocket.send(JSON.stringify({v:1,type:'command',matchId:v.matchId,phaseId:v.phaseId,seenRev:v.rev,commandId:id,action}));},{action,id});
  await expect.poll(()=>page.evaluate(id=>window.framesReceived.find(x=>x.commandId===id)?.type,id)).toBe('ack');
 }
 try{
  const [a,b]=pages;const csrf=await Promise.all(pages.map(bootstrap));
  const room=await post(a,csrf[0],'/api/rooms',{alias:'Alex',nonce:'browser1'});await post(b,csrf[1],'/api/join',{alias:'Minh',code:room.code});
  await connect(a,csrf[0],room.roomId);await connect(b,csrf[1],room.roomId);
  await expect.poll(async()=>(await latest(a)).seats.filter(s=>s.connected).length).toBe(2);
  await cmd(a,{kind:'ready',ready:true},'a-ready');await cmd(b,{kind:'ready',ready:true},'b-ready');await expect.poll(async()=>(await latest(a)).seats.every(s=>s.ready)).toBe(true);
  await cmd(a,{kind:'start',expectedRev:(await latest(a)).rev},'start');
  await expect.poll(async()=>(await latest(b)).status).toBe('active');
  await cmd(a,{kind:'choose',choice:'amber'},'first-vote');
  await expect.poll(async()=>(await latest(b)).submittedCount).toBe(1);expect((await latest(b)).self.choice).toBeNull();
  await app.close();app=await startRoomServer({port,path});
  const next=await Promise.all(pages.map(bootstrap));await connect(a,next[0],room.roomId);await connect(b,next[1],room.roomId);
  await expect.poll(async()=>(await latest(a)).status).toBe('active');expect((await latest(a)).self.choice).toBe('amber');
  await expect.poll(async()=>(await latest(b)).status).toBe('active');await cmd(b,{kind:'choose',choice:'violet'},'second-vote');
  await expect.poll(async()=>(await latest(a)).status).toBe('results');expect((await latest(a)).result).toEqual({amber:1,violet:1,reason:'completed'});
 }finally{await Promise.all(contexts.map(c=>c.close()));await app.close();rmSync(dir,{recursive:true,force:true});}
});
