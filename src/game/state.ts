// Player progress, level math and the "ぼうけんのしょ" (localStorage save).

import type { Category } from '../data/types';

export interface SaveData {
  level: number;
  xp: number;
  hp: number;
  /** defeated regular monsters (counts toward the boss appearing) */
  kills: number;
  /** boss appears once kills reaches this (20-25) */
  bossAt: number;
  bossAnnounced: boolean;
  totalCorrect: number;
  totalAnswered: number;
  defeated: number;
  /** monster ids registered in the zukan */
  zukan: string[];
  /** wrong-answer counts per category (>=2 marks the category as weak) */
  wrong: Partial<Record<Category, number>>;
  /** last (up to) 5 question results, 1 = correct */
  recent: number[];
  /** adaptive difficulty 1-3 */
  difficulty: number;
  /** questions since the last weak-category question was served */
  sinceWeak: number;
  /** recently served question ids (avoid immediate repeats) */
  usedQ: string[];
  x: number;
  y: number;
  cleared: boolean;
}

export const START_X = 12;
export const START_Y = 15;

export function newSave(): SaveData {
  return {
    level: 1,
    xp: 0,
    hp: 50,
    kills: 0,
    bossAt: 20 + Math.floor(Math.random() * 6),
    bossAnnounced: false,
    totalCorrect: 0,
    totalAnswered: 0,
    defeated: 0,
    zukan: [],
    wrong: {},
    recent: [],
    difficulty: 1,
    sinceWeak: 0,
    usedQ: [],
    x: START_X,
    y: START_Y,
    cleared: false,
  };
}

export function maxHp(s: SaveData): number {
  return 50 + (s.level - 1) * 10;
}

/** xp required to go from `level` to `level + 1`: 20, 30, 45, 68, ... */
export function xpNeed(level: number): number {
  let n = 20;
  for (let i = 1; i < level; i++) n = Math.round(n * 1.5);
  return n;
}

const TITLES = ['みならい', 'たびびと', 'せんし', 'けんじゃ', 'ゆうしゃ'];

export function rankTitle(level: number): string {
  return TITLES[Math.min(level - 1, TITLES.length - 1)];
}

const KEY = 'manabiquest-save-v1';

export function saveGame(s: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode etc. — the game stays playable without saving */
  }
}

export function loadGame(): SaveData | null {
  try {
    const t = localStorage.getItem(KEY);
    if (!t) return null;
    return { ...newSave(), ...(JSON.parse(t) as Partial<SaveData>) };
  } catch {
    return null;
  }
}

export const GREETINGS = [
  'きょうも ことばを とりもどそう!',
  'きのうの きみより、すこし つよいよ。',
  'ぼうけんの つづきが まっているよ!',
  'まおう ナゾラーは まだ あばれている…',
  'あわてなくて だいじょうぶ。いっぽずつ いこう。',
];
