// Shared data contracts between the game engine and the generated asset
// data files (sprites.ts / music.ts / questions.ts).

/**
 * One sprite as an indexed-color pixel grid.
 * rows[y][x] is a hex digit ('0'-'f') indexing into palette,
 * or '.' for a transparent pixel.
 * Invariants: rows.length === h, every row string length === w.
 */
export interface SpriteData {
  w: number;
  h: number;
  palette: string[];
  rows: string[];
}

export type WaveType = 'square' | 'triangle' | 'sawtooth' | 'noise';

/**
 * [note, steps] — note name like 'C4' / 'F#5' (sharps only, no flats),
 * or null for a rest. 1 step = one 16th note.
 * For 'noise' tracks the note only controls the noise pitch (playback rate).
 */
export type NoteEvent = [string | null, number];

export interface Track {
  wave: WaveType;
  /** 0..1 relative track volume */
  volume: number;
  notes: NoteEvent[];
}

export interface Song {
  bpm: number;
  loop: boolean;
  /** All tracks in one song must have the same total step count (for clean loops). */
  tracks: Track[];
}

export type Category =
  | 'tashizan'    // たし算 (筆算含む)
  | 'hikizan'     // ひき算 (筆算含む)
  | 'kakezan'     // かけ算 (九九)
  | 'warizan'     // わり算 (あまりなし)
  | 'bunshoudai'  // 時刻・長さなどの文章題
  | 'kanji-yomi'  // 漢字の読み
  | 'kanji-kaki'  // 正しい漢字を選ぶ
  | 'teniwoha'    // 「てにをは」穴埋め
  | 'kotoba';     // ことばの意味

export interface Question {
  id: string;
  category: Category;
  difficulty: 1 | 2 | 3;
  /** Question text, grade-3 friendly, DQ-style spaced writing. */
  prompt: string;
  /** Exactly 4 distinct choices. */
  choices: [string, string, string, string];
  /** Index (0-3) of the correct choice. */
  answer: 0 | 1 | 2 | 3;
  /** Hint shown after the first wrong answer. Must not reveal the answer. */
  hint: string;
}

export type MonsterId =
  | 'slimy'        // スライミー
  | 'kazoenma'     // カゾエンマ
  | 'kakezaru'     // カケザルー
  | 'warioni'      // ワリオーニ
  | 'yomiganago'   // ヨミガナーゴ
  | 'kakitorin'    // カキトリン
  | 'teniwohappa'  // テニヲハッパ
  | 'nazora';      // ナゾラー (魔王)

export type TileId = 'grass' | 'forest' | 'mountain' | 'water' | 'path' | 'castle';

export type SongId = 'title' | 'field' | 'battle' | 'boss' | 'fanfare' | 'sad' | 'ending';
export type SfxId = 'beep' | 'confirm' | 'damage' | 'levelup';
