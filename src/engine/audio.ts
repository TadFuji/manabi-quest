// Chiptune player: every song / sound effect is synthesized from note data
// via the Web Audio API. No audio files exist anywhere in this project.

import type { Song, WaveType } from '../data/types';

const NOTE_IDX: Record<string, number> = {
  C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5,
  'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
};

function noteFreq(n: string): number {
  const m = /^([A-G]#?)(-?\d)$/.exec(n);
  if (!m) return 440;
  const midi = NOTE_IDX[m[1]] + (parseInt(m[2], 10) + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class Chip {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private songBus: GainNode | null = null;
  private songGen = 0;
  private songTimer: number | null = null;
  private currentName: string | null = null;

  /** create / resume the audio context. Must be called from a user gesture. */
  unlock() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
      const len = Math.floor(this.ctx.sampleRate * 0.5);
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  ctxState(): string {
    return this.ctx ? this.ctx.state : 'none';
  }

  nowPlaying(): string | null {
    return this.currentName;
  }

  playSong(song: Song, name: string) {
    if (!this.ctx) return;
    if (this.currentName === name) return;
    this.stopSong();
    this.currentName = name;
    const ctx = this.ctx;
    const gen = ++this.songGen;
    const bus = ctx.createGain();
    bus.connect(this.master!);
    this.songBus = bus;
    const pass = (t0: number) => {
      if (gen !== this.songGen) return;
      const dur = this.scheduleSong(song, t0, bus);
      if (song.loop) {
        const delayMs = Math.max(20, (t0 + dur - ctx.currentTime - 0.3) * 1000);
        this.songTimer = window.setTimeout(() => pass(t0 + dur), delayMs);
      }
    };
    pass(ctx.currentTime + 0.06);
  }

  stopSong() {
    this.songGen++;
    if (this.songTimer !== null) {
      window.clearTimeout(this.songTimer);
      this.songTimer = null;
    }
    if (this.songBus) {
      try {
        this.songBus.disconnect();
      } catch {
        /* already disconnected */
      }
      this.songBus = null;
    }
    this.currentName = null;
  }

  playSfx(song: Song) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const bus = this.ctx.createGain();
    bus.connect(this.master!);
    this.scheduleSong(song, this.ctx.currentTime + 0.01, bus);
  }

  /** schedule one full pass of a song; returns its duration in seconds */
  private scheduleSong(song: Song, t0: number, bus: GainNode): number {
    const step = 60 / song.bpm / 4;
    let maxSteps = 0;
    for (const tr of song.tracks) {
      let t = t0;
      let steps = 0;
      for (const [n, d] of tr.notes) {
        const dur = d * step;
        if (n) this.note(tr.wave, n, t, dur, tr.volume, bus);
        t += dur;
        steps += d;
      }
      maxSteps = Math.max(maxSteps, steps);
    }
    return maxSteps * step;
  }

  private note(wave: WaveType, n: string, t: number, dur: number, vol: number, bus: GainNode) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.connect(bus);
    const v = vol * 0.17;
    const rel = Math.max(0.02, dur * (wave === 'noise' ? 0.5 : 0.15));
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.005);
    g.gain.setValueAtTime(v, Math.max(t + 0.006, t + dur - rel));
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    if (wave === 'noise') {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf!;
      src.loop = true;
      src.playbackRate.value = noteFreq(n) / 440;
      src.connect(g);
      src.start(t);
      src.stop(t + dur + 0.02);
    } else {
      const o = ctx.createOscillator();
      o.type = wave;
      o.frequency.value = noteFreq(n);
      o.connect(g);
      o.start(t);
      o.stop(t + dur + 0.02);
    }
  }
}

export const chip = new Chip();
