// Deterministic screenshot states, driven through the game's own click handler so
// every marker on screen is a real play state, not a painted overlay.
//   ?shot=cover   Level 1, three differences found, four still hiding.
//   ?shot=kitchen Level 2, one difference found.
//   ?shot=win     Level 1, all seven found: the level-complete screen.
//   ?shot=title   The title screen.
// The timer is frozen for every shot so the frame is repeatable.
import { PANEL } from './config.js';

function clickDiff(world, index) {
  const d = world.level.differences[index];
  world.clickAt(PANEL.leftX + d.x, PANEL.y + d.y);
}

export function stageShot(world, name) {
  world.frozen = true;
  if (name === 'cover') {
    world.startLevel(0);
    clickDiff(world, 0); // Butterfly.
    clickDiff(world, 2); // Red flower.
    clickDiff(world, 5); // Apple.
    world.timeLeft = 47.3;
    world.cursor = { x: 900, y: 420 };
    world.cursorVisible = true;
  } else if (name === 'kitchen') {
    world.startLevel(1);
    clickDiff(world, 1); // Clock hands.
    world.timeLeft = 61.8;
    world.cursor = { x: 300, y: 400 };
    world.cursorVisible = true;
  } else if (name === 'win') {
    world.startLevel(0);
    for (let i = 0; i < world.level.differences.length; i += 1) clickDiff(world, i);
    world.cursorVisible = false;
  } else {
    // title: the fresh world already shows it.
    world.cursorVisible = false;
  }
  world.lastFound = null;
}
