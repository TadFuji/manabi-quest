// Game over: the hero totters and falls — but level / zukan / weak-spot
// records are all kept, and the journey can restart immediately.

import { app } from '../game/app';
import type { Scene } from '../game/app';
import { input } from '../engine/input';
import { chip } from '../engine/audio';
import { W, H, MsgBox, drawTextC, drawSprite } from '../engine/gfx';
import { SONGS, SFX } from '../data/music';
import { HERO } from '../data/sprites';
import { maxHp, saveGame } from '../game/state';
import { FieldScene } from './field';

const PAGES = [
  'きみは ちからつきて しまった……',
  'でも だいじょうぶ。\nぼうけんは なんども やりなおせる。\nことばと かずは、きみを まっている。',
];

export class GameOverScene implements Scene {
  private t = 0;
  private phase: 'fall' | 'pages' | 'prompt' = 'fall';
  private msg = new MsgBox(W - 128, 22);
  private page = 0;

  constructor() {
    input.flush();
    chip.stopSong();
    chip.playSong(SONGS.sad, 'sad');
  }

  update(dt: number) {
    this.t += dt;
    this.msg.update(dt);
    if (input.takeClick()) input.press('a', 10);

    if (this.phase === 'fall') {
      if (this.t > 2.4) {
        this.phase = 'pages';
        this.msg.set(PAGES[0]);
      }
      input.flush();
      return;
    }

    let b;
    while ((b = input.poll())) {
      if (b !== 'a' && b !== 'b') continue;
      if (this.phase === 'pages') {
        if (!this.msg.done) {
          this.msg.skip();
        } else {
          this.page++;
          if (this.page >= PAGES.length) {
            this.phase = 'prompt';
          } else {
            chip.playSfx(SFX.confirm);
            this.msg.set(PAGES[this.page]);
          }
        }
      } else if (this.phase === 'prompt' && b === 'a') {
        chip.playSfx(SFX.confirm);
        const s = app.state;
        s.hp = maxHp(s);
        app.graceSteps = 5;
        saveGame(s);
        app.pendingFieldMsg = 'げんきを とりもどした! さあ、もういちど!';
        chip.stopSong();
        app.setScene(new FieldScene());
        return;
      }
    }
  }

  draw(g: CanvasRenderingContext2D) {
    g.fillStyle = '#000';
    g.fillRect(0, 0, W, H);

    if (this.phase === 'fall') {
      // totter, then keel over
      const t = this.t;
      let angle: number;
      if (t < 1.2) {
        angle = Math.sin(t * 12) * 0.25;
      } else {
        angle = Math.min(1, (t - 1.2) / 0.8) * (Math.PI / 2);
      }
      const drop = t < 1.2 ? 0 : Math.min(1, (t - 1.2) / 0.8) * 18;
      g.save();
      g.translate(W / 2, 210 + drop);
      g.rotate(angle);
      drawSprite(g, HERO.down[0], -32, -32, 4);
      g.restore();
      const fade = Math.min(0.7, Math.max(0, (t - 1.6) / 1.2));
      g.fillStyle = `rgba(0,0,0,${fade})`;
      g.fillRect(0, 0, W, H);
      return;
    }

    this.msg.draw(g, 64, 140, 34);
    if (this.phase === 'pages' && this.msg.done && Math.floor(this.t * 2) % 2 === 0) {
      drawTextC(g, '▼', W / 2, H - 80, 18);
    }
    if (this.phase === 'prompt' && Math.floor(this.t * 2) % 2 === 0) {
      drawTextC(g, '▶ もういちど ちょうせんする', W / 2, H - 110, 22, '#ffd75e');
    }
  }
}
