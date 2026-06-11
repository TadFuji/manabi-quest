// Bootstrap: canvas, input, audio unlock, main loop.

import { app } from './game/app';
import { input } from './engine/input';
import type { Btn } from './engine/input';
import { chip } from './engine/audio';
import { MsgBox } from './engine/gfx';
import { SFX } from './data/music';
import { TitleScene } from './scenes/title';
import { newSave } from './game/state';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const g = canvas.getContext('2d')!;

input.init(canvas);
input.onFirstGesture(() => chip.unlock());
MsgBox.beeper = () => chip.playSfx(SFX.beep);

app.state = newSave();
app.setScene(new TitleScene());

let last = performance.now();
function frame(now: number) {
  // rAF timestamps can precede the module-eval clock — clamp dt to >= 0,
  // and schedule the next frame first so one bad frame can't stop the loop.
  requestAnimationFrame(frame);
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
  last = now;
  app.scene?.update(dt);
  app.scene?.draw(g);
}
requestAnimationFrame(frame);

// Debug hooks for automated play-testing (harmless during normal play).
declare global {
  interface Window {
    __mq?: Record<string, unknown>;
  }
}
window.__mq = {
  app,
  press: (b: string) => input.press(b as Btn),
  state: () => app.state,
  scene: () => app.scene?.constructor.name,
  setHp: (v: number) => {
    app.state.hp = v;
  },
  setKills: (v: number) => {
    app.state.kills = v;
  },
  audio: () => chip.ctxState(),
  song: () => chip.nowPlaying(),
};
