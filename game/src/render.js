// Rendering for Twin Worlds: one draw per animation frame.
// The frame is 1280 x 720: a top HUD, the two pictures side by side,
// a bottom strip of instructions. Found differences get a green ring and
// a check on both pictures at once; the timer bar turns red under 15 s.

import { LEVELS, PANEL } from './levels.js';
import { PAINTERS } from './paint.js';
import { currentLevel } from './engine.js';

const W = 1280;
const H = 720;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPanelFrame(ctx, x) {
  ctx.fillStyle = '#0f172a';
  roundRect(ctx, x - 6, PANEL.y - 6, PANEL.w + 12, PANEL.h + 12, 10);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(x === PANEL.ax ? 'A' : 'B', x + 2, PANEL.y - 12);
}

function drawFoundMarks(ctx, state) {
  const level = currentLevel(state);
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 5;
  ctx.fillStyle = '#22c55e';
  for (const d of level.differences) {
    if (!state.found.has(d.id)) continue;
    for (const ox of [PANEL.ax, PANEL.bx]) {
      ctx.beginPath();
      ctx.arc(ox + d.x, PANEL.y + d.y, d.r + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓', ox + d.x, PANEL.y + d.y + 7);
    }
  }
}

function drawHud(ctx, state) {
  const level = currentLevel(state);
  ctx.fillStyle = '#16233d';
  ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TWIN WORLDS', 24, 42);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(`Level ${state.levelIndex + 1}/3 · ${level.name}`, 260, 40);

  const found = state.found.size;
  const total = level.differences.length;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Found ${found}/${total} · ${total - found} left`, 880, 30);
  ctx.fillText(`Score ${state.score}`, 880, 54);
  for (let i = 0; i < total; i++) {
    ctx.fillStyle = i < found ? '#22c55e' : '#334155';
    ctx.beginPath();
    ctx.arc(908 + i * 22, 24, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Timer bar with seconds.
  const tw = 150;
  const tx = 1100;
  const frac = Math.max(0, state.timeLeft / 90);
  ctx.fillStyle = '#334155';
  roundRect(ctx, tx, 18, tw, 16, 8);
  ctx.fill();
  ctx.fillStyle = frac < 0.17 ? '#ef4444' : '#38bdf8';
  if (frac > 0) {
    roundRect(ctx, tx, 18, tw * frac, 16, 8);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'left';
  const secs = Math.ceil(state.timeLeft);
  ctx.fillText(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, tx + 6, 52);
  ctx.textAlign = 'right';
  ctx.fillText(`Hints ${state.hintsLeft}`, 1250, 52);
  ctx.textAlign = 'left';
}

function drawFooter(ctx, state) {
  ctx.fillStyle = '#16233d';
  ctx.fillRect(0, 606, W, 114);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Click a difference · H hint (−15) · P pause · R restart level · N next level · M mute · Arrow keys + Enter work too',
    W / 2,
    636,
  );
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '15px system-ui, sans-serif';
  if (state.toast && performance.now() < state.toastUntil) {
    ctx.fillText(state.toast, W / 2, 668);
  } else if (state.best > 0) {
    ctx.fillText(`Best score: ${state.best}`, W / 2, 668);
  }
}

function drawCursor(ctx, state) {
  const p = state.mouse.inside ? state.mouse : state.cursor;
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p.x - 18, p.y);
  ctx.lineTo(p.x + 18, p.y);
  ctx.moveTo(p.x, p.y - 18);
  ctx.lineTo(p.x, p.y + 18);
  ctx.stroke();
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(10, 15, 30, 0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, W / 2, 300);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '20px system-ui, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, W / 2, 350 + i * 34));
  ctx.textAlign = 'left';
}

export function draw(ctx, state, now) {
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, W, H);
  const level = currentLevel(state);
  const paint = PAINTERS[level.id];

  drawHud(ctx, state);
  drawPanelFrame(ctx, PANEL.ax);
  drawPanelFrame(ctx, PANEL.bx);
  paint(ctx, PANEL.ax, PANEL.y, false);
  paint(ctx, PANEL.bx, PANEL.y, true);
  drawFoundMarks(ctx, state);

  if (state.hintRing && now < state.hintRing.until) {
    const pulse = 1 + 0.12 * Math.sin(now / 130);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 5;
    for (const ox of [PANEL.ax, PANEL.bx]) {
      ctx.beginPath();
      ctx.arc(ox + state.hintRing.x, PANEL.y + state.hintRing.y, (state.hintRing.r + 6) * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (state.wrongFlash && now < state.wrongFlash.until) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 5;
    const s = 12;
    ctx.beginPath();
    ctx.moveTo(state.wrongFlash.x - s, state.wrongFlash.y - s);
    ctx.lineTo(state.wrongFlash.x + s, state.wrongFlash.y + s);
    ctx.moveTo(state.wrongFlash.x + s, state.wrongFlash.y - s);
    ctx.lineTo(state.wrongFlash.x - s, state.wrongFlash.y + s);
    ctx.stroke();
  }

  drawFooter(ctx, state);
  if (state.screen === 'playing' || state.screen === 'paused') drawCursor(ctx, state);

  if (state.screen === 'title') {
    overlay(ctx, 'TWIN WORLDS', [
      'Spot the difference — two pictures, seven changes.',
      'Three worlds: Sunny Garden, Cozy Kitchen, Starry Space.',
      'Click a difference, or move with the arrow keys and press Enter.',
      '',
      'Press Enter or click Start to play',
    ], '#fbbf24');
    ctx.fillStyle = '#22c55e';
    roundRect(ctx, W / 2 - 90, 500, 180, 52, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▶  Start', W / 2, 535);
    ctx.textAlign = 'left';
  } else if (state.screen === 'paused') {
    overlay(ctx, 'Paused', ['Press P to keep playing.', 'R restarts this level.'], '#38bdf8');
  } else if (state.screen === 'leveldone') {
    overlay(ctx, 'Level Complete!', [
      `You found all ${level.differences.length} differences.`,
      `Finds ${state.levelScore - state.timeBonus}  +  time bonus ${state.timeBonus}  =  ${state.levelScore}`,
      `Total score ${state.score}`,
      '',
      state.levelIndex + 1 >= LEVELS.length
        ? 'Press N to see your final score'
        : 'Press N for the next level',
    ], '#22c55e');
  } else if (state.screen === 'alldone') {
    overlay(ctx, 'You found them all!', [
      `Final score ${state.total}  ·  Best ${Math.max(state.best, state.total)}`,
      'Three worlds, twenty-one differences, all found.',
      '',
      'Press Enter to play again',
    ], '#fbbf24');
  } else if (state.screen === 'timeout') {
    overlay(ctx, "Time's up!", [
      `You found ${state.found.size} of ${level.differences.length} differences.`,
      `Score ${state.score}`,
      '',
      'Press R to retry this level',
    ], '#ef4444');
  }
}
