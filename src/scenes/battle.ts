// Battle = answering questions. Wrong twice -> sad defeat staging (HP -10).
// Correct -> fanfare, EXP, heal. Boss (nazora) has 3 "hearts".

import { app } from '../game/app';
import type { Scene } from '../game/app';
import { input } from '../engine/input';
import { chip } from '../engine/audio';
import {
  W,
  H,
  MsgBox,
  drawText,
  drawTextC,
  drawWindow,
  drawSprite,
} from '../engine/gfx';
import { SONGS, SFX } from '../data/music';
import { MONSTERS } from '../data/sprites';
import { MONSTER_DEFS } from '../game/monsters';
import { pickQuestion, recordResult } from '../game/quiz';
import { maxHp, rankTitle, saveGame, xpNeed } from '../game/state';
import type { MonsterId, Question } from '../data/types';
import { FieldScene } from './field';
import { GameOverScene } from './gameover';
import { EndingScene } from './ending';

type Phase = 'flash' | 'msg' | 'choose' | 'dissolve';

export class BattleScene implements Scene {
  private def;
  private isBoss: boolean;
  private phase: Phase = 'flash';
  private t = 0;
  private msg = new MsgBox(W - 150, 19);
  private msgQ: string[] = [];
  private after: (() => void) | null = null;
  private auto = false;
  private q: Question | null = null;
  private attempt = 1;
  private hadWrong = false;
  private hits = 0;
  private cursor = 0;
  private shakeT = 0;
  private dark = 0;
  private darkOn = false;
  private flashEnemyT = 0;
  private dissolveT = 0;
  private dissolveDone = false;
  private enemyGone = false;
  private choiceRects: { x: number; y: number; w: number; h: number }[] = [];

  constructor(private monsterId: MonsterId) {
    input.flush();
    this.def = MONSTER_DEFS[monsterId];
    this.isBoss = monsterId === 'nazora';
    chip.playSong(this.isBoss ? SONGS.boss : SONGS.battle, this.isBoss ? 'boss' : 'battle');
  }

  private showMsgs(texts: string[], after: () => void) {
    this.msg.set(texts[0]);
    this.msgQ = texts.slice(1);
    this.after = after;
    this.auto = false;
    this.phase = 'msg';
  }

  private askQuestion() {
    this.q = pickQuestion(app.state, this.def.cats);
    this.attempt = 1;
    this.hadWrong = false;
    this.reAsk();
  }

  /** (re)display the current question, then open the choices */
  private reAsk() {
    this.msg.set(this.q!.prompt);
    this.msgQ = [];
    this.after = () => {
      this.cursor = 0;
      this.phase = 'choose';
    };
    this.auto = true;
    this.phase = 'msg';
  }

  private exitToField() {
    app.graceSteps = 5;
    saveGame(app.state);
    chip.stopSong();
    app.setScene(new FieldScene());
  }

  private victory() {
    const s = app.state;
    chip.stopSong();
    chip.playSong(SONGS.fanfare, 'fanfare');
    this.enemyGone = true;
    s.defeated++;
    s.kills++;
    if (!s.zukan.includes(this.def.id)) s.zukan.push(this.def.id);
    const heal = Math.min(maxHp(s), s.hp + 10) - s.hp;
    s.hp += heal;
    s.xp += this.def.xp;
    const msgs = [
      `${this.def.name}を たおした!\nうばわれていた こたえが もどってきた!`,
      `けいけんち ${this.def.xp} かくとく!` + (heal > 0 ? `\nHPが ${heal} かいふく した!` : ''),
    ];
    let leveled = false;
    while (s.xp >= xpNeed(s.level)) {
      s.xp -= xpNeed(s.level);
      s.level++;
      leveled = true;
    }
    if (leveled) {
      s.hp = maxHp(s);
      msgs.push(
        `レベルが ${s.level}に あがった!\nしょうごう「${rankTitle(s.level)}」! HP ぜんかいふく!`,
      );
      window.setTimeout(() => chip.playSfx(SFX.levelup), 900);
    }
    saveGame(s);
    this.showMsgs(msgs, () => this.exitToField());
  }

