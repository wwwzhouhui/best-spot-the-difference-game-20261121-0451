// Mouse and keyboard input. Converts browser coordinates into the game's fixed
// 1280x720 field, then hands clicks to the world.
import { FIELD, PANEL, CURSOR } from './config.js';

function toField(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * FIELD.width,
    y: ((clientY - rect.top) / rect.height) * FIELD.height,
  };
}

function hitButton(world, x, y) {
  for (const b of world.buttons()) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
  }
  return null;
}

export function attachInput(canvas, world) {
  canvas.addEventListener('pointerdown', (event) => {
    const p = toField(canvas, event.clientX, event.clientY);
    const button = hitButton(world, p.x, p.y);
    if (button) {
      world.pressButton(button);
      return;
    }
    world.cursor = { x: p.x, y: p.y };
    world.cursorVisible = true;
    world.clickAt(p.x, p.y);
  });

  canvas.addEventListener('pointermove', (event) => {
    const p = toField(canvas, event.clientX, event.clientY);
    world.cursor = { x: p.x, y: p.y };
    world.cursorVisible = true;
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      event.preventDefault();
      const step = event.shiftKey ? CURSOR.fastStep : CURSOR.step;
      const c = world.cursor;
      if (key === 'ArrowUp') c.y = Math.max(PANEL.y, c.y - step);
      if (key === 'ArrowDown') c.y = Math.min(PANEL.y + PANEL.height, c.y + step);
      if (key === 'ArrowLeft') c.x = Math.max(PANEL.leftX, c.x - step);
      if (key === 'ArrowRight') c.x = Math.min(PANEL.rightX + PANEL.width, c.x + step);
      world.cursorVisible = true;
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      const button = hitButton(world, world.cursor.x, world.cursor.y);
      if (button) world.pressButton(button);
      else if (world.screen === 'play') world.clickAt(world.cursor.x, world.cursor.y);
      return;
    }
    if (key === 'h' || key === 'H') world.hint();
    if (key === 'p' || key === 'P' || key === 'Escape') {
      if (world.screen === 'play') world.pause();
      else if (world.screen === 'paused') world.resume();
    }
    if (key === 'r' || key === 'R') {
      if (world.screen === 'play' || world.screen === 'paused') world.restartLevel();
    }
    if (key === 'n' || key === 'N') {
      if (world.screen === 'leveldone') world.nextLevel();
    }
    if (key === 'm' || key === 'M') world.toggleMute();
  });
}
