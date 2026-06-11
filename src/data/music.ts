// Original 8-bit chiptune score for "マナビクエスト" (Manabi Quest).
//
// All melodies, basslines and rhythms here are original compositions written
// for this game. They evoke the mood of classic Famicom-era adventure RPGs
// without quoting or imitating any existing game's melody.
//
// Data contract (see ./types.ts):
//   - NoteEvent = [noteName | null, steps]; 1 step = one 16th note.
//   - Note names use sharps only (e.g. 'C4', 'F#5'), null = rest.
//   - Within a single Song every Track must share the same total step count
//     so that loops splice cleanly.
//   - For 'noise' tracks the note name only sets the noise pitch.
//
// Convention used below: 4/4 time, so one bar = 16 steps. The verification
// script confirms every Song's tracks sum to an identical step total.

import type { Song, SongId, SfxId } from './types';

// ---------------------------------------------------------------------------
// Drum pattern helpers (noise track). Pitch names are arbitrary but chosen so
// the engine can map them to distinct noise rates: low for kick, high for hat.
// ---------------------------------------------------------------------------
const KICK = 'C2';
const SNARE = 'A2';
const HAT = 'C5';

// One bar (16 steps) of a steady "kick / hat / snare / hat" backbeat.
const drumBackbeat = (): [string | null, number][] => [
  [KICK, 2], [HAT, 2], [SNARE, 2], [HAT, 2],
  [KICK, 2], [HAT, 2], [SNARE, 2], [HAT, 2],
];

// One bar of a faster, driving battle beat.
const drumBattle = (): [string | null, number][] => [
  [KICK, 1], [HAT, 1], [KICK, 1], [HAT, 1],
  [SNARE, 1], [HAT, 1], [KICK, 1], [HAT, 1],
  [KICK, 1], [HAT, 1], [KICK, 1], [HAT, 1],
  [SNARE, 1], [HAT, 1], [SNARE, 1], [HAT, 1],
];

// One bar of a heavy, sparse boss beat with tom-like low hits.
const drumBoss = (): [string | null, number][] => [
  [KICK, 4], [SNARE, 4],
  [KICK, 2], [KICK, 2], [SNARE, 4],
];

