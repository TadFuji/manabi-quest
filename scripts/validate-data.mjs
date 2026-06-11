// Independent validation of the three generated data files.
// Run: npx esbuild src/data/*.ts --format=esm --outdir=scripts/.build
//      node scripts/validate-data.mjs

import { HERO, MONSTERS, TILES } from './.build/sprites.js';
import { SONGS, SFX } from './.build/music.js';
import { QUESTIONS } from './.build/questions.js';

let errors = 0;
const bad = (msg) => {
  errors++;
  console.log('NG: ' + msg);
};

// ---- sprites ----
function checkSprite(name, s, w, h, opaque = false) {
  if (s.w !== w || s.h !== h) bad(`${name}: size ${s.w}x${s.h} != ${w}x${h}`);
  if (s.rows.length !== s.h) bad(`${name}: rows ${s.rows.length} != h ${s.h}`);
  for (const [y, row] of s.rows.entries()) {
    if (row.length !== s.w) bad(`${name}: row ${y} len ${row.length} != ${s.w}`);
    for (const ch of row) {
      if (ch === '.') {
        if (opaque) bad(`${name}: transparent pixel in opaque tile`);
      } else {
        const i = parseInt(ch, 16);
        if (Number.isNaN(i) || i >= s.palette.length) bad(`${name}: bad char '${ch}' row ${y}`);
      }
    }
  }
  for (const c of s.palette) {
    if (!/^#[0-9a-fA-F]{6}$/.test(c)) bad(`${name}: bad color ${c}`);
  }
}
for (const d of ['down', 'up', 'left', 'right']) {
  const frames = HERO[d];
  if (!frames || frames.length !== 2) bad(`HERO.${d}: needs 2 frames`);
  frames?.forEach((f, i) => checkSprite(`HERO.${d}[${i}]`, f, 16, 16));
}
const monsterIds = ['slimy', 'kazoenma', 'kakezaru', 'warioni', 'yomiganago', 'kakitorin', 'teniwohappa', 'nazora'];
for (const id of monsterIds) {
  const sz = id === 'nazora' ? 48 : 32;
  if (!MONSTERS[id]) bad(`MONSTERS.${id} missing`);
  else checkSprite(`MONSTERS.${id}`, MONSTERS[id], sz, sz);
}
for (const id of ['grass', 'forest', 'mountain', 'water', 'path', 'castle']) {
  if (!TILES[id]) bad(`TILES.${id} missing`);
  else checkSprite(`TILES.${id}`, TILES[id], 16, 16, true);
}

// ---- music ----
const NOTE_RE = /^[A-G]#?-?\d$/;
function checkSong(name, song, mustLoop = null) {
  if (!song) return bad(`${name} missing`);
  if (!(song.bpm > 30 && song.bpm < 300)) bad(`${name}: bpm ${song.bpm}`);
  if (mustLoop !== null && song.loop !== mustLoop) bad(`${name}: loop should be ${mustLoop}`);
  const totals = song.tracks.map((tr) => {
    let t = 0;
    for (const [n, d] of tr.notes) {
      if (n !== null && !NOTE_RE.test(n)) bad(`${name}: bad note '${n}'`);
      if (!(Number.isFinite(d) && d > 0)) bad(`${name}: bad duration ${d}`);
      t += d;
    }
    if (!['square', 'triangle', 'sawtooth', 'noise'].includes(tr.wave)) bad(`${name}: wave ${tr.wave}`);
    return t;
  });
  if (new Set(totals).size > 1) bad(`${name}: track step totals differ: ${totals.join(',')}`);
}
for (const id of ['title', 'field', 'battle', 'boss', 'ending']) checkSong(`SONGS.${id}`, SONGS[id], true);
for (const id of ['fanfare', 'sad']) checkSong(`SONGS.${id}`, SONGS[id], false);
for (const id of ['beep', 'confirm', 'damage', 'levelup']) checkSong(`SFX.${id}`, SFX[id], false);

// ---- questions ----
const want = {
  tashizan: 25, hikizan: 25, kakezan: 30, warizan: 25, bunshoudai: 20,
  'kanji-yomi': 30, 'kanji-kaki': 20, teniwoha: 15, kotoba: 15,
};
const counts = {};
const ids = new Set();
let mathChecked = 0;
for (const q of QUESTIONS) {
  counts[q.category] = (counts[q.category] ?? 0) + 1;
  if (ids.has(q.id)) bad(`dup id ${q.id}`);
  ids.add(q.id);
  if (q.choices.length !== 4) bad(`${q.id}: ${q.choices.length} choices`);
  if (new Set(q.choices).size !== 4) bad(`${q.id}: duplicate choices`);
  if (!(q.answer >= 0 && q.answer <= 3)) bad(`${q.id}: answer ${q.answer}`);
  if (![1, 2, 3].includes(q.difficulty)) bad(`${q.id}: difficulty ${q.difficulty}`);
  if (!q.hint || !q.prompt) bad(`${q.id}: empty prompt/hint`);
  // arithmetic re-check
  const m = q.prompt.match(/(\d+)\s*([+\-×÷])\s*(\d+)/);
  if (m && ['tashizan', 'hikizan', 'kakezan', 'warizan'].includes(q.category)) {
    const a = +m[1], b = +m[3];
    const val = m[2] === '+' ? a + b : m[2] === '-' ? a - b : m[2] === '×' ? a * b : a / b;
    if (String(val) !== q.choices[q.answer]) {
      bad(`${q.id}: ${a}${m[2]}${b} = ${val}, but answer choice is ${q.choices[q.answer]}`);
    }
    mathChecked++;
  }
}
for (const [cat, n] of Object.entries(want)) {
  if (counts[cat] !== n) bad(`category ${cat}: ${counts[cat]} != ${n}`);
}
if (QUESTIONS.length !== 205) bad(`total ${QUESTIONS.length} != 205`);

console.log(`questions: ${QUESTIONS.length}, arithmetic re-checked: ${mathChecked}`);
console.log(errors === 0 ? 'ALL DATA CHECKS PASSED' : `${errors} PROBLEM(S) FOUND`);
process.exit(errors === 0 ? 0 : 1);
