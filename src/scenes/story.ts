// Generic full-screen text scene (used for the opening).

import type { Scene } from '../game/app';
import { input } from '../engine/input';
import { chip } from '../engine/audio';
import { W, H, MsgBox, drawTextC } from '../engine/gfx';
import { SFX } from '../data/music';

export class StoryScene implements Scene {
  private msg = new MsgBox(W - 128, 22);
  private page = 0;
  private t = 0;

  constructor(
    private pages: string[],
    private onDone: () => void,
  ) {
    input.flush();
    this.msg.set(pages[0]);
  }

  update(dt: number) {
    this.t += dt;
    this.msg.update(dt);
    if (input.takeClick()) input.press('a', 10);
    let b;
    while ((b = input.poll())) {
      if (b !== 'a' && b !== 'b') continue;
      if (!this.msg.done) {
        this.msg.skip();
      } else {
        this.page++;
        if (this.page >= this.pages.length) {
          this.onDone();
          return;
        }
        chip.playSfx(SFX.confirm);
        this.msg.set(this.pages[this.page]);
      }
    }
  }

  draw(g: CanvasRenderingContext2D) {
    g.fillStyle = '#000';
    g.fillRect(0, 0, W, H);
    this.msg.draw(g, 64, 132, 34);
    if (this.msg.done && Math.floor(this.t * 2) % 2 === 0) {
      drawTextC(g, '▼', W / 2, H - 64, 18);
    }
  }
}

export const OPENING_PAGES = [
  'これは ことばと かずが\nきえてしまった せかいの ものがたり。',
  'まおう ナゾラーが すべてを うばい、\nだれも もじを よめず、\nかずを かぞえられなく なった。',
  '「たすけて……」',
  'ちいさな こえで きみは めを さます。\n\nさあ、ことばと かずを\nとりもどしに いこう!',
];
