// Virtual gamepad fed by keyboard, on-screen touch buttons and clicks.

export type Btn = 'up' | 'down' | 'left' | 'right' | 'a' | 'b';

const KEYMAP: Record<string, Btn> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'a',
  ' ': 'a',
  z: 'a',
  Z: 'a',
  Escape: 'b',
  x: 'b',
  X: 'b',
};

export interface ClickPos {
  x: number;
  y: number;
}

class Input {
  private heldSet = new Set<Btn>();
  private queue: Btn[] = [];
  private click: ClickPos | null = null;
  private unlockFns: (() => void)[] = [];
  private canvas: HTMLCanvasElement | null = null;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener('keydown', (e) => {
      this.fireUnlock();
      const b = KEYMAP[e.key];
      if (!b) return;
      e.preventDefault();
      if (!e.repeat) {
        this.heldSet.add(b);
        this.queue.push(b);
      }
    });
    window.addEventListener('keyup', (e) => {
      const b = KEYMAP[e.key];
      if (b) this.heldSet.delete(b);
    });
    canvas.addEventListener('pointerdown', (e) => {
      this.fireUnlock();
      const r = canvas.getBoundingClientRect();
      this.click = {
        x: ((e.clientX - r.left) * canvas.width) / r.width,
        y: ((e.clientY - r.top) * canvas.height) / r.height,
      };
    });
    document.querySelectorAll<HTMLElement>('[data-btn]').forEach((el) => {
      const b = el.dataset.btn as Btn;
      const down = (e: Event) => {
        e.preventDefault();
        this.fireUnlock();
        if (!this.heldSet.has(b)) {
          this.heldSet.add(b);
          this.queue.push(b);
        }
      };
      const up = (e: Event) => {
        e.preventDefault();
        this.heldSet.delete(b);
      };
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('pointerleave', up);
    });
    if (window.matchMedia('(pointer: coarse)').matches) {
      document.body.classList.add('touch');
    }
  }

  /** register a callback for the first user gesture (audio unlock) */
  onFirstGesture(fn: () => void) {
    this.unlockFns.push(fn);
  }

  private fireUnlock() {
    if (!this.unlockFns.length) return;
    const fns = this.unlockFns;
    this.unlockFns = [];
    fns.forEach((f) => f());
  }

  isHeld(b: Btn): boolean {
    return this.heldSet.has(b);
  }

  /** pop one queued button press (returns null when empty) */
  poll(): Btn | null {
    return this.queue.shift() ?? null;
  }

  /** drop any queued presses / clicks (on scene change) */
  flush() {
    this.queue.length = 0;
    this.click = null;
  }

  takeClick(): ClickPos | null {
    const c = this.click;
    this.click = null;
    return c;
  }

  /** programmatic press (debug / automated testing) */
  press(b: Btn, holdMs = 120) {
    this.fireUnlock();
    this.queue.push(b);
    this.heldSet.add(b);
    window.setTimeout(() => this.heldSet.delete(b), holdMs);
  }
}

export const input = new Input();
