// Paints the whole game from the world's state. Every frame is drawn from scratch,
// so a screenshot is always a faithful picture of the current state.
import { FIELD, PANEL, PALETTE, FONT, LEVEL_SECONDS } from './config.js';
import { drawScene } from './scenes.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 400} ${size}px ${FONT}`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function panelOrigin(side) {
  return { x: side === 'left' ? PANEL.leftX : PANEL.rightX, y: PANEL.y };
}

function drawMarker(ctx, x, y, r, pulse) {
  const pr = r + 5 + Math.sin(pulse) * 3;
  ctx.strokeStyle = PALETTE.found;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, pr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = PALETTE.foundSoft;
  ctx.beginPath();
  ctx.arc(x, y, pr, 0, Math.PI * 2);
  ctx.fill();
  // A small check in the middle of the ring.
  ctx.strokeStyle = PALETTE.found;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 7, y);
  ctx.lineTo(x - 2, y + 6);
  ctx.lineTo(x + 8, y - 6);
  ctx.stroke();
}

function drawButton(ctx, b, label) {
  ctx.fillStyle = PALETTE.button;
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.strokeStyle = PALETTE.accent;
  ctx.lineWidth = 2;
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.stroke();
  text(ctx, label, b.x + b.w / 2, b.y + b.h / 2 + 1, 24, PALETTE.text, 700, 'center');
}

