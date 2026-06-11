// Adaptive question selection: weak-category reinjection + dynamic difficulty.

import { QUESTIONS } from '../data/questions';
import type { Category, Question } from '../data/types';
import type { SaveData } from './state';

export function weakCategories(s: SaveData): Category[] {
  return (Object.keys(s.wrong) as Category[]).filter((c) => (s.wrong[c] ?? 0) >= 2);
}

/**
 * Pick the next question for a battle.
 * - Normally from `cats` (the monster's subject).
 * - Every 5th question at the latest, a weak category is forced in.
 * - Prefers the current adaptive difficulty, falling back to +-1, then any.
 */
export function pickQuestion(s: SaveData, cats: Category[]): Question {
  const weak = weakCategories(s);
  const forceWeak = s.sinceWeak >= 4 && weak.length > 0;
  let pool = forceWeak
    ? QUESTIONS.filter((q) => weak.includes(q.category))
    : QUESTIONS.filter((q) => cats.includes(q.category));
  if (!pool.length) pool = QUESTIONS.slice();

  const d = s.difficulty;
  const exact = pool.filter((q) => q.difficulty === d);
  const near = pool.filter((q) => Math.abs(q.difficulty - d) === 1);
  let cand = exact.length ? exact : near.length ? near : pool;

  const fresh = cand.filter((q) => !s.usedQ.includes(q.id));
  if (fresh.length) cand = fresh;

  const q = cand[Math.floor(Math.random() * cand.length)];
  s.usedQ.push(q.id);
  if (s.usedQ.length > 40) s.usedQ.splice(0, s.usedQ.length - 40);
  return q;
}

export type QuizOutcome = 'correct' | 'correctWithHint' | 'wrong';

/** Record one finished question and update the adaptive state. */
export function recordResult(s: SaveData, q: Question, outcome: QuizOutcome) {
  const wasWeak = weakCategories(s).includes(q.category);
  s.totalAnswered++;
  const solved = outcome !== 'wrong';
  if (solved) s.totalCorrect++;

  if (outcome === 'correct') {
    const w = s.wrong[q.category] ?? 0;
    if (w > 0) s.wrong[q.category] = w - 1;
  } else {
    // any miss (even if recovered via hint) counts toward "weak"
    s.wrong[q.category] = (s.wrong[q.category] ?? 0) + 1;
  }
  s.sinceWeak = wasWeak ? 0 : s.sinceWeak + 1;

  s.recent.push(solved ? 1 : 0);
  if (s.recent.length > 5) s.recent.shift();
  if (s.recent.length === 5) {
    const rate = s.recent.reduce((a, b) => a + b, 0) / 5;
    if (rate > 0.85 && s.difficulty < 3) {
      s.difficulty++;
      s.recent = [];
    } else if (rate < 0.55 && s.difficulty > 1) {
      s.difficulty--;
      s.recent = [];
    }
  }
}
