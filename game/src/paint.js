// Scene painters for Twin Worlds.
// Every scene is drawn twice, once per panel, from the same code: panel A
// is the original, panel B is the same picture with the level's seven
// differences applied. `isB` flips each difference at its own spot, so the
// two pictures agree everywhere else, pixel for pixel. All coordinates
// are panel-local (600 x 520); (ox, oy) is the panel's top-left corner.

import { mulberry32 } from './rng.js';

function clipPanel(ctx, ox, oy) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(ox, oy, 600, 520);
  ctx.clip();
}

function cloud(ctx, x, y, s) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, 22 * s, 0, Math.PI * 2);
  ctx.arc(x + 24 * s, y - 8 * s, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 48 * s, y, 20 * s, 0, Math.PI * 2);
  ctx.arc(x + 24 * s, y + 8 * s, 18 * s, 0, Math.PI * 2);
  ctx.fill();
}

function flower(ctx, x, y, petal) {
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffcf3f';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2f7d32';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x, y + 26);
  ctx.stroke();
}

export function paintGarden(ctx, ox, oy, isB) {
  clipPanel(ctx, ox, oy);
  const g = ctx.createLinearGradient(0, oy, 0, oy + 520);
  g.addColorStop(0, '#bfe6ff');
  g.addColorStop(1, '#eaf7ff');
  ctx.fillStyle = g;
  ctx.fillRect(ox, oy, 600, 520);

  // Sun with rays, top left.
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.arc(ox + 90, oy + 80, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 5;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(ox + 90 + Math.cos(a) * 44, oy + 80 + Math.sin(a) * 44);
    ctx.lineTo(ox + 90 + Math.cos(a) * 56, oy + 80 + Math.sin(a) * 56);
    ctx.stroke();
  }

  // Clouds: the second one is gone in panel B.
  cloud(ctx, ox + 280, oy + 60, 1);
  if (!isB) cloud(ctx, ox + 470, oy + 100, 0.9);
  cloud(ctx, ox + 150, oy + 140, 0.8);

  // Bird: a small "w" in the sky, gone in panel B.
  if (!isB) {
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox + 186, oy + 55);
    ctx.quadraticCurveTo(ox + 193, oy + 47, ox + 200, oy + 55);
    ctx.quadraticCurveTo(ox + 207, oy + 47, ox + 214, oy + 55);
    ctx.stroke();
  }

  // Hills.
  ctx.fillStyle = '#7ec850';
  ctx.beginPath();
  ctx.ellipse(ox + 150, oy + 560, 320, 120, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#68b545';
  ctx.beginPath();
  ctx.ellipse(ox + 470, oy + 570, 300, 110, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // House: cream walls, red roof, brown door, two windows.
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(ox + 90, oy + 210, 240, 210);
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath();
  ctx.moveTo(ox + 70, oy + 212);
  ctx.lineTo(ox + 210, oy + 130);
  ctx.lineTo(ox + 350, oy + 212);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(ox + 195, oy + 340, 40, 80);
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.arc(ox + 232, oy + 382, 4, 0, Math.PI * 2);
  ctx.fill();
  // Windows with frames; the left one has a curtain.
  for (const wx of [120, 250]) {
    ctx.fillStyle = '#9fd8ff';
    ctx.fillRect(ox + wx, oy + 260, 40, 40);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 4;
    ctx.strokeRect(ox + wx, oy + 260, 40, 40);
    ctx.beginPath();
    ctx.moveTo(ox + wx + 20, oy + 260);
    ctx.lineTo(ox + wx + 20, oy + 300);
    ctx.moveTo(ox + wx, oy + 280);
    ctx.lineTo(ox + wx + 40, oy + 280);
    ctx.stroke();
  }
  if (isB) {
    // Curtain drawn in panel B: a red drape over the left window.
    ctx.fillStyle = '#d94f3d';
    ctx.fillRect(ox + 120, oy + 260, 40, 40);
    ctx.strokeStyle = '#a83a2c';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(ox + 128 + i * 9, oy + 260);
      ctx.lineTo(ox + 128 + i * 9, oy + 300);
      ctx.stroke();
    }
  } else {
    // Curtain open in panel A: two small red swags at the top corners.
    ctx.fillStyle = '#d94f3d';
    ctx.beginPath();
    ctx.arc(ox + 126, oy + 266, 8, 0, Math.PI * 2);
    ctx.arc(ox + 154, oy + 266, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Path from the door.
  ctx.fillStyle = '#e8d5a8';
  ctx.beginPath();
  ctx.moveTo(ox + 195, oy + 420);
  ctx.lineTo(ox + 235, oy + 420);
  ctx.lineTo(ox + 255, oy + 520);
  ctx.lineTo(ox + 175, oy + 520);
  ctx.closePath();
  ctx.fill();

  // Tree with apples: one apple is gone in panel B.
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(ox + 478, oy + 280, 16, 140);
  ctx.fillStyle = '#3f9e4d';
  ctx.beginPath();
  ctx.arc(ox + 486, oy + 230, 62, 0, Math.PI * 2);
  ctx.arc(ox + 440, oy + 260, 44, 0, Math.PI * 2);
  ctx.arc(ox + 530, oy + 260, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e23b2e';
  for (const [ax, ay] of [[450, 210], [486, 182]]) {
    ctx.beginPath();
    ctx.arc(ox + ax, oy + ay, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!isB) {
    ctx.beginPath();
    ctx.arc(ox + 520, oy + 240, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cat sitting on the path, tail curled in A and straight in B.
  ctx.fillStyle = '#f59e42';
  ctx.beginPath();
  ctx.ellipse(ox + 400, oy + 440, 34, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ox + 400, oy + 402, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ox + 386, oy + 388);
  ctx.lineTo(ox + 392, oy + 368);
  ctx.lineTo(ox + 400, oy + 386);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ox + 414, oy + 388);
  ctx.lineTo(ox + 408, oy + 368);
  ctx.lineTo(ox + 400, oy + 386);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f59e42';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (isB) {
    ctx.moveTo(ox + 428, oy + 448);
    ctx.lineTo(ox + 452, oy + 470);
  } else {
    ctx.moveTo(ox + 428, oy + 448);
    ctx.quadraticCurveTo(ox + 458, oy + 452, ox + 448, oy + 424);
  }
  ctx.stroke();

  // Flower row: the one at x=300 is red in A, yellow in B.
  const spots = [60, 120, 180, 240, 300, 360, 420, 480, 540];
  for (const fx of spots) {
    let petal = '#e2547a';
    if (fx === 300) petal = isB ? '#ffd94d' : '#e23b2e';
    else if (fx % 120 === 0) petal = '#7a6ff0';
    flower(ctx, ox + fx, oy + 486, petal);
  }

  // White picket fence along the hill.
  ctx.fillStyle = '#ffffff';
  for (let fx = 40; fx <= 560; fx += 28) {
    ctx.fillRect(ox + fx, oy + 396, 12, 30);
    ctx.beginPath();
    ctx.moveTo(ox + fx, oy + 396);
    ctx.lineTo(ox + fx + 6, oy + 386);
    ctx.lineTo(ox + fx + 12, oy + 396);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillRect(ox + 30, oy + 406, 540, 6);
  ctx.restore();
}

export function paintKitchen(ctx, ox, oy, isB) {
  clipPanel(ctx, ox, oy);
  // Wall and wooden floor.
  ctx.fillStyle = '#f7e8c8';
  ctx.fillRect(ox, oy, 600, 360);
  ctx.fillStyle = '#c89b6a';
  ctx.fillRect(ox, oy + 360, 600, 160);
  ctx.strokeStyle = '#a87c4f';
  ctx.lineWidth = 2;
  for (let fy = 390; fy < 520; fy += 32) {
    ctx.beginPath();
    ctx.moveTo(ox, oy + fy);
    ctx.lineTo(ox + 600, oy + fy);
    ctx.stroke();
  }

  // Window with the night sky: moon in A, a star in B.
  ctx.fillStyle = '#20305e';
  ctx.fillRect(ox + 430, oy + 60, 130, 140);
  ctx.strokeStyle = '#8b5a2b';
  ctx.lineWidth = 6;
  ctx.strokeRect(ox + 430, oy + 60, 130, 140);
  ctx.beginPath();
  ctx.moveTo(ox + 495, oy + 60);
  ctx.lineTo(ox + 495, oy + 200);
  ctx.moveTo(ox + 430, oy + 130);
  ctx.lineTo(ox + 560, oy + 130);
  ctx.stroke();
  if (isB) {
    ctx.fillStyle = '#ffe27a';
    ctx.beginPath();
    ctx.arc(ox + 510, oy + 110, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffe27a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(ox + 510 + Math.cos(a) * 14, oy + 110 + Math.sin(a) * 14);
      ctx.lineTo(ox + 510 + Math.cos(a) * 20, oy + 110 + Math.sin(a) * 20);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#fdf6d8';
    ctx.beginPath();
    ctx.arc(ox + 510, oy + 110, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#20305e';
    ctx.beginPath();
    ctx.arc(ox + 500, oy + 104, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wall clock: 3:00 in A, 4:30 in B.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ox + 140, oy + 110, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ox + 140, oy + 110);
  ctx.lineTo(ox + 140, oy + 78);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ox + 140, oy + 110);
  if (isB) ctx.lineTo(ox + 140, oy + 138);
  else ctx.lineTo(ox + 168, oy + 110);
  ctx.stroke();

  // Shelf with three jars: the middle one is gone in B.
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(ox + 60, oy + 196, 240, 10);
  const jarColors = ['#7fb069', '#e07a5f', '#6d9dc5'];
  for (let i = 0; i < 3; i++) {
    if (isB && i === 1) continue;
    ctx.fillStyle = jarColors[i];
    ctx.fillRect(ox + 82 + i * 62, oy + 150, 44, 46);
    ctx.fillStyle = '#5b3a1e';
    ctx.fillRect(ox + 88 + i * 62, oy + 142, 32, 10);
  }

  // Hanging lamp.
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ox + 330, oy);
  ctx.lineTo(ox + 330, oy + 56);
  ctx.stroke();
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.moveTo(ox + 300, oy + 88);
  ctx.lineTo(ox + 360, oy + 88);
  ctx.lineTo(ox + 344, oy + 56);
  ctx.lineTo(ox + 316, oy + 56);
  ctx.closePath();
  ctx.fill();

  // Table.
  ctx.fillStyle = '#a9713f';
  ctx.fillRect(ox + 80, oy + 330, 440, 18);
  ctx.fillRect(ox + 100, oy + 348, 16, 130);
  ctx.fillRect(ox + 484, oy + 348, 16, 130);

  // Teapot with steam: no steam in panel B.
  ctx.fillStyle = '#5b8dd9';
  ctx.beginPath();
  ctx.ellipse(ox + 200, oy + 300, 42, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ox + 200, oy + 272);
  ctx.lineTo(ox + 214, oy + 258);
  ctx.lineTo(ox + 228, oy + 272);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5b8dd9';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(ox + 238, oy + 296, 14, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  if (!isB) {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.9)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (const sx of [188, 204, 220]) {
      ctx.beginPath();
      ctx.moveTo(ox + sx, oy + 252);
      ctx.quadraticCurveTo(ox + sx - 8, oy + 238, ox + sx + 2, oy + 224);
      ctx.stroke();
    }
  }

  // Fruit bowl: three oranges in A, two in B.
  ctx.fillStyle = '#c65d3b';
  ctx.beginPath();
  ctx.ellipse(ox + 388, oy + 322, 52, 16, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#f59e42';
  for (const [ax, ay] of [[360, 302], [390, 294]]) {
    ctx.beginPath();
    ctx.arc(ox + ax, oy + ay, 15, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!isB) {
    ctx.beginPath();
    ctx.arc(ox + 415, oy + 305, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mug and plate on the table.
  ctx.fillStyle = '#e07a5f';
  ctx.fillRect(ox + 110, oy + 300, 30, 28);
  ctx.strokeStyle = '#e07a5f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(ox + 142, oy + 314, 9, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(ox + 470, oy + 326, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cat on the chair, bowtie red in A and blue in B.
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.ellipse(ox + 500, oy + 430, 36, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ox + 500, oy + 392, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ox + 486, oy + 378);
  ctx.lineTo(ox + 492, oy + 358);
  ctx.lineTo(ox + 500, oy + 376);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ox + 514, oy + 378);
  ctx.lineTo(ox + 508, oy + 358);
  ctx.lineTo(ox + 500, oy + 376);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = isB ? '#3b82f6' : '#e23b2e';
  ctx.beginPath();
  ctx.moveTo(ox + 500, oy + 408);
  ctx.lineTo(ox + 484, oy + 400);
  ctx.lineTo(ox + 484, oy + 416);
  ctx.closePath();
  ctx.moveTo(ox + 500, oy + 408);
  ctx.lineTo(ox + 516, oy + 400);
  ctx.lineTo(ox + 516, oy + 416);
  ctx.closePath();
  ctx.fill();

  // Rug with stripes: one green stripe is plain in B.
  ctx.fillStyle = '#b45309';
  ctx.fillRect(ox + 150, oy + 440, 300, 60);
  ctx.fillStyle = '#fde68a';
  for (let sx = 170; sx <= 430; sx += 40) {
    if (isB && sx === 290) continue;
    ctx.fillRect(ox + sx, oy + 440, 14, 60);
  }
  if (!isB) {
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(ox + 290, oy + 440, 14, 60);
  }
  ctx.restore();
}

export function paintSpace(ctx, ox, oy, isB) {
  clipPanel(ctx, ox, oy);
  const g = ctx.createLinearGradient(0, oy, 0, oy + 520);
  g.addColorStop(0, '#0b1030');
  g.addColorStop(1, '#1d2b5e');
  ctx.fillStyle = g;
  ctx.fillRect(ox, oy, 600, 520);

  // Fixed star field from a seeded stream.
  const rand = mulberry32(20261121);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 70; i++) {
    const sx = rand() * 600;
    const sy = rand() * 520;
    const r = 1 + rand() * 1.8;
    ctx.globalAlpha = 0.5 + rand() * 0.5;
    ctx.beginPath();
    ctx.arc(ox + sx, oy + sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // One bright lone star, gone in panel B.
  if (!isB) {
    ctx.fillStyle = '#ffe27a';
    ctx.beginPath();
    ctx.arc(ox + 520, oy + 80, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffe27a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(ox + 520 + Math.cos(a) * 11, oy + 80 + Math.sin(a) * 11);
      ctx.lineTo(ox + 520 + Math.cos(a) * 17, oy + 80 + Math.sin(a) * 17);
      ctx.stroke();
    }
  }

  // Ringed planet: the ring is gone in panel B.
  ctx.fillStyle = '#c2703d';
  ctx.beginPath();
  ctx.arc(ox + 140, oy + 140, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a85a2e';
  ctx.beginPath();
  ctx.arc(ox + 122, oy + 126, 12, 0, Math.PI * 2);
  ctx.arc(ox + 158, oy + 158, 9, 0, Math.PI * 2);
  ctx.fill();
  if (!isB) {
    ctx.strokeStyle = '#e8c07a';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(ox + 140, oy + 140, 84, 20, -0.35, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Satellite: body, panels, and an antenna that is gone in B.
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(ox + 104, oy + 366, 34, 26);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(ox + 66, oy + 372, 34, 14);
  ctx.fillRect(ox + 142, oy + 372, 34, 14);
  if (!isB) {
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox + 121, oy + 366);
    ctx.lineTo(ox + 140, oy + 344);
    ctx.stroke();
    ctx.fillStyle = '#f59e42';
    ctx.beginPath();
    ctx.arc(ox + 140, oy + 342, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rocket: round window in A, square in B; orange flame in A, blue in B.
  ctx.fillStyle = '#e8edf5';
  ctx.beginPath();
  ctx.moveTo(ox + 300, oy + 190);
  ctx.quadraticCurveTo(ox + 326, oy + 230, ox + 322, oy + 290);
  ctx.lineTo(ox + 278, oy + 290);
  ctx.quadraticCurveTo(ox + 274, oy + 230, ox + 300, oy + 190);
  ctx.fill();
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath();
  ctx.moveTo(ox + 300, oy + 190);
  ctx.lineTo(ox + 288, oy + 214);
  ctx.lineTo(ox + 312, oy + 214);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(ox + 278, oy + 290);
  ctx.lineTo(ox + 262, oy + 312);
  ctx.lineTo(ox + 278, oy + 300);
  ctx.closePath();
  ctx.moveTo(ox + 322, oy + 290);
  ctx.lineTo(ox + 338, oy + 312);
  ctx.lineTo(ox + 322, oy + 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = isB ? '#3b82f6' : '#f97316';
  ctx.beginPath();
  ctx.moveTo(ox + 284, oy + 292);
  ctx.quadraticCurveTo(ox + 300, oy + 340, ox + 316, oy + 292);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9fd8ff';
  if (isB) ctx.fillRect(ox + 288, oy + 228, 24, 24);
  else {
    ctx.beginPath();
    ctx.arc(ox + 300, oy + 240, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  if (isB) ctx.strokeRect(ox + 288, oy + 228, 24, 24);
  else {
    ctx.beginPath();
    ctx.arc(ox + 300, oy + 240, 13, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Moon with craters: one crater is gone in B.
  ctx.fillStyle = '#d7dce6';
  ctx.beginPath();
  ctx.arc(ox + 450, oy + 400, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#aab2c2';
  for (const [cx, cy, cr] of [[430, 385, 10], [450, 428, 8]]) {
    ctx.beginPath();
    ctx.arc(ox + cx, oy + cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!isB) {
    ctx.beginPath();
    ctx.arc(ox + 470, oy + 415, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flag planted on the moon: star emblem in A, plain circle in B.
  ctx.strokeStyle = '#e8edf5';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ox + 502, oy + 372);
  ctx.lineTo(ox + 502, oy + 330);
  ctx.stroke();
  ctx.fillStyle = '#e23b2e';
  ctx.fillRect(ox + 502, oy + 330, 34, 22);
  ctx.fillStyle = '#ffffff';
  if (isB) {
    ctx.beginPath();
    ctx.arc(ox + 519, oy + 341, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
      const a2 = a + Math.PI / 5;
      ctx.lineTo(ox + 519 + Math.cos(a) * 7, oy + 341 + Math.sin(a) * 7);
      ctx.lineTo(ox + 519 + Math.cos(a2) * 3, oy + 341 + Math.sin(a2) * 3);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export const PAINTERS = { garden: paintGarden, kitchen: paintKitchen, space: paintSpace };
