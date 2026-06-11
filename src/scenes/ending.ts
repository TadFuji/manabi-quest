// Ending: story pages -> staff roll (whose very last line is the one-line
// AI reveal) -> congratulations screen with play stats.

import { app } from '../game/app';
import type { Scene } from '../game/app';
import { input } from '../engine/input';
import { chip } from '../engine/audio';
import { W, H, MsgBox, drawText, drawTextC, drawWindow } from '../engine/gfx';
import { SONGS, SFX } from '../data/music';
import { maxHp, saveGame } from '../game/state';
import { FieldScene } from './field';

const PAGES = [
  'さいごの といに きみは こたえた。',
  'うばわれた ことばが、そらへ もどっていく。\nきえていた かずが、ひとつ、ふたつ、と\nかがやきだす。',
  'ナゾラー\n「まいったよ。きみは ほんとうの ゆうしゃだ。」',
  'せかいに ことばと かずが もどった。\nほんが よめる。おかねが かぞえられる。\nそれは ぜんぶ、きみが がんばった しょうこ。',
  '—— おしまい ——\nそして きみの ぼうけんは、まだ つづく。',
];

const ROLL: [string, string][] = [
  ['ことばと かずの ぼうけん', '#ffd75e'],
  ['〜マナビクエスト〜', '#ffd75e'],
  ['', ''],
  ['きかく ・・・・・・ AI', '#fff'],
  ['シナリオ ・・・・・ AI', '#fff'],
  ['ゲームデザイン ・・ AI', '#fff'],
  ['さくが(ドットえ) ・ AI', '#fff'],
  ['さっきょく ・・・・ AI', '#fff'],
  ['もんだいづくり ・・ AI', '#fff'],
  ['プログラム ・・・・ AI', '#fff'],
  ['', ''],
  ['', ''],
  ['この せかいの え も おと も ことば も、', '#88ccff'],
  ['ぜんぶ ひとつの AI が つくりました', '#88ccff'],
];

export class EndingScene implements Scene {
  private t = 0;
  private phase: 'pages' | 'roll' | 'clear' = 'pages';
  private msg = new MsgBox(W - 128, 22);
  private page = 0;
  private rollT = 0;

  constructor() {
    input.flush();
    const s = app.state;
    s.cleared = true;
    saveGame(s);
    chip.stopSong();
    chip.playSong(SONGS.ending, 'ending');
    this.msg.set(PAGES[0]);
  }

  private rollEndY() {
    return H + 60 - this.rollT * 34 + (ROLL.length - 1) * 40;
  }

  update(dt: number) {
    this.t += dt;
    this.msg.update(dt);
    if (input.takeClick()) input.press('a', 10);

    if (this.phase === 'roll') {
      if (this.rollEndY() > H / 2) this.rollT += dt;
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
            this.phase = 'roll';
            this.rollT = 0;
          } else {
            chip.playSfx(SFX.confirm);
            this.msg.set(PAGES[this.page]);
          }
        }
      } else if (this.phase === 'roll') {
        if (this.rollEndY() <= H / 2 && b === 'a') {
          chip.playSfx(SFX.confirm);
          this.phase = 'clear';
        }
      } else if (this.phase === 'clear' && b === 'a') {
        chip.playSfx(SFX.confirm);
        const s = app.state;
        s.kills = 0;
        s.bossAt = 20 + Math.floor(Math.random() * 6);
        s.bossAnnounced = false;
        s.hp = maxHp(s);
        saveGame(s);
        app.pendingFieldMsg = 'あたらしい ぼうけんの はじまりだ!';
        chip.stopSong();
        app.setScene(new FieldScene());
        return;
      }
    }
  }

  draw(g: CanvasRenderingContext2D) {
    g.fillStyle = '#000';
    g.fillRect(0, 0, W, H);

    if (this.phase === 'pages') {
      this.msg.draw(g, 64, 132, 34);
      if (this.msg.done && Math.floor(this.t * 2) % 2 === 0) {
        drawTextC(g, '▼', W / 2, H - 70, 18);
      }
      return;
    }

    if (this.phase === 'roll') {
      const baseY = H + 60 - this.rollT * 34;
      ROLL.forEach(([line, color], i) => {
        const y = baseY + i * 40;
        if (y > -40 && y < H + 40 && line) {
          drawTextC(g, line, W / 2, y, 20, color || '#fff');
        }
      });
      if (this.rollEndY() <= H / 2 && Math.floor(this.t * 2) % 2 === 0) {
        drawTextC(g, '▼', W / 2, H - 48, 16);
      }
      return;
    }

    // clear screen
    const s = app.state;
    drawWindow(g, 48, 80, W - 96, 270);
    drawTextC(g, 'おめでとう!', W / 2, 110, 26, '#ffd75e');
    drawTextC(g, 'きみは ことばと かずを とりもどした!', W / 2, 152, 18);
    drawText(g, `クリアした といの かず  ${s.totalCorrect}もん`, 120, 208, 18);
    drawText(g, `たおした モンスター   ${s.defeated}ひき`, 120, 242, 18);
    if (Math.floor(this.t * 2) % 2 === 0) {
      drawTextC(g, '▶ もういちど ぼうけんする', W / 2, 300, 20, '#ffd75e');
    }
  }
}
