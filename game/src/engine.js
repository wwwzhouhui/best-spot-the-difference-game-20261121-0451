// Game state for Twin Worlds: one object, no framework.
// Screens: title, playing, paused, leveldone, alldone, timeout.
// A click lands in one of the two panels; the panels share panel-local
// coordinates, so a difference found on the left is marked on the right
// too. Wrong clicks cost 5 points, hints cost 15 and are limited to 3 a
// level. Finishing a level pays the seconds left times 10.

import { LEVELS, PANEL } from './levels.js';

export const LEVEL_SECONDS = 90;
export const HINTS_PER_LEVEL = 3;
export const POINTS_FOUND = 100;
export const POINTS_WRONG = 5;
export const POINTS_HINT = 15;

export function newGame() {
  return {
    screen: 'title',
    levelIndex: 0,
    found: new Set(),
    score: 0,
    levelScore: 0,
    timeLeft: LEVEL_SECONDS,
    hintsLeft: HINTS_PER_LEVEL,
    total: 0,
    best: 0,
    cursor: { x: 640, y: 336 },
    mouse: { x: -1, y: -1, inside: false },
    wrongFlash: null,
    hintRing: null,
    toast: '',
    toastUntil: 0,
    muted: false,
    timeBonus: 0,
  };
}

export function currentLevel(state) {
  return LEVELS[state.levelIndex];
}

export function startLevel(state, index) {
  state.levelIndex = index;
  state.found = new Set();
  state.levelScore = 0;
  state.timeLeft = LEVEL_SECONDS;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.wrongFlash = null;
  state.hintRing = null;
  state.screen = 'playing';
}

export function startGame(state) {
  state.score = 0;
  state.total = 0;
  startLevel(state, 0);
}

// Map a canvas point to { panel: 'A' | 'B', x, y } in panel-local
// coordinates, or null when it falls outside both pictures.
export function pointToPanel(px, py) {
  if (py < PANEL.y || py > PANEL.y + PANEL.h) return null;
  if (px >= PANEL.ax && px <= PANEL.ax + PANEL.w) {
    return { panel: 'A', x: px - PANEL.ax, y: py - PANEL.y };
  }
  if (px >= PANEL.bx && px <= PANEL.bx + PANEL.w) {
    return { panel: 'B', x: px - PANEL.bx, y: py - PANEL.y };
  }
  return null;
}

export function unfound(state) {
  return currentLevel(state).differences.filter((d) => !state.found.has(d.id));
}

function showToast(state, text, now) {
  state.toast = text;
  state.toastUntil = now + 1600;
}

// A click while playing. Returns 'found' | 'wrong' | 'ignored'.
export function clickAt(state, px, py, now) {
  if (state.screen !== 'playing') return 'ignored';
  const hit = pointToPanel(px, py);
  if (!hit) return 'ignored';
  for (const d of unfound(state)) {
    const dx = hit.x - d.x;
    const dy = hit.y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      state.found.add(d.id);
      state.levelScore += POINTS_FOUND;
      state.score += POINTS_FOUND;
      showToast(state, `Found: ${d.label}! +${POINTS_FOUND}`, now);
      if (state.found.size === currentLevel(state).differences.length) {
        finishLevel(state);
      }
      return 'found';
    }
  }
  state.score = Math.max(0, state.score - POINTS_WRONG);
  state.levelScore = Math.max(0, state.levelScore - POINTS_WRONG);
  state.wrongFlash = { x: px, y: py, until: now + 450 };
  showToast(state, `Not a difference. -${POINTS_WRONG}`, now);
  return 'wrong';
}

export function finishLevel(state) {
  state.timeBonus = Math.round(state.timeLeft) * 10;
  state.levelScore += state.timeBonus;
  state.score += state.timeBonus;
  state.total = state.score;
  state.screen = 'leveldone';
}

export function useHint(state, now) {
  if (state.screen !== 'playing') return 'ignored';
  const rest = unfound(state);
  if (rest.length === 0 || state.hintsLeft <= 0) return 'ignored';
  const d = rest[0];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - POINTS_HINT);
  state.levelScore = Math.max(0, state.levelScore - POINTS_HINT);
  state.hintRing = { x: d.x, y: d.y, r: d.r, until: now + 2000 };
  showToast(state, `Hint: look near the ${d.label}. -${POINTS_HINT}`, now);
  return 'hint';
}

export function nextLevel(state) {
  if (state.screen !== 'leveldone') return;
  if (state.levelIndex + 1 >= LEVELS.length) {
    state.screen = 'alldone';
    state.best = Math.max(state.best, state.total);
    return;
  }
  startLevel(state, state.levelIndex + 1);
}

export function tick(state, dtSeconds, now) {
  if (state.screen !== 'playing') return;
  state.timeLeft -= dtSeconds;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.total = state.score;
    state.screen = 'timeout';
  }
  if (state.wrongFlash && now > state.wrongFlash.until) state.wrongFlash = null;
  if (state.hintRing && now > state.hintRing.until) state.hintRing = null;
}

export function loadBest() {
  try {
    return Number(localStorage.getItem('twin-worlds-best') || 0) || 0;
  } catch (e) {
    return 0;
  }
}

export function saveBest(state) {
  try {
    localStorage.setItem('twin-worlds-best', String(Math.max(state.best, state.total)));
  } catch (e) {
    /* storage unavailable: best score is session-only */
  }
}
