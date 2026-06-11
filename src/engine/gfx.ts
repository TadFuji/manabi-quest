// Canvas helpers: indexed-color sprite decoding, DQ-style windows,
// text drawing and the typewriter message box.

import type { SpriteData } from '../data/types';

export const W = 512;
export const H = 448;

export const FONT = "'MS Gothic', 'ＭＳ ゴシック', 'Yu Gothic', monospace";

const spriteCache = new WeakMap<SpriteData, HTMLCanvasElement>();

export function spriteCanvas(s: SpriteData): HTMLCanvasElement {
  let c = spriteCache.get(s);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = s.w;
  c.height = s.h;
  const g = c.getContext('2d')!;
  const img = g.createImageData(s.w, s.h);
  for (let y = 0; y < s.h; y++) {
    const row = s.rows[y] ?? '';
    for (let x = 0; x < s.w; x++) {
      const ch = row[x] ?? '.';
      if (ch === '.') continue;
      const col = s.palette[parseInt(ch, 16)] ?? '#ff00ff';
      const i = (y * s.w + x) * 4;
      img.data[i] = parseInt(col.slice(1, 3), 16);
      img.data[i + 1] = parseInt(col.slice(3, 5), 16);
      img.data[i + 2] = parseInt(col.slice(5, 7), 16);
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  spriteCache.set(s, c);
  return c;
}

export function drawSprite(
  g: CanvasRenderingContext2D,
  s: SpriteData,
  x: number,
  y: number,
  scale = 2,
) {
  g.imageSmoothingEnabled = false;
  g.drawImage(spriteCanvas(s), Math.round(x), Math.round(y), s.w * scale, s.h * scale);
}

export function drawText(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size = 18,
  color = '#fff',
) {
  g.font = `${size}px ${FONT}`;
  g.fillStyle = color;
  g.textBaseline = 'top';
  g.textAlign = 'left';
  g.fillText(text, x, y);
}

export function drawTextC(
  g: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  size = 18,
  color = '#fff',
) {
  g.font = `${size}px ${FONT}`;
  g.fillStyle = color;
  g.textBaseline = 'top';
  g.textAlign = 'center';
  g.fillText(text, cx, y);
  g.textAlign = 'left';
}

function strokeRound(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  g.beginPath();
  if (typeof g.roundRect === 'function') {
    g.roundRect(x, y, w, h, r);
  } else {
    g.rect(x, y, w, h);
  }
  g.stroke();
}

export function drawWindow(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  g.fillStyle = 'rgba(0,0,16,0.92)';
  g.fillRect(x, y, w, h);
  g.strokeStyle = '#fff';
  g.lineWidth = 3;
  strokeRound(g, x + 4, y + 4, w - 8, h - 8, 6);
  g.lineWidth = 1;
  strokeRound(g, x + 9, y + 9, w - 18, h - 18, 4);
}

const measure = document.createElement('canvas').getContext('2d')!;

export function wrapText(text: string, maxWidth: number, size = 18): string[] {
  measure.font = `${size}px ${FONT}`;
  const out: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(' ');
    let line = '';
    for (const w of words) {
      const cand = line ? line + ' ' + w : w;
      if (!line || measure.measureText(cand).width <= maxWidth) {
        line = cand;
      } else {
        out.push(line);
        line = w;
      }
    }
    out.push(line);
  }
  return out;
}

/** DQ-style typewriter text. */
export class MsgBox {
  static beeper: (() => void) | null = null;

  private lines: string[] = [];
  private total = 0;
  private shown = 0;
  private lastBeep = 0;
  active = false;
  done = true;

  constructor(
    private width: number,
    private size = 18,
  ) {}

  set(text: string) {
    this.lines = wrapText(text, this.width, this.size);
    this.total = this.lines.reduce((a, l) => a + l.length, 0);
    this.shown = 0;
    this.lastBeep = 0;
    this.active = true;
    this.done = this.total === 0;
  }

  clear() {
    this.active = false;
    this.done = true;
    this.lines = [];
  }

  update(dt: number) {
    if (!this.active || this.done) return;
    this.shown = Math.min(this.total, this.shown + dt * 42);
    const fl = Math.floor(this.shown);
    if (fl - this.lastBeep >= 3) {
      this.lastBeep = fl;
      MsgBox.beeper?.();
    }
    if (this.shown >= this.total) this.done = true;
  }

  skip() {
    this.shown = this.total;
    this.done = true;
  }

  get lineCount() {
    return this.lines.length;
  }

  draw(g: CanvasRenderingContext2D, x: number, y: number, lineH = 26) {
    let left = Math.floor(this.shown);
    for (const line of this.lines) {
      if (left <= 0) break;
      const n = Math.min(line.length, left);
      drawText(g, line.slice(0, n), x, y, this.size);
      left -= line.length;
      y += lineH;
    }
  }
}
