// Level definitions for Twin Worlds.
// Each level names its scene and its seven differences. A difference lives
// in panel-local coordinates (the panel is 600 x 520) so the same spot
// maps onto both pictures. `label` is the short name the hint and the
// found-toast use; it never appears inside the pictures themselves.

export const PANEL = { w: 600, h: 520, ax: 32, bx: 648, y: 76 };

export const LEVELS = [
  {
    id: 'garden',
    name: 'Sunny Garden',
    sub: 'A bright morning, seven things changed',
    sky: ['#bfe6ff', '#eaf7ff'],
    differences: [
      { id: 'butterfly', x: 340, y: 150, r: 30, label: 'butterfly' },
      { id: 'tail', x: 452, y: 452, r: 28, label: 'cat tail' },
      { id: 'flower', x: 300, y: 486, r: 26, label: 'red flower' },
      { id: 'curtain', x: 140, y: 280, r: 30, label: 'curtain' },
      { id: 'cloud', x: 470, y: 100, r: 34, label: 'cloud' },
      { id: 'apple', x: 520, y: 240, r: 24, label: 'apple' },
      { id: 'bird', x: 200, y: 55, r: 26, label: 'bird' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Cozy Kitchen',
    sub: 'Tea is on, seven things changed',
    sky: ['#f7e8c8', '#fdeeda'],
    differences: [
      { id: 'steam', x: 200, y: 228, r: 30, label: 'teapot steam' },
      { id: 'clock', x: 140, y: 110, r: 34, label: 'clock hands' },
      { id: 'orange', x: 415, y: 305, r: 26, label: 'orange' },
      { id: 'bowtie', x: 500, y: 402, r: 26, label: 'cat bowtie' },
      { id: 'jar', x: 150, y: 168, r: 28, label: 'middle jar' },
      { id: 'moon', x: 510, y: 110, r: 32, label: 'moon' },
      { id: 'stripe', x: 300, y: 470, r: 28, label: 'rug stripe' },
    ],
  },
  {
    id: 'space',
    name: 'Starry Space',
    sub: 'Orbit is quiet, seven things changed',
    sky: ['#0b1030', '#1d2b5e'],
    differences: [
      { id: 'window', x: 300, y: 240, r: 28, label: 'rocket window' },
      { id: 'emblem', x: 502, y: 352, r: 26, label: 'flag emblem' },
      { id: 'ring', x: 140, y: 140, r: 40, label: 'planet ring' },
      { id: 'star', x: 520, y: 80, r: 26, label: 'lone star' },
      { id: 'antenna', x: 140, y: 348, r: 28, label: 'satellite antenna' },
      { id: 'crater', x: 470, y: 415, r: 24, label: 'moon crater' },
      { id: 'flame', x: 300, y: 332, r: 28, label: 'rocket flame' },
    ],
  },
];
