// Boot: size the canvas, run the fixed-step loop, wire input, stage ?shot= states.
import { FIELD, STEP } from './config.js';
import { createWorld } from './world.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const world = createWorld();
attachInput(canvas, world);

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(FIELD.width * dpr);
  canvas.height = Math.round(FIELD.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// Keep the live status line in step with the counter, for screen readers.
let lastStatus = '';
function announce() {
  if (world.screen !== 'play') return;
  const s = `Found ${world.foundCount} of ${world.found.length}. ${world.remainingCount} left. ${Math.ceil(world.timeLeft)} seconds.`;
  if (s !== lastStatus) {
    lastStatus = s;
    statusEl.textContent = s;
  }
}

let acc = 0;
let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  acc += dt;
  while (acc >= STEP) {
    world.update(STEP);
    acc -= STEP;
  }
  render(ctx, world);
  announce();
  requestAnimationFrame(frame);
}

// A screenshot state from the URL, e.g. ?shot=cover&seed=1. Staged through the
// game's own click handler, then flagged ready once painted.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  stageShot(world, shot);
  render(ctx, world);
  requestAnimationFrame(() => {
    render(ctx, world);
    window.__shotReady = true;
  });
} else {
  window.__shotReady = true;
}

// Debug handle: verification scripts drive the real game through this.
window.__debug = {
  world,
  state: () => ({
    screen: world.screen,
    level: world.levelIndex,
    found: world.foundCount,
    remaining: world.remainingCount,
    score: world.score,
    totalScore: world.totalScore,
    timeLeft: world.timeLeft,
    hintsLeft: world.hintsLeft,
  }),
  click: (x, y) => world.clickAt(x, y),
  hint: () => world.hint(),
};

requestAnimationFrame(frame);
