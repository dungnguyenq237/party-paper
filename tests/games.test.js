import test from 'node:test';
import assert from 'node:assert/strict';
import {buildGame,chunks} from '../assets/game-engine.js';
import {games} from '../assets/games.js';
import {readFileSync} from 'node:fs';
for(const game of games)test(`${game.id} sample produces printable content and reachable guide`,()=>{
 const original=[...game.items];const result=buildGame(game.kind,game.items);
 assert.ok(result.length>=8);assert.deepEqual(game.items,original);
 assert.match(readFileSync(new URL(`../${game.id}.html`,import.meta.url),'utf8'),/How to play/);
 if(['quiz','scramble'].includes(game.kind))assert.ok(result.every(item=>item.answer));
});
test('scramble preserves letters and never reveals original, even with degenerate randomness',()=>{
 for(const random of [()=>0,()=>.999,Math.random])for(let i=0;i<100;i++)for(const {prompt,answer} of buildGame('scramble',['APPLE','AAB','BALLOON','ABC'],random)){
  assert.notEqual(prompt,answer);assert.equal([...prompt].sort().join(''),[...answer].sort().join(''));
 }
});
test('invalid quiz, empty and excessive input fail before printing',()=>{
 for(const input of [[],['no separator'],['q | '],['q | a | b']])assert.throws(()=>buildGame('quiz',input));
 assert.throws(()=>buildGame('cards',Array.from({length:49},(_,i)=>String(i))));
 assert.throws(()=>buildGame('cards',['x'.repeat(181)]));
 for(const word of ['AAA','hi','café','a'.repeat(17)])assert.throws(()=>buildGame('scramble',[word]));
});
test('bounded pages retain every prompt without duplicate pages',()=>{
 const input=Array.from({length:48},(_,i)=>({prompt:String(i)}));const pages=chunks(input,6);
 assert.equal(pages.length,8);assert.deepEqual(pages.flat(),input);
});