  private bossVictory() {
    const s = app.state;
    chip.stopSong();
    chip.playSong(SONGS.fanfare, 'fanfare');
    s.defeated++;
    s.kills++;
    if (!s.zukan.includes('nazora')) s.zukan.push('nazora');
    s.xp += this.def.xp;
    while (s.xp >= xpNeed(s.level)) {
      s.xp -= xpNeed(s.level);
      s.level++;
      s.hp = maxHp(s);
    }
    saveGame(s);
    this.phase = 'dissolve';
    this.dissolveT = 0;
  }

  private answer(i: number) {
    const s = app.state;
    const q = this.q!;
    if (i === q.answer) {
      chip.playSfx(SFX.confirm);
      this.flashEnemyT = 0.5;
      this.hits++;
      recordResult(s, q, this.hadWrong ? 'correctWithHint' : 'correct');
      if (this.hits >= this.def.need) {
        if (this.isBoss) this.bossVictory();
        else this.victory();
      } else {
        const left = this.def.need - this.hits;
        const cheer = this.isBoss
          ? [
              'せいかい! ナゾラーに いちげき!',
              `ナゾラーの ちからが よわまった!\nあと ${left}もん せいかいで かてるぞ!`,
            ]
          : ['せいかい! てごたえ あり!', `あと ${left}かい せいかいで たおせるぞ!`];
        this.showMsgs(cheer, () => this.askQuestion());
      }
    } else if (this.attempt === 1) {
      this.attempt = 2;
      this.hadWrong = true;
      chip.playSfx(SFX.damage);
      this.shakeT = 0.35;
      this.showMsgs([`ヒント: ${q.hint}`, 'もういちど かんがえてみよう!'], () => this.reAsk());
    } else {
      // second miss: sad music + darkened defeat staging, HP -10
      recordResult(s, q, 'wrong');
      s.hp = Math.max(0, s.hp - 10);
      chip.stopSong();
      chip.playSong(SONGS.sad, 'sad');
      chip.playSfx(SFX.damage);
      this.shakeT = 0.5;
      this.darkOn = true;
      const reveal = [
        `こたえは 「${q.choices[q.answer]}」 だったよ。`,
        'まちがいは、つよくなる はじめの いっぽ。',
      ];
      if (s.hp <= 0) {
        this.showMsgs(['こうげきを うけた! HPが 10 へった…', ...reveal], () => {
          saveGame(s);
          chip.stopSong();
          app.setScene(new GameOverScene());
        });
      } else if (this.isBoss) {
        this.showMsgs(
          [
            'ナゾラーの こうげき! HPが 10 へった…',
            ...reveal,
            'ナゾラーは まだ めのまえに いる…!',
          ],
          () => {
            this.darkOn = false;
            chip.stopSong();
            chip.playSong(SONGS.boss, 'boss');
            this.askQuestion();
          },
        );
      } else {
        this.showMsgs(['まけてしまった… HPが 10 へった。', ...reveal], () => this.exitToField());
      }
    }
  }

  update(dt: number) {
    this.t += dt;
    this.msg.update(dt);
    if (this.shakeT > 0) this.shakeT -= dt;
    if (this.flashEnemyT > 0) this.flashEnemyT -= dt;
    this.dark += ((this.darkOn ? 1 : 0) - this.dark) * Math.min(1, dt * 5);

    if (this.phase === 'flash') {
      if (this.t > 0.75) {
        this.showMsgs([this.def.intro], () => this.askQuestion());
      }
      return;
    }
    if (this.phase === 'dissolve') {
      this.dissolveT += dt;
      if (this.dissolveT > 1.6 && !this.dissolveDone) {
        this.dissolveDone = true;
        this.enemyGone = true;
        this.showMsgs(
          ['ナゾラー\n「ばかな…… わたしの ちからが\nきえていく…!」'],
          () => app.setScene(new EndingScene()),
        );
      }
      return;
    }

    const click = input.takeClick();
    if (click) {
      if (this.phase === 'choose') {
        const i = this.choiceRects.findIndex(
          (r) => click.x >= r.x && click.x <= r.x + r.w && click.y >= r.y && click.y <= r.y + r.h,
        );
        if (i >= 0) {
          this.cursor = i;
          this.answer(i);
          return;
        }
      } else {
        input.press('a', 10);
      }
    }

    if (this.phase === 'msg' && this.auto && this.msg.done) {
      const f = this.after;
      this.after = null;
      this.auto = false;
      f?.();
      return;
    }

    let b;
    while ((b = input.poll())) {
      if (this.phase === 'msg') {
        if (this.auto) {
          if (!this.msg.done) this.msg.skip();
          continue;
        }
        if (b !== 'a' && b !== 'b') continue;
        if (!this.msg.done) {
          this.msg.skip();
        } else if (this.msgQ.length) {
          this.msg.set(this.msgQ.shift()!);
        } else {
          const f = this.after;
          this.after = null;
          if (f) {
            f();
            return;
          }
        }
      } else if (this.phase === 'choose') {
        if (b === 'up' || b === 'down') {
          this.cursor = (this.cursor + 2) % 4;
          chip.playSfx(SFX.beep);
        } else if (b === 'left' || b === 'right') {
          this.cursor = this.cursor % 2 === 0 ? this.cursor + 1 : this.cursor - 1;
          chip.playSfx(SFX.beep);
        } else if (b === 'a') {
          this.answer(this.cursor);
          return;
        }
      }
    }
  }

