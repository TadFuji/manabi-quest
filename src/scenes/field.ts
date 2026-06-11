// Field: tile map walking, random encounters, menu (status / zukan).

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
  wrapText,
} from '../engine/gfx';
import { SONGS, SFX } from '../data/music';
import { HERO, TILES, MONSTERS } from '../data/sprites';
import { MAP_W, MAP_H, tileAt, walkable, encounterRate } from '../data/map';
import { maxHp, rankTitle, saveGame, xpNeed } from '../game/state';
import { MONSTER_DEFS, REGULAR_IDS, ZUKAN_FOOTER } from '../game/monsters';
import { weakCategories } from '../game/quiz';
import { BattleScene } from './battle';
import type { Category, MonsterId } from '../data/types';

const TILE = 32;
type Dir = 'down' | 'up' | 'left' | 'right';

const CAT_NAMES: Record<Category, string> = {
  tashizan: 'たしざん',
  hikizan: 'ひきざん',
  kakezan: 'かけざん',
  warizan: 'わりざん',
  bunshoudai: 'ぶんしょうだい',
  'kanji-yomi': 'かんじの よみ',
  'kanji-kaki': 'かんじの かき',
  teniwoha: 'てにをは',
  kotoba: 'ことばの いみ',
};

type Menu = 'none' | 'main' | 'status' | 'zukan' | 'zukanDetail';

const ZUKAN_IDS: MonsterId[] = [...REGULAR_IDS, 'nazora'];

export class FieldScene implements Scene {
  private dir: Dir = 'down';
  private moving = false;
  private fromX = 0;
  private fromY = 0;
  private mt = 0;
  private animT = 0;
  private msg = new MsgBox(W - 120, 20);
  private msgQ: string[] = [];
  private menu: Menu = 'none';
  private cursor = 0;
  private zCursor = 0;

  constructor() {
    input.flush();
    chip.playSong(SONGS.field, 'field');
    const s = app.state;
    if (app.pendingFieldMsg) {
      this.say(app.pendingFieldMsg);
      app.pendingFieldMsg = null;
    }
    if (!s.bossAnnounced && s.kills >= s.bossAt) {
      s.bossAnnounced = true;
      saveGame(s);
      this.say(
        '…そらが きゅうに くらく なった。\nまおう ナゾラーが ちかくに きている!\nつぎの たたかいで あらわれるぞ!',
      );
    }
  }

  private say(text: string) {
    if (this.msg.active) {
      this.msgQ.push(text);
    } else {
      this.msg.set(text);
    }
  }

  private startBattle(id: MonsterId) {
    saveGame(app.state);
    chip.stopSong();
    app.setScene(new BattleScene(id));
  }

  private onStep() {
    const s = app.state;
    if (tileAt(s.x, s.y) === 'castle') {
      if (s.kills >= s.bossAt) {
        this.startBattle('nazora');
      } else {
        this.say(
          'まおうじょうの とびらは かたく とざされている…\nモンスターを もっと たおせば ひらきそうだ。',
        );
      }
      return;
    }
    if (app.graceSteps > 0) {
      app.graceSteps--;
      return;
    }
    if (Math.random() < encounterRate(s.x, s.y)) {
      if (s.kills >= s.bossAt) {
        this.startBattle('nazora');
      } else {
        this.startBattle(REGULAR_IDS[Math.floor(Math.random() * REGULAR_IDS.length)]);
      }
    }
  }

  update(dt: number) {
    this.animT += dt;
    this.msg.update(dt);
    const s = app.state;

    if (input.takeClick()) input.press('a', 10);

    let b;
    while ((b = input.poll())) {
      if (this.msg.active) {
        if (b === 'a' || b === 'b') {
          if (!this.msg.done) this.msg.skip();
          else if (this.msgQ.length) this.msg.set(this.msgQ.shift()!);
          else this.msg.clear();
        }
        continue;
      }
      switch (this.menu) {
        case 'none':
          if (b === 'b') {
            this.menu = 'main';
            this.cursor = 0;
            chip.playSfx(SFX.confirm);
          }
          break;
        case 'main':
          if (b === 'up' || b === 'down') {
            this.cursor = (this.cursor + (b === 'down' ? 1 : 2)) % 3;
            chip.playSfx(SFX.beep);
          } else if (b === 'a') {
            chip.playSfx(SFX.confirm);
            if (this.cursor === 0) this.menu = 'status';
            else if (this.cursor === 1) {
              this.menu = 'zukan';
              this.zCursor = 0;
            } else this.menu = 'none';
          } else if (b === 'b') {
            this.menu = 'none';
          }
          break;
        case 'status':
          if (b === 'a' || b === 'b') this.menu = 'main';
          break;
        case 'zukan':
          if (b === 'up' || b === 'down') {
            this.zCursor =
              (this.zCursor + (b === 'down' ? 1 : ZUKAN_IDS.length - 1)) % ZUKAN_IDS.length;
            chip.playSfx(SFX.beep);
          } else if (b === 'a') {
            if (s.zukan.includes(ZUKAN_IDS[this.zCursor])) {
              chip.playSfx(SFX.confirm);
              this.menu = 'zukanDetail';
            }
          } else if (b === 'b') {
            this.menu = 'main';
          }
          break;
        case 'zukanDetail':
          if (b === 'a' || b === 'b') this.menu = 'zukan';
          break;
      }
    }

    // walking
    if (!this.msg.active && this.menu === 'none') {
      if (this.moving) {
        this.mt += dt / 0.16;
        if (this.mt >= 1) {
          this.moving = false;
          this.mt = 0;
          this.onStep();
        }
      } else {
        const dirs: [Dir, number, number][] = [
          ['up', 0, -1],
          ['down', 0, 1],
          ['left', -1, 0],
          ['right', 1, 0],
        ];
        for (const [d, dx, dy] of dirs) {
          if (input.isHeld(d)) {
            this.dir = d;
            const nx = s.x + dx;
            const ny = s.y + dy;
            if (walkable(nx, ny)) {
              this.fromX = s.x;
              this.fromY = s.y;
              s.x = nx;
              s.y = ny;
              this.moving = true;
              this.mt = 0;
            }
            break;
          }
        }
      }
    }
  }