export const SONGS: Record<SongId, Song> = {
  // -------------------------------------------------------------------------
  // TITLE — 16 bars. Grand, heroic opening that earns being the centrepiece.
  // Builds from a brass-like fanfare into a soaring main theme.
  // -------------------------------------------------------------------------
  title: {
    bpm: 132,
    loop: true,
    tracks: [
      {
        // Melody (square). 16 bars = 256 steps.
        wave: 'square',
        volume: 0.5,
        notes: [
          // Bars 1-2: rising call-to-adventure fanfare.
          ['C5', 4], ['E5', 4], ['G5', 4], ['C6', 4],
          ['B5', 6], ['G5', 2], ['A5', 4], ['E5', 4],
          // Bars 3-4: answering phrase.
          ['F5', 4], ['A5', 4], ['G5', 4], ['E5', 4],
          ['D5', 8], ['G5', 4], ['F5', 4],
          // Bars 5-6: main theme statement.
          ['E5', 4], ['D5', 2], ['C5', 2], ['D5', 4], ['E5', 4],
          ['F5', 6], ['E5', 2], ['D5', 4], ['G4', 4],
          // Bars 7-8: lift upward.
          ['C5', 4], ['E5', 4], ['F5', 4], ['G5', 4],
          ['A5', 8], ['G5', 4], ['E5', 4],
          // Bars 9-10: bold high restatement.
          ['G5', 4], ['C6', 4], ['B5', 4], ['G5', 4],
          ['A5', 6], ['F5', 2], ['G5', 4], ['E5', 4],
          // Bars 11-12: descending resolve.
          ['F5', 4], ['E5', 4], ['D5', 4], ['C5', 4],
          ['D5', 8], ['F5', 4], ['A5', 4],
          // Bars 13-14: triumphant climb.
          ['G5', 4], ['A5', 4], ['B5', 4], ['C6', 4],
          ['D6', 6], ['C6', 2], ['B5', 4], ['A5', 4],
          // Bars 15-16: grand cadence back to the top.
          ['G5', 4], ['E5', 4], ['F5', 4], ['D5', 4],
          ['C5', 8], ['G4', 4], [null, 4],
        ],
      },
      {
        // Bass (triangle). 16 bars = 256 steps. Strong root movement.
        wave: 'triangle',
        volume: 0.6,
        notes: [
          ['C3', 4], ['C3', 4], ['G2', 4], ['G2', 4],
          ['A2', 4], ['A2', 4], ['E2', 4], ['E2', 4],
          ['F2', 4], ['F2', 4], ['C3', 4], ['C3', 4],
          ['G2', 4], ['G2', 4], ['G2', 4], ['G2', 4],
          ['C3', 4], ['C3', 4], ['A2', 4], ['A2', 4],
          ['F2', 4], ['F2', 4], ['G2', 4], ['G2', 4],
          ['C3', 4], ['C3', 4], ['F2', 4], ['F2', 4],
          ['G2', 4], ['G2', 4], ['G2', 4], ['G2', 4],
          ['C3', 4], ['C3', 4], ['E2', 4], ['E2', 4],
          ['F2', 4], ['F2', 4], ['D3', 4], ['D3', 4],
          ['F2', 4], ['F2', 4], ['G2', 4], ['G2', 4],
          ['D3', 4], ['D3', 4], ['F2', 4], ['F2', 4],
          ['G2', 4], ['G2', 4], ['C3', 4], ['C3', 4],
          ['D3', 4], ['D3', 4], ['G2', 4], ['G2', 4],
          ['C3', 4], ['C3', 4], ['F2', 4], ['F2', 4],
          ['G2', 4], ['G2', 4], ['C3', 4], ['C3', 4],
        ],
      },
      {
        // Drums (noise). 16 bars = 256 steps.
        wave: 'noise',
        volume: 0.22,
        notes: [
          ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(),
          ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(),
          ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(),
          ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(),
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // FIELD — 12 bars. Pastoral, forward-moving overworld tune. Light and bouncy
  // so it stays pleasant over long exploration.
  // -------------------------------------------------------------------------
  field: {
    bpm: 120,
    loop: true,
    tracks: [
      {
        // Melody (square). 12 bars = 192 steps.
        wave: 'square',
        volume: 0.5,
        notes: [
          // Bars 1-2: skipping main hook.
          ['G4', 2], ['A4', 2], ['B4', 4], ['D5', 4], ['B4', 4],
          ['C5', 2], ['B4', 2], ['A4', 4], ['G4', 4], [null, 4],
          // Bars 3-4: answer.
          ['A4', 2], ['B4', 2], ['C5', 4], ['E5', 4], ['C5', 4],
          ['D5', 2], ['C5', 2], ['B4', 4], ['A4', 4], [null, 4],
          // Bars 5-6: rise.
          ['B4', 4], ['D5', 4], ['G5', 4], ['E5', 4],
          ['D5', 6], ['C5', 2], ['B4', 4], ['G4', 4],
          // Bars 7-8: playful turn.
          ['C5', 2], ['D5', 2], ['E5', 4], ['G5', 4], ['E5', 4],
          ['F5', 2], ['E5', 2], ['D5', 4], ['C5', 4], [null, 4],
          // Bars 9-10: warm lower phrase.
          ['E5', 4], ['D5', 4], ['C5', 4], ['B4', 4],
          ['A4', 6], ['B4', 2], ['C5', 4], ['D5', 4],
          // Bars 11-12: cadence home.
          ['E5', 4], ['D5', 2], ['C5', 2], ['B4', 4], ['G4', 4],
          ['A4', 4], ['B4', 4], ['G4', 8],
        ],
      },
      {
        // Bass (triangle). 12 bars = 192 steps. Walking root-fifth feel.
        wave: 'triangle',
        volume: 0.6,
        notes: [
          ['G2', 4], ['D3', 4], ['G2', 4], ['B2', 4],
          ['C3', 4], ['G2', 4], ['D3', 4], ['D3', 4],
          ['A2', 4], ['E3', 4], ['A2', 4], ['C3', 4],
          ['D3', 4], ['A2', 4], ['D3', 4], ['D3', 4],
          ['G2', 4], ['D3', 4], ['G2', 4], ['B2', 4],
          ['C3', 4], ['G2', 4], ['G2', 4], ['G2', 4],
          ['C3', 4], ['G3', 4], ['C3', 4], ['E3', 4],
          ['D3', 4], ['A2', 4], ['D3', 4], ['D3', 4],
          ['C3', 4], ['G2', 4], ['A2', 4], ['E3', 4],
          ['F2', 4], ['C3', 4], ['G2', 4], ['D3', 4],
          ['C3', 4], ['G2', 4], ['G2', 4], ['B2', 4],
          ['D3', 4], ['D3', 4], ['G2', 4], ['G2', 4],
        ],
      },
      {
        // Drums (noise). 12 bars = 192 steps.
        wave: 'noise',
        volume: 0.22,
        notes: [
          ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(),
          ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(),
          ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(),
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // BATTLE — 8 bars. Fast, tense encounter music. Urgent minor-key riff.
  // -------------------------------------------------------------------------
  battle: {
    bpm: 168,
    loop: true,
    tracks: [
      {
        // Melody (square). 8 bars = 128 steps.
        wave: 'square',
        volume: 0.5,
        notes: [
          // Bars 1-2: nervous repeating riff.
          ['A4', 2], ['A4', 2], ['C5', 2], ['A4', 2], ['E5', 4], ['D5', 4],
          ['A4', 2], ['A4', 2], ['C5', 2], ['E5', 2], ['D5', 4], ['B4', 4],
          // Bars 3-4: rising tension.
          ['C5', 2], ['D5', 2], ['E5', 4], ['G5', 4], ['E5', 4],
          ['F5', 2], ['E5', 2], ['D5', 2], ['C5', 2], ['B4', 4], ['A4', 4],
          // Bars 5-6: higher attack.
          ['E5', 2], ['E5', 2], ['G5', 2], ['E5', 2], ['A5', 4], ['G5', 4],
          ['F5', 2], ['E5', 2], ['D5', 2], ['F5', 2], ['E5', 4], ['C5', 4],
          // Bars 7-8: spin down to loop.
          ['D5', 2], ['C5', 2], ['B4', 2], ['A4', 2], ['G4', 4], ['B4', 4],
          ['A4', 2], ['C5', 2], ['E5', 2], ['C5', 2], ['A4', 4], [null, 4],
        ],
      },
      {
        // Bass (triangle). 8 bars = 128 steps. Driving eighth-note pulse.
        wave: 'triangle',
        volume: 0.6,
        notes: [
          ['A2', 2], ['A2', 2], ['A2', 2], ['A2', 2], ['A2', 2], ['A2', 2], ['A2', 2], ['A2', 2],
          ['A2', 2], ['A2', 2], ['A2', 2], ['A2', 2], ['G2', 2], ['G2', 2], ['G2', 2], ['G2', 2],
          ['C3', 2], ['C3', 2], ['C3', 2], ['C3', 2], ['G2', 2], ['G2', 2], ['G2', 2], ['G2', 2],
          ['F2', 2], ['F2', 2], ['F2', 2], ['F2', 2], ['E2', 2], ['E2', 2], ['E2', 2], ['E2', 2],
          ['A2', 2], ['A2', 2], ['A2', 2], ['A2', 2], ['C3', 2], ['C3', 2], ['C3', 2], ['C3', 2],
          ['F2', 2], ['F2', 2], ['F2', 2], ['F2', 2], ['G2', 2], ['G2', 2], ['G2', 2], ['G2', 2],
          ['G2', 2], ['G2', 2], ['G2', 2], ['G2', 2], ['E2', 2], ['E2', 2], ['E2', 2], ['E2', 2],
          ['A2', 2], ['A2', 2], ['A2', 2], ['A2', 2], ['E2', 2], ['E2', 2], ['A2', 2], ['A2', 2],
        ],
      },
      {
        // Drums (noise). 8 bars = 128 steps.
        wave: 'noise',
        volume: 0.22,
        notes: [
          ...drumBattle(), ...drumBattle(), ...drumBattle(), ...drumBattle(),
          ...drumBattle(), ...drumBattle(), ...drumBattle(), ...drumBattle(),
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // BOSS — 12 bars. Ominous, heavy theme for the demon king Nazora. Slow,
  // looming melody over a brooding minor bass.
  // -------------------------------------------------------------------------
  boss: {
    bpm: 96,
    loop: true,
    tracks: [
      {
        // Melody (square). 12 bars = 192 steps.
        wave: 'square',
        volume: 0.5,
        notes: [
          // Bars 1-2: dark looming motif.
          ['D4', 4], ['D4', 2], ['F4', 2], ['E4', 4], ['D4', 4],
          ['A4', 4], ['G4', 2], ['F4', 2], ['E4', 6], [null, 2],
          // Bars 3-4: menace creeps higher.
          ['F4', 4], ['A4', 2], ['C5', 2], ['A#4', 4], ['A4', 4],
          ['G4', 4], ['F4', 2], ['E4', 2], ['D4', 6], [null, 2],
          // Bars 5-6: rising dread.
          ['A4', 4], ['C5', 2], ['D5', 2], ['C5', 4], ['A4', 4],
          ['A#4', 4], ['A4', 2], ['G4', 2], ['F4', 6], [null, 2],
          // Bars 7-8: stabbing high phrase.
          ['D5', 2], ['D5', 2], ['F5', 4], ['E5', 4], ['C5', 4],
          ['D5', 4], ['A4', 2], ['F4', 2], ['D4', 6], [null, 2],
          // Bars 9-10: grinding lower turn.
          ['E4', 4], ['G4', 2], ['A#4', 2], ['A4', 4], ['G4', 4],
          ['F4', 4], ['E4', 2], ['D4', 2], ['C4', 6], [null, 2],
          // Bars 11-12: final ominous descent before the loop.
          ['F4', 4], ['E4', 2], ['D4', 2], ['A4', 4], ['F4', 4],
          ['E4', 4], ['D4', 4], ['D4', 6], [null, 2],
        ],
      },
      {
        // Bass (triangle). 12 bars = 192 steps. Heavy ostinato.
        wave: 'triangle',
        volume: 0.6,
        notes: [
          ['D2', 4], ['D2', 4], ['D2', 4], ['A2', 4],
          ['D2', 4], ['D2', 4], ['A2', 4], ['A2', 4],
          ['F2', 4], ['F2', 4], ['F2', 4], ['C3', 4],
          ['G2', 4], ['G2', 4], ['D2', 4], ['D2', 4],
          ['A2', 4], ['A2', 4], ['A2', 4], ['F2', 4],
          ['A#2', 4], ['A#2', 4], ['F2', 4], ['F2', 4],
          ['D2', 4], ['D2', 4], ['F2', 4], ['F2', 4],
          ['D2', 4], ['A2', 4], ['D2', 4], ['D2', 4],
          ['C3', 4], ['C3', 4], ['A2', 4], ['A2', 4],
          ['F2', 4], ['F2', 4], ['C3', 4], ['C3', 4],
          ['F2', 4], ['F2', 4], ['A2', 4], ['A2', 4],
          ['D2', 4], ['A2', 4], ['D2', 4], ['D2', 4],
        ],
      },
      {
        // Drums (noise). 12 bars = 192 steps. drumBoss() is 16 steps/bar.
        wave: 'noise',
        volume: 0.22,
        notes: [
          ...drumBoss(), ...drumBoss(), ...drumBoss(), ...drumBoss(),
          ...drumBoss(), ...drumBoss(), ...drumBoss(), ...drumBoss(),
          ...drumBoss(), ...drumBoss(), ...drumBoss(), ...drumBoss(),
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // FANFARE — 2 bars. Bright victory sting. loop: false.
  // -------------------------------------------------------------------------
  fanfare: {
    bpm: 140,
    loop: false,
    tracks: [
      {
        // Melody (square). 2 bars = 32 steps.
        wave: 'square',
        volume: 0.5,
        notes: [
          ['C5', 2], ['C5', 2], ['C5', 2], ['E5', 2], ['G5', 4], ['C6', 4],
          ['A5', 2], ['B5', 2], ['C6', 8], [null, 4],
        ],
      },
      {
        // Bass (triangle). 2 bars = 32 steps.
        wave: 'triangle',
        volume: 0.6,
        notes: [
          ['C3', 4], ['G2', 4], ['C3', 4], ['E3', 4],
          ['F3', 4], ['G2', 4], ['C3', 8],
        ],
      },
      {
        // Drums (noise). 2 bars = 32 steps.
        wave: 'noise',
        volume: 0.22,
        notes: [
          // Bar 1: snare roll into a hit.
          [SNARE, 1], [SNARE, 1], [SNARE, 1], [SNARE, 1], [KICK, 2], [HAT, 2],
          [KICK, 2], [SNARE, 2], [HAT, 2], [HAT, 2],
          // Bar 2: driving fill to a final crash.
          [KICK, 2], [HAT, 2], [SNARE, 2], [HAT, 2],
          [KICK, 4], [SNARE, 4],
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // SAD — 4 bars. Gentle, downcast minor tune for a wrong answer / defeat.
  // loop: false.
  // -------------------------------------------------------------------------
  sad: {
    bpm: 84,
    loop: false,
    tracks: [
      {
        // Melody (square). 4 bars = 64 steps.
        wave: 'square',
        volume: 0.5,
        notes: [
          ['A4', 4], ['G4', 4], ['F4', 4], ['E4', 4],
          ['D4', 6], ['E4', 2], ['F4', 4], [null, 4],
          ['G4', 4], ['F4', 4], ['E4', 4], ['D4', 4],
          ['C4', 8], ['A3', 8],
        ],
      },
      {
        // Bass (triangle). 4 bars = 64 steps.
        wave: 'triangle',
        volume: 0.6,
        notes: [
          ['A2', 8], ['F2', 8],
          ['D2', 8], ['E2', 8],
          ['C3', 8], ['A2', 8],
          ['F2', 8], ['A2', 8],
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // ENDING — 12 bars. Warm, moving finale. Lyrical major-key theme.
  // loop: true (plays gently under the closing scene).
  // -------------------------------------------------------------------------
  ending: {
    bpm: 100,
    loop: true,
    tracks: [
      {
        // Melody (square). 12 bars = 192 steps.
        wave: 'square',
        volume: 0.5,
        notes: [
          // Bars 1-2: tender opening.
          ['G4', 4], ['C5', 4], ['E5', 4], ['D5', 4],
          ['C5', 6], ['B4', 2], ['C5', 4], ['G4', 4],
          // Bars 3-4: gentle rise.
          ['A4', 4], ['C5', 4], ['F5', 4], ['E5', 4],
          ['D5', 6], ['C5', 2], ['B4', 4], ['G4', 4],
          // Bars 5-6: heartfelt climb.
          ['C5', 4], ['E5', 4], ['G5', 4], ['F5', 4],
          ['E5', 6], ['D5', 2], ['C5', 4], ['E5', 4],
          // Bars 7-8: soaring peak.
          ['F5', 4], ['G5', 4], ['A5', 4], ['G5', 4],
          ['E5', 8], ['D5', 4], ['C5', 4],
          // Bars 9-10: warm settling.
          ['D5', 4], ['C5', 4], ['B4', 4], ['A4', 4],
          ['G4', 6], ['A4', 2], ['B4', 4], ['C5', 4],
          // Bars 11-12: peaceful cadence.
          ['E5', 4], ['D5', 4], ['C5', 4], ['B4', 4],
          ['C5', 8], ['G4', 4], [null, 4],
        ],
      },
      {
        // Bass (triangle). 12 bars = 192 steps. Soft arpeggiated roots.
        wave: 'triangle',
        volume: 0.6,
        notes: [
          ['C3', 4], ['G2', 4], ['C3', 4], ['E3', 4],
          ['C3', 4], ['G2', 4], ['C3', 4], ['C3', 4],
          ['F2', 4], ['C3', 4], ['F2', 4], ['A2', 4],
          ['G2', 4], ['D3', 4], ['G2', 4], ['G2', 4],
          ['C3', 4], ['G2', 4], ['C3', 4], ['E3', 4],
          ['A2', 4], ['E3', 4], ['A2', 4], ['C3', 4],
          ['F2', 4], ['C3', 4], ['F2', 4], ['A2', 4],
          ['C3', 4], ['G2', 4], ['C3', 4], ['C3', 4],
          ['G2', 4], ['D3', 4], ['G2', 4], ['B2', 4],
          ['C3', 4], ['G2', 4], ['C3', 4], ['E3', 4],
          ['A2', 4], ['E3', 4], ['F2', 4], ['G2', 4],
          ['C3', 4], ['G2', 4], ['C3', 4], ['C3', 4],
        ],
      },
      {
        // Drums (noise). 12 bars = 192 steps. Soft backbeat.
        wave: 'noise',
        volume: 0.22,
        notes: [
          ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(),
          ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(),
          ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(), ...drumBackbeat(),
        ],
      },
    ],
  },
};

export const SFX: Record<SfxId, Song> = {
  // Single short high blip for message-advance "pe pe pe".
  beep: {
    bpm: 160,
    loop: false,
    tracks: [
      {
        wave: 'square',
        volume: 0.5,
        notes: [['C6', 1]],
      },
    ],
  },

  // Two-note rising confirmation chime.
  confirm: {
    bpm: 160,
    loop: false,
    tracks: [
      {
        wave: 'square',
        volume: 0.5,
        notes: [['G5', 1], ['C6', 2]],
      },
    ],
  },

  // Short descending noise burst for taking damage.
  damage: {
    bpm: 160,
    loop: false,
    tracks: [
      {
        wave: 'noise',
        volume: 0.5,
        notes: [['C5', 1], ['G4', 1], ['C4', 2]],
      },
    ],
  },

  // Rising arpeggio for leveling up.
  levelup: {
    bpm: 160,
    loop: false,
    tracks: [
      {
        wave: 'square',
        volume: 0.5,
        notes: [['C5', 1], ['E5', 1], ['G5', 1], ['C6', 1], ['E6', 1], ['G6', 3]],
      },
    ],
  },
};