function drawOverlay(ctx, title, lines, buttons, buttonLabels) {
  ctx.fillStyle = 'rgba(10, 14, 24, 0.78)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  text(ctx, title, FIELD.width / 2, 210, 52, PALETTE.text, 800, 'center');
  lines.forEach((line, i) => {
    text(ctx, line, FIELD.width / 2, 290 + i * 44, 24, PALETTE.muted, 400, 'center');
  });
  buttons.forEach((b, i) => drawButton(ctx, b, buttonLabels[i]));
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function render(ctx, world) {
  const w = world;
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = PALETTE.backdrop;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);

  // --- HUD -----------------------------------------------------------------
  // Row 1: title, level name, score. Row 2: found counter, timer, hints.
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, FIELD.width, 100);
  text(ctx, 'TWIN WORLDS', 32, 34, 30, PALETTE.text, 800);
  text(ctx, 'Spot the Difference', 282, 36, 16, PALETTE.muted, 400);
  text(ctx, `Level ${w.levelIndex + 1} · ${w.level.name}`, FIELD.width / 2, 34, 22, PALETTE.accent, 700, 'center');
  text(ctx, `Score ${w.score}`, FIELD.width - 32, 34, 22, PALETTE.text, 700, 'right');

  // Found counter: "Found 3 / 7" plus one dot per difference, green once found.
  const counter = `Found ${w.foundCount} / ${w.found.length}`;
  text(ctx, counter, 32, 70, 20, PALETTE.text, 700);
  const dotsX = 32 + ctx.measureText(counter).width + 22;
  w.found.forEach((f, i) => {
    ctx.fillStyle = f ? PALETTE.found : '#3a4763';
    ctx.beginPath();
    ctx.arc(dotsX + i * 26, 70, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  text(ctx, `${w.remainingCount} left`, dotsX + w.found.length * 26 + 12, 70, 18, PALETTE.muted, 400);

  // Timer bar and readout, centred.
  const barX = 560;
  const barW = 320;
  const frac = Math.max(0, w.timeLeft / LEVEL_SECONDS);
  ctx.fillStyle = '#2a3550';
  roundRect(ctx, barX, 60, barW, 20, 10);
  ctx.fill();
  ctx.fillStyle = frac < 0.2 ? PALETTE.timerLow : PALETTE.timer;
  if (frac > 0) {
    roundRect(ctx, barX, 60, barW * frac, 20, 10);
    ctx.fill();
  }
  text(ctx, formatTime(w.timeLeft), barX + barW + 14, 70, 22, frac < 0.2 ? PALETTE.timerLow : PALETTE.text, 700);
  text(ctx, `Hints ${w.hintsLeft} (H)  ·  Total ${w.totalScore}`, FIELD.width - 32, 70, 16, PALETTE.muted, 400, 'right');

  // --- The two pictures ------------------------------------------------------
  for (const side of ['left', 'right']) {
    const origin = panelOrigin(side);
    ctx.save();
    ctx.beginPath();
    ctx.rect(origin.x, origin.y, PANEL.width, PANEL.height);
    ctx.clip();
    ctx.translate(origin.x, origin.y);
    drawScene(ctx, w.levelIndex, side === 'right');
    ctx.restore();
    ctx.strokeStyle = PALETTE.panelBorder;
    ctx.lineWidth = 3;
    ctx.strokeRect(origin.x, origin.y, PANEL.width, PANEL.height);
    // A / B badge.
    ctx.fillStyle = PALETTE.hud;
    roundRect(ctx, origin.x + 10, origin.y + 10, 36, 36, 8);
    ctx.fill();
    text(ctx, side === 'left' ? 'A' : 'B', origin.x + 28, origin.y + 29, 22, PALETTE.accent, 800, 'center');
  }

  // --- Markers on both pictures ---------------------------------------------
  const pulse = w.time * 3;
  w.found.forEach((f, i) => {
    if (!f) return;
    const d = w.level.differences[i];
    for (const side of ['left', 'right']) {
      const o = panelOrigin(side);
      drawMarker(ctx, o.x + d.x, o.y + d.y, d.r, pulse);
    }
  });
  if (w.hintPulse) {
    const d = w.level.differences[w.hintPulse.index];
    const pr = d.r + 8 + Math.sin(pulse * 2) * 5;
    for (const side of ['left', 'right']) {
      const o = panelOrigin(side);
      ctx.strokeStyle = PALETTE.hint;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(o.x + d.x, o.y + d.y, pr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  for (const miss of w.misses) {
    const o = panelOrigin(miss.side);
    const alpha = Math.max(0, miss.t / 0.9);
    ctx.strokeStyle = `rgba(239, 71, 111, ${alpha})`;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const x = o.x + miss.x;
    const y = o.y + miss.y;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x + 10, y + 10);
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
  }

  // "Found: Butterfly! — 4 left" toast.
  if (w.lastFound) {
    const alpha = Math.min(1, w.lastFound.t);
    ctx.fillStyle = `rgba(20, 26, 38, ${alpha * 0.9})`;
    roundRect(ctx, FIELD.width / 2 - 220, 118, 440, 44, 10);
    ctx.fill();
    text(ctx, `Found: ${w.lastFound.label}!  ${w.remainingCount} left`, FIELD.width / 2, 141, 20, `rgba(61, 220, 132, ${alpha})`, 700, 'center');
  }

  // Keyboard cursor, only while playing.
  if (w.screen === 'play' && w.cursorVisible) {
    const c = w.cursor;
    ctx.strokeStyle = PALETTE.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(c.x - 20, c.y);
    ctx.lineTo(c.x - 8, c.y);
    ctx.moveTo(c.x + 8, c.y);
    ctx.lineTo(c.x + 20, c.y);
    ctx.moveTo(c.x, c.y - 20);
    ctx.lineTo(c.x, c.y - 8);
    ctx.moveTo(c.x, c.y + 8);
    ctx.lineTo(c.x, c.y + 20);
    ctx.stroke();
  }

  // --- Footer ----------------------------------------------------------------
  text(ctx, 'Click a difference on either picture  ·  Arrow keys move the cursor, Enter selects  ·  H hint (−15)  ·  P pause  ·  R restart level  ·  M mute', FIELD.width / 2, 668, 16, PALETTE.muted, 400, 'center');
  text(ctx, 'Best score: ' + w.best, FIELD.width / 2, 696, 14, PALETTE.muted, 400, 'center');

  // --- Screens ---------------------------------------------------------------
  if (w.screen === 'title') {
    drawOverlay(ctx, 'TWIN WORLDS', [
      'Two pictures, side by side. Seven differences hiding in each pair.',
      'Click a difference on either picture — the same spot counts on both.',
      'Three levels · 90 seconds each · Hints cost 15 points, wrong clicks cost 5.',
    ], w.buttons(), ['▶  Start']);
  } else if (w.screen === 'paused') {
    drawOverlay(ctx, 'Paused', [
      'Take a breath. The timer is stopped.',
    ], w.buttons(), ['Resume', 'Restart level']);
  } else if (w.screen === 'leveldone') {
    const next = w.levelIndex + 1 < 3 ? `Level ${w.levelIndex + 2} awaits.` : 'That was the last level!';
    drawOverlay(ctx, 'Level complete!', [
      `All 7 differences found in ${w.level.name}.`,
      `Level score ${w.score}  +  time bonus ${w.levelBonus}  =  ${w.score + w.levelBonus}`,
      `Total score ${w.totalScore}`,
      next,
    ], w.buttons(), [w.levelIndex + 1 < 3 ? 'Next level  ▶' : 'See results  ▶']);
  } else if (w.screen === 'gameover') {
    drawOverlay(ctx, 'You found them all!', [
      `Final score ${w.totalScore}   ·   Best ${w.best}`,
      'Three worlds, twenty-one differences, none left hiding.',
    ], w.buttons(), ['Play again']);
  } else if (w.screen === 'failed') {
    drawOverlay(ctx, "Time's up!", [
      `You found ${w.foundCount} of 7 differences in ${w.level.name}.`,
      'Try the level again — the pictures stay the same.',
    ], w.buttons(), ['Try again']);
  }
}