  draw(g: CanvasRenderingContext2D) {
    const s = app.state;
    const lerp = (a: number, b2: number, t: number) => a + (b2 - a) * t;
    const px = (this.moving ? lerp(this.fromX, s.x, this.mt) : s.x) * TILE;
    const py = (this.moving ? lerp(this.fromY, s.y, this.mt) : s.y) * TILE;
    const camX = Math.max(0, Math.min(MAP_W * TILE - W, px + TILE / 2 - W / 2));
    const camY = Math.max(0, Math.min(MAP_H * TILE - H, py + TILE / 2 - H / 2));

    g.fillStyle = '#000';
    g.fillRect(0, 0, W, H);
    const x0 = Math.floor(camX / TILE);
    const y0 = Math.floor(camY / TILE);
    for (let y = y0; y <= Math.min(MAP_H - 1, y0 + Math.ceil(H / TILE)); y++) {
      for (let x = x0; x <= Math.min(MAP_W - 1, x0 + Math.ceil(W / TILE)); x++) {
        drawSprite(g, TILES[tileAt(x, y)], x * TILE - camX, y * TILE - camY, 2);
      }
    }
    const frame = this.moving ? Math.floor(this.animT * 8) % 2 : 0;
    drawSprite(g, HERO[this.dir][frame], px - camX, py - camY, 2);

    // HUD
    drawWindow(g, 8, 8, 184, 76);
    drawText(g, `Lv${s.level} ${rankTitle(s.level)}`, 26, 24, 16);
    drawText(g, `HP ${s.hp}/${maxHp(s)}`, 26, 48, 16);

    if (this.menu === 'main') {
      drawWindow(g, W - 168, 8, 160, 116);
      ['つよさ', 'ずかん', 'とじる'].forEach((it, i) => {
        const y = 30 + i * 30;
        if (i === this.cursor) drawText(g, '▶', W - 144, y, 18);
        drawText(g, it, W - 118, y, 18);
      });
    } else if (this.menu === 'status') {
      drawWindow(g, 72, 48, W - 144, 296);
      const weak = weakCategories(s);
      const lines = [
        `Lv${s.level}  しょうごう「${rankTitle(s.level)}」`,
        `HP ${s.hp} / ${maxHp(s)}`,
        `けいけんち ${s.xp} / ${xpNeed(s.level)}`,
        `たおした モンスター ${s.defeated}ひき`,
        `せいかいした もんだい ${s.totalCorrect}もん`,
        `もんだいの レベル ${'★'.repeat(s.difficulty)}${'☆'.repeat(3 - s.difficulty)}`,
        weak.length
          ? `とっくん中: ${weak.map((c) => CAT_NAMES[c]).join('、')}`
          : 'にがては いま ないよ!',
      ];
      lines.forEach((l, i) => drawText(g, l, 104, 76 + i * 32, 18));
    } else if (this.menu === 'zukan') {
      drawWindow(g, 96, 32, W - 192, 340);
      drawTextC(g, 'もんすたーずかん', W / 2, 52, 18, '#ffd75e');
      ZUKAN_IDS.forEach((id, i) => {
        const y = 86 + i * 28;
        const known = s.zukan.includes(id);
        if (i === this.zCursor) drawText(g, '▶', 124, y, 16);
        drawText(g, known ? MONSTER_DEFS[id].name : '???', 150, y, 16, known ? '#fff' : '#777');
      });
      drawTextC(g, `とうろく ${s.zukan.length} / ${ZUKAN_IDS.length}`, W / 2, 322, 14, '#aaa');
    } else if (this.menu === 'zukanDetail') {
      const id = ZUKAN_IDS[this.zCursor];
      const def = MONSTER_DEFS[id];
      drawWindow(g, 56, 32, W - 112, 380);
      const spr = MONSTERS[id];
      drawSprite(g, spr, W / 2 - spr.w, 56, 2);
      drawTextC(g, def.name, W / 2, 56 + spr.h * 2 + 10, 20, '#ffd75e');
      const body = wrapText(def.zukan, W - 192, 16);
      body.forEach((l, i) => drawText(g, l, 96, 56 + spr.h * 2 + 44 + i * 24, 16));
      // okuzuke (the one-line AI reveal lives at the back of the zukan)
      if (id === 'nazora') {
        wrapText(ZUKAN_FOOTER, W - 192, 14).forEach((l, i) =>
          drawText(g, l, 96, 348 + i * 20, 14, '#88ccff'),
        );
      }
    }

    if (this.msg.active) {
      drawWindow(g, 16, H - 130, W - 32, 114);
      this.msg.draw(g, 44, H - 104, 26);
      if (this.msg.done && Math.floor(this.animT * 2) % 2 === 0) {
        drawTextC(g, '▼', W / 2, H - 34, 14);
      }
    } else if (this.menu === 'none') {
      drawText(g, 'Bメニュー', W - 96, H - 26, 12, '#99a');
    }
  }
}
