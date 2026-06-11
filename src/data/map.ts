// Field map (24 x 18 tiles). Hand-authored.
// Legend: g grass / f forest / m mountain / w water / p path / c castle

import type { TileId } from './types';

const LEGEND: Record<string, TileId> = {
  g: 'grass',
  f: 'forest',
  m: 'mountain',
  w: 'water',
  p: 'path',
  c: 'castle',
};

const ROWS = [
  'mmmmmmmmmmmmmmmmmmmmmmmm',
  'mggggggggmmmccmmmggggggm',
  'mggffggggmmmppmmmgfffggm',
  'mggffgggggggpgggffffgggm',
  'mgggggggggggpggggffffggm',
  'mggwwwwgggggpggggggggggm',
  'mgwwwwwgggggpgggggwwgggm',
  'mgwwwwggggggpgggggwwwggm',
  'mggwwgggggggpggggggwwggm',
  'mggggggmmgggpggggggggggm',
  'mgggggmmggggpggffggggggm',
  'mffgggggggggpgffffgggggm',
  'mfffggggggggpgfffggggggm',
  'mgfgggggggggpggggggggggm',
  'mgggggggggggpggggggggggm',
  'mgggggggggggpggggmmggggm',
  'mggmmgggggggpggggggggggm',
  'mmmmmmmmmmmmmmmmmmmmmmmm',
];

export const MAP_W = 24;
export const MAP_H = 18;

export function tileAt(x: number, y: number): TileId {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return 'mountain';
  return LEGEND[ROWS[y][x]] ?? 'mountain';
}

export function walkable(x: number, y: number): boolean {
  const t = tileAt(x, y);
  return t === 'grass' || t === 'forest' || t === 'path' || t === 'castle';
}

/** encounter probability per completed step, by tile */
export function encounterRate(x: number, y: number): number {
  switch (tileAt(x, y)) {
    case 'forest':
      return 0.12;
    case 'grass':
      return 0.1;
    case 'path':
      return 0.08;
    default:
      return 0;
  }
}
