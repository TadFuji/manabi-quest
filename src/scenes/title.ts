// Title screen: logo, music (the opening "set piece"), new game / continue.

import { app } from '../game/app';
import type { Scene } from '../game/app';
import { input } from '../engine/input';
import { chip } from '../engine/audio';
import { W, H, drawText, drawTextC, drawWindow, drawSprite } from '../engine/gfx';
import { SONGS, SFX } from '../data/music';
import { HERO, MONSTERS } from '../data/sprites';
import { newSave, loadGame, saveGame, GREETINGS } from '../game/state';
import { StoryScene, OPENING_PAGES } from './story';
import { FieldScene } from './field';

type Phase = 'wait' | 'menu' | 'confirm';

export class TitleScene implements Scene {
  private phase: Phase = 'wait';
  private cursor = 0;
  private confirmCursor = 0;
  private t = 0;
  private hasSave = loadGame() !== null;

  constructor() {
    input.flush();
  }

  private openMenu() {
    chip.unlock();
    chip.playSong(SONGS.title, 'title');
    this.phase = 'menu';
    this.cursor = this.hasSave ? 1 : 0;
  }

  update(dt: number) {
    this.t += dt;
    if (input.takeClick()) {
      if (this.phase === 'wait') this.openMenu();
      else input.press('a', 10);
    }
    let b;
    while ((b = input.poll())) {
      if (this.phase === 'wait') {
        this.openMenu();
      } else if (this.phase === 'menu') {
        const n = this.hasSave ? 2 : 1;
        if ((b === 'up' || b === 'down') && n > 1) {
          this.cursor = (this.cursor + 1) % n;
          chip.playSfx(SFX.beep);
        } else if (b === 'a') {
          chip.playSfx(SFX.confirm);
          if (this.cursor === 0) {
            if (this.hasSave) {
              this.phase = 'confirm';
              this.confirmCursor = 0;
            } else {
              this.startNew();
            }
          } else {
            this.continueGame();
          }
        }
      } else if (this.phase === 'confirm') {
        if (b === 'up' || b === 'down') {
          this.confirmCursor = 1 - this.confirmCursor;
          chip.playSfx(SFX.beep);
        } else if (b === 'a') {
          chip.playSfx(SFX.confirm);
          if (this.confirmCursor === 1) this.startNew();
          else this.phase = 'menu';
        } else if (b === 'b') {
          this.phase = 'menu';
        }
      }
    }
  }

  private startNew() {
    app.state = newSave();
    saveGame(app.state);
    app.setScene(
      new StoryScene(OPENING_PAGES, () => {
        chip.stopSong();
        app.setScene(new FieldScene());
      }),
    );
  }

  private continueGame() {
    const s = loadGame();
    app.state = s ?? newSave();
    app.pendingFieldMsg = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    chip.stopSong();
    app.setScene(new FieldScene());
  }

  draw(g: CanvasRenderingContext2D) {
    g.fillStyle = '#000018';
    g.fillRect(0, 0, W, H);
    // starfield
    for (let i = 0; i < 70; i++) {
      const x = (i * 97 + 13) % W;
      const y = (i * 61 + 31) % (H - 120);
      const tw = Math.sin(this.t * 2 + i) * 0.5 + 0.5;
      g.fillStyle = `rgba(255,255,255,${0.2 + tw * 0.5})`;
      g.fillRect(x, y, 2, 2);
    }
    // outer frame
    g.strokeStyle = '#fff';
    g.lineWidth = 3;
    g.strokeRect(20, 20, W - 40, H - 40);
    g.lineWidth = 1;
    g.strokeRect(28, 28, W - 56, H - 56);

    drawTextC(g, 'ことばと かずの ぼうけん', W / 2, 88, 30, '#ffd75e');
    drawTextC(g, '〜 マナビクエスト 〜', W / 2, 136, 38, '#ffffff');

    // hero & monsters lineup
    drawSprite(g, HERO.right[Math.floor(this.t * 4) % 2], 96, 232, 4);
    drawSprite(g, MONSTERS.slimy, 300, 224, 2.5);
    drawSprite(g, MONSTERS.yomiganago, 384, 224, 2.5);

    if (this.phase === 'wait') {
      if (Math.floor(this.t * 2) % 2 === 0) {
        drawTextC(g, 'キーを おすか がめんを タッチしてね', W / 2, 340, 20);
      }
    } else {
      const items = this.hasSave ? ['はじめから', 'つづきから'] : ['はじめから'];
      const wh = 36 + items.length * 30;
      drawWindow(g, W / 2 - 110, 320, 220, wh);
      items.forEach((it, i) => {
        const y = 342 + i * 30;
        if (i === this.cursor) drawText(g, '▶', W / 2 - 84, y, 18);
        drawText(g, it, W / 2 - 56, y, 18);
      });
      if (this.phase === 'confirm') {
        drawWindow(g, W / 2 - 170, 180, 340, 130);
        drawText(g, 'ぼうけんのしょが あるよ。', W / 2 - 140, 202, 18);
        drawText(g, 'けして はじめから?', W / 2 - 140, 228, 18);
        ['やめておく', 'けして はじめる'].forEach((it, i) => {
          const y = 256 + i * 24;
          if (i === this.confirmCursor) drawText(g, '▶', W / 2 - 140, y, 16);
          drawText(g, it, W / 2 - 116, y, 16);
        });
      }
    }
    drawTextC(g, '© 2026 MANABI QUEST', W / 2, H - 52, 14, '#8888aa');
  }
}
