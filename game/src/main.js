// Boot and main loop for Twin Worlds.
// The canvas is a fixed 1280 x 720 logical frame; CSS scales it to the
// window. Input is mouse plus keyboard: arrows move the crosshair,
// Enter or Space clicks where it stands. The timer runs on a fixed
// step; staged screenshots (?shot=) freeze it.

import { newGame, startGame, startLevel, clickAt, useHint, nextLevel, tick, loadBest, saveBest } from './engine.js';
import { draw } from './render.js';
import { sfxFound, sfxWrong, sfxHint, sfxWin, sfxClick } from './audio.js';
import { applyShot, isStaged } from './shots.js';
import { PANEL } from './levels.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = newGame();
state.best = loadBest();
const staged = applyShot(state);

window.__debug = {
  state,
  version: 'twin-worlds-rebuild-1',
};

function toCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * 1280,
    y: ((e.clientY - rect.top) / rect.height) * 720,
  };
}

canvas.addEventListener('mousemove', (e) => {
  const p = toCanvas(e);
  state.mouse = { x: p.x, y: p.y, inside: true };
  state.cursor = { x: p.x, y: p.y };
});

canvas.addEventListener('mouseleave', () => {
  state.mouse.inside = false;
});

canvas.addEventListener('click', (e) => {
  const p = toCanvas(e);
  const now = performance.now();
  if (state.screen === 'title') {
    if (p.x >= 550 && p.x <= 730 && p.y >= 500 && p.y <= 552) {
      sfxClick(state.muted);
      startGame(state);
    }
    return;
  }
  const result = clickAt(state, p.x, p.y, now);
  if (result === 'found') {
    sfxFound(state.muted);
    if (state.screen === 'leveldone') sfxWin(state.muted);
  } else if (result === 'wrong') {
    sfxWrong(state.muted);
  }
});

window.addEventListener('keydown', (e) => {
  const now = performance.now();
  const step = e.shiftKey ? 4 : 14;
  if (e.key === 'ArrowLeft') {
    state.cursor.x = Math.max(0, state.cursor.x - step);
    state.mouse.inside = false;
    e.preventDefault();
  } else if (e.key === 'ArrowRight') {
    state.cursor.x = Math.min(1280, state.cursor.x + step);
    state.mouse.inside = false;
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    state.cursor.y = Math.max(0, state.cursor.y - step);
    state.mouse.inside = false;
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    state.cursor.y = Math.min(720, state.cursor.y + step);
    state.mouse.inside = false;
    e.preventDefault();
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (state.screen === 'title') {
      sfxClick(state.muted);
      startGame(state);
    } else if (state.screen === 'leveldone') {
      nextLevel(state);
    } else if (state.screen === 'alldone') {
      saveBest(state);
      startGame(state);
    } else if (state.screen === 'playing') {
      const result = clickAt(state, state.cursor.x, state.cursor.y, now);
      if (result === 'found') sfxFound(state.muted);
      else if (result === 'wrong') sfxWrong(state.muted);
    }
  } else if (e.key === 'h' || e.key === 'H') {
    if (useHint(state, now) === 'hint') sfxHint(state.muted);
  } else if (e.key === 'p' || e.key === 'P') {
    if (state.screen === 'playing') state.screen = 'paused';
    else if (state.screen === 'paused') state.screen = 'playing';
  } else if (e.key === 'r' || e.key === 'R') {
    if (state.screen === 'playing' || state.screen === 'paused' || state.screen === 'timeout') {
      startLevel(state, state.levelIndex);
    }
  } else if (e.key === 'n' || e.key === 'N') {
    nextLevel(state);
  } else if (e.key === 'm' || e.key === 'M') {
    state.muted = !state.muted;
  }
});

let last = performance.now();
let shotReady = false;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!staged) tick(state, dt, now);
  if (state.screen === 'alldone') saveBest(state);
  draw(ctx, state, now);
  if (!shotReady) {
    shotReady = true;
    window.__shotReady = true;
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