  draw(g: CanvasRenderingContext2D) {
    const s = app.state;
    if (this.phase === 'flash') {
      g.fillStyle = Math.floor(this.t * 18) % 2 ? '#fff' : '#000';
      g.fillRect(0, 0, W, H);
      return;
    }
    g.save();
    if (this.shakeT > 0) {
      g.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    }
    g.fillStyle = '#000010';
    g.fillRect(-8, -8, W + 16, H + 16);

    // arena
    g.fillStyle = this.isBoss ? '#1c0a26' : '#0a1608';
    g.fillRect(64, 28, W - 128, 220);
    g.strokeStyle = '#fff';
    g.lineWidth = 2;
    g.strokeRect(64, 28, W - 128, 220);

    // enemy
    const spr = MONSTERS[this.monsterId];
    const scale = 4;
    const ex = W / 2 - (spr.w * scale) / 2;
    const ey = 142 - (spr.h * scale) / 2 + 24;
    let visible = !this.enemyGone;
    if (this.flashEnemyT > 0 && Math.floor(this.flashEnemyT * 20) % 2 === 0) visible = false;
    if (this.phase === 'dissolve') {
      g.globalAlpha = Math.max(0, 1 - this.dissolveT / 1.4);
      visible = this.dissolveT < 1.4;
    }
    if (visible) drawSprite(g, spr, ex, ey, scale);
    g.globalAlpha = 1;

    // defeat darkness (under the windows so text stays readable)
    if (this.dark > 0.01) {
      g.fillStyle = `rgba(0,0,0,${this.dark * 0.62})`;
      g.fillRect(-8, -8, W + 16, H + 16);
    }

    // player HUD
    drawWindow(g, 8, 8, 184, 76);
    drawText(g, `Lv${s.level} ${rankTitle(s.level)}`, 26, 24, 16);
    drawText(g, `HP ${s.hp}/${maxHp(s)}`, 26, 48, 16);

    // boss hearts
    if (this.isBoss) {
      drawWindow(g, W - 212, 8, 204, 64);
      drawText(g, 'まおうの ちから', W - 188, 22, 14);
      const left = Math.max(0, this.def.need - this.hits);
      drawText(g, '●'.repeat(left) + '○'.repeat(this.def.need - left), W - 188, 42, 18, '#ff6688');
    }

    // choices
    if (this.phase === 'choose' && this.q) {
      const bx = 16;
      const bw = W - 32;
      const by = H - 252;
      const bh = 112;
      drawWindow(g, bx, by, bw, bh);
      this.choiceRects = [];
      for (let i = 0; i < 4; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = bx + 28 + col * (bw / 2);
        const cy = by + 22 + row * 44;
        this.choiceRects.push({ x: cx - 10, y: cy - 10, w: bw / 2 - 28, h: 42 });
        if (i === this.cursor) drawText(g, '▶', cx, cy, 18, '#ffd75e');
        drawText(g, this.q.choices[i], cx + 26, cy, 18);
      }
    }

    // message window
    if (this.msg.active) {
      drawWindow(g, 16, H - 130, W - 32, 114);
      this.msg.draw(g, 44, H - 106, 25);
      if (this.phase === 'msg' && !this.auto && this.msg.done && Math.floor(this.t * 2) % 2 === 0) {
        drawTextC(g, '▼', W / 2, H - 34, 14);
      }
    }
    g.restore();
  }
}
