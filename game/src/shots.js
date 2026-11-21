// Screenshot staging for Twin Worlds.
// ?shot=1..4 freezes the game in a state that shows it at its best:
// a mid-hunt cover, a second level in progress, a level-complete screen
// and the title. The timer is frozen while staging so every screenshot
// is deterministic; window.__shotReady tells the screenshot script the
// frame is painted. window.__debug exposes the state for play tests.

import { startLevel } from './engine.js';
import { LEVELS } from './levels.js';

export function applyShot(state) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;
  state.muted = true;
  if (shot === '1') {
    startLevel(state, 0);
    // Three finds already marked: butterfly, red flower, apple.
    for (const id of ['butterfly', 'flower', 'apple']) state.found.add(id);
    state.levelScore = 300;
    state.score = 300;
    state.timeLeft = 48;
  } else if (shot === '2') {
    startLevel(state, 1);
    state.found.add('clock');
    state.levelScore = 100;
    state.score = 100;
    state.timeLeft = 65;
  } else if (shot === '3') {
    startLevel(state, 0);
    for (const d of LEVELS[0].differences) state.found.add(d.id);
    state.timeLeft = 63;
    state.levelScore = 700;
    state.score = 700;
    state.screen = 'leveldone';
    state.timeBonus = 630;
    state.levelScore = 1330;
    state.score = 1330;
  } else if (shot === '4') {
    state.screen = 'title';
  }
  // The clock is frozen for staged shots: main.js skips tick() then,
// so the frame never drifts between runs.
  return true;
}

// Staged shots never tick the timer; the main loop checks this flag.
export function isStaged() {
  return new URLSearchParams(window.location.search).has('shot');
}
