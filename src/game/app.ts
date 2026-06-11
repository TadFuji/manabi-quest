import type { SaveData } from './state';

export interface Scene {
  update(dt: number): void;
  draw(g: CanvasRenderingContext2D): void;
}

class App {
  scene: Scene | null = null;
  state!: SaveData;
  /** steps remaining with zero encounter rate (after a battle) */
  graceSteps = 0;
  /** one-shot message to show when the field scene opens (e.g. save greeting) */
  pendingFieldMsg: string | null = null;

  setScene(s: Scene) {
    this.scene = s;
  }
}

export const app = new App();
