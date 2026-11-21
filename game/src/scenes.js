// The three pictures, drawn in code. Each scene has one draw function that paints the whole
// panel in panel-local coordinates (0..584, 0..520); `variant` paints the right-hand picture,
// which differs from the left in exactly the 7 spots listed in `differences`. Decorative
// randomness comes from a fixed seed per scene, so the two pictures match everywhere else.
import { createRandom } from './random.js';

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, width, stroke) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function cloud(ctx, x, y, scale) {
  ellipse(ctx, x, y, 42 * scale, 20 * scale, '#ffffff');
  ellipse(ctx, x - 26 * scale, y + 6 * scale, 26 * scale, 15 * scale, '#ffffff');
  ellipse(ctx, x + 28 * scale, y + 6 * scale, 28 * scale, 16 * scale, '#ffffff');
}

function flower(ctx, x, y, petal) {
  line(ctx, x, y, x, y + 22, 4, '#3f9d4e');
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 10, y + Math.sin(a) * 10, 7, petal);
  }
  circle(ctx, x, y, 6, '#ffd93b');
}

// --- Level 1: Sunny Garden -------------------------------------------------
function drawGarden(ctx, variant) {
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#a8d8ff');
  sky.addColorStop(1, '#e8f6ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 584, 340);
  rect(ctx, 0, 340, 584, 180, '#7ec850');
  rect(ctx, 0, 340, 584, 10, '#5da83c');

  // Sun with rays.
  circle(ctx, 80, 70, 40, '#ffd93b');
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    line(ctx, 80 + Math.cos(a) * 48, 70 + Math.sin(a) * 48, 80 + Math.cos(a) * 62, 70 + Math.sin(a) * 62, 5, '#ffd93b');
  }
  cloud(ctx, 200, 55, 1);
  cloud(ctx, 380, 40, 1.2);
  if (!variant) cloud(ctx, 480, 95, 0.9); // Difference 4: the third cloud.

  // House.
  rect(ctx, 90, 250, 180, 170, '#fff3d6');
  poly(ctx, [[70, 250], [290, 250], [180, 170]], '#e4572e');
  rect(ctx, 165, 340, 40, 80, '#8a5a2b');
  circle(ctx, 198, 382, 4, '#ffd93b');
  // Windows with curtains: open (pale) on the left picture, closed (blue) on the right.
  rect(ctx, 110, 280, 44, 44, '#bfe3ff');
  rect(ctx, 210, 280, 44, 44, '#bfe3ff');
  if (!variant) {
    rect(ctx, 110, 280, 10, 44, '#fff3d6');
    rect(ctx, 144, 280, 10, 44, '#fff3d6');
  } else {
    rect(ctx, 110, 280, 44, 44, '#7fa8d9');
  }
  rect(ctx, 210, 280, 10, 44, '#fff3d6');
  rect(ctx, 244, 280, 10, 44, '#fff3d6');

  // Tree with apples.
  rect(ctx, 440, 300, 26, 120, '#7a4a21');
  circle(ctx, 455, 260, 70, '#3f9d4e');
  circle(ctx, 410, 300, 50, '#3f9d4e');
  circle(ctx, 500, 300, 55, '#4cb45e');
  circle(ctx, 430, 270, 8, '#e63946');
  circle(ctx, 480, 250, 8, '#e63946');
  if (!variant) circle(ctx, 500, 310, 8, '#e63946'); // Difference 5: the third apple.

  // Fence.
  for (let x = 20; x < 564; x += 28) {
    rect(ctx, x, 420, 14, 42, '#ffffff');
    poly(ctx, [[x, 420], [x + 14, 420], [x + 7, 410]], '#ffffff');
  }
  rect(ctx, 20, 438, 544, 6, '#e8e8e8');

  // Path from the door.
  poly(ctx, [[165, 420], [205, 420], [225, 520], [145, 520]], '#e8d5a3');

  // Flowers along the grass.
  flower(ctx, 60, 480, '#ff8fab');
  flower(ctx, 150, 490, '#c77dff');
  flower(ctx, 300, 478, variant ? '#ffd93b' : '#e63946'); // Difference 2: red flower, yellow on the right.
  flower(ctx, 420, 488, '#ff8fab');
  flower(ctx, 520, 482, '#c77dff');

  // Cat sitting on the grass, tail up on the left, down on the right.
  ellipse(ctx, 330, 448, 26, 18, '#f4a259');
  circle(ctx, 330, 420, 16, '#f4a259');
  poly(ctx, [[318, 410], [322, 394], [330, 406]], '#f4a259');
  poly(ctx, [[334, 406], [342, 394], [344, 410]], '#f4a259');
  if (!variant) {
    line(ctx, 352, 452, 372, 432, 6, '#f4a259'); // Tail up.
  } else {
    line(ctx, 352, 452, 372, 470, 6, '#f4a259'); // Tail down.
  }

  // Butterfly near the tree, and a bird on the fence.
  if (!variant) { // Difference 0: the butterfly.
    ellipse(ctx, 492, 176, 12, 8, '#b388ff');
    ellipse(ctx, 508, 176, 12, 8, '#b388ff');
    line(ctx, 500, 168, 500, 190, 3, '#5a3d99');
  }
  if (!variant) { // Difference 6: the bird.
    ellipse(ctx, 200, 408, 14, 9, '#8b93a3');
    circle(ctx, 212, 400, 6, '#8b93a3');
    poly(ctx, [[217, 400], [226, 403], [217, 406]], '#f2a541');
  }
}

// --- Level 2: Cozy Kitchen -------------------------------------------------
function drawKitchen(ctx, variant) {
  rect(ctx, 0, 0, 584, 420, '#f7ead1');
  rect(ctx, 0, 420, 584, 100, '#c89b6a');
  for (let y = 440; y < 520; y += 26) line(ctx, 0, y, 584, y, 2, '#b3854f');

  // Window with night sky: a moon on the left, a star on the right.
  rect(ctx, 430, 40, 120, 130, '#ffffff');
  rect(ctx, 440, 50, 100, 110, '#1c2a4a');
  line(ctx, 490, 50, 490, 160, 4, '#ffffff');
  line(ctx, 440, 105, 540, 105, 4, '#ffffff');
  if (!variant) {
    circle(ctx, 480, 85, 22, '#ffeeb0');
    circle(ctx, 472, 80, 5, '#e8d28a');
    circle(ctx, 488, 92, 4, '#e8d28a');
  } else {
    poly(ctx, [[480, 66], [485, 80], [500, 85], [485, 90], [480, 104], [475, 90], [460, 85], [475, 80]], '#ffeeb0');
  }

  // Wall clock: 3:00 on the left, 4:30 on the right.
  circle(ctx, 120, 90, 36, '#ffffff');
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(120, 90, 36, 0, Math.PI * 2);
  ctx.stroke();
  if (!variant) {
    line(ctx, 120, 90, 120, 66, 4, '#333333');
    line(ctx, 120, 90, 142, 90, 4, '#333333');
  } else {
    line(ctx, 120, 90, 136, 104, 4, '#333333');
    line(ctx, 120, 90, 120, 112, 4, '#333333');
  }
  circle(ctx, 120, 90, 4, '#333333');

  // Shelf with jars.
  rect(ctx, 60, 150, 180, 14, '#8a5a2b');
  rect(ctx, 90, 112, 36, 38, '#a8d8b9');
  rect(ctx, 140, 106, 36, 44, '#f2c94c');
  if (!variant) rect(ctx, 190, 114, 36, 36, '#e8a0a0'); // Difference 4: the third jar.
  rect(ctx, 90, 106, 36, 6, '#5a3d99');
  rect(ctx, 140, 100, 36, 6, '#5a3d99');
  if (!variant) rect(ctx, 190, 108, 36, 6, '#5a3d99');

  // Hanging lamp.
  line(ctx, 290, 0, 290, 46, 4, '#333333');
  poly(ctx, [[262, 46], [318, 46], [304, 78], [276, 78]], '#ffd93b');
  circle(ctx, 290, 86, 12, '#ffeeb0');

  // Table, teapot, cups.
  rect(ctx, 120, 380, 344, 26, '#8a5a2b');
  rect(ctx, 140, 406, 18, 114, '#6e4520');
  rect(ctx, 426, 406, 18, 114, '#6e4520');
  // Teapot.
  circle(ctx, 250, 336, 34, '#7fa8d9');
  poly(ctx, [[238, 306], [262, 306], [250, 288]], '#7fa8d9');
  line(ctx, 218, 330, 196, 312, 10, '#7fa8d9');
  ctx.strokeStyle = '#7fa8d9';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(292, 336, 16, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  if (!variant) { // Difference 0: the steam.
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(244, 282);
    ctx.quadraticCurveTo(236, 268, 244, 254);
    ctx.moveTo(258, 282);
    ctx.quadraticCurveTo(266, 268, 258, 254);
    ctx.stroke();
  }
  // Cups.
  rect(ctx, 168, 352, 28, 22, '#ffffff');
  rect(ctx, 312, 352, 28, 22, '#ffffff');
  ellipse(ctx, 182, 352, 14, 4, '#8a5a2b');
  ellipse(ctx, 326, 352, 14, 4, '#8a5a2b');

  // Fruit bowl.
  ellipse(ctx, 408, 400, 46, 18, '#e4572e');
  circle(ctx, 388, 384, 13, '#e63946');
  circle(ctx, 408, 380, 13, '#e63946');
  if (!variant) circle(ctx, 430, 386, 13, '#f2a541'); // Difference 2: the orange.

  // Cat on a chair, bow red on the left, blue on the right.
  rect(ctx, 470, 430, 70, 12, '#8a5a2b');
  rect(ctx, 474, 442, 10, 78, '#6e4520');
  rect(ctx, 526, 442, 10, 78, '#6e4520');
  ellipse(ctx, 500, 408, 26, 18, '#9aa5b8');
  circle(ctx, 500, 382, 15, '#9aa5b8');
  poly(ctx, [[490, 374], [493, 360], [500, 370]], '#9aa5b8');
  poly(ctx, [[502, 370], [509, 360], [512, 374]], '#9aa5b8');
  poly(ctx, [[492, 400], [500, 394], [508, 400], [500, 406]], variant ? '#4fc3f7' : '#e63946');

  // Rug with stripes: the middle stripe is missing on the right.
  rect(ctx, 150, 478, 280, 34, '#e4572e');
  rect(ctx, 150, 478, 280, 10, '#fff3d6');
  if (!variant) rect(ctx, 150, 495, 280, 10, '#fff3d6');
}

// --- Level 3: Starry Space -------------------------------------------------
function drawSpace(ctx, variant) {
  rect(ctx, 0, 0, 584, 520, '#0b1030');
  const stars = createRandom(7);
  for (let i = 0; i < 42; i += 1) {
    const x = 20 + stars() * 544;
    const y = 20 + stars() * 480;
    const r = 1 + stars() * 2;
    // Keep the star field clear of the difference spots.
    if (Math.hypot(x - 520, y - 120) < 24) continue;
    circle(ctx, x, y, r, stars() > 0.5 ? '#ffffff' : '#cdd7ff');
  }
  if (!variant) circle(ctx, 520, 120, 4, '#ffffff'); // Difference 3: the lone star.

  // Earth, bottom left.
  circle(ctx, 60, 470, 90, '#2f7fe0');
  ellipse(ctx, 40, 450, 34, 18, '#3f9d4e');
  ellipse(ctx, 80, 490, 26, 14, '#3f9d4e');
  ellipse(ctx, 30, 500, 30, 10, '#ffffff');
  ellipse(ctx, 90, 440, 26, 8, '#ffffff');

  // Ringed planet, top left: rings on the left picture only.
  circle(ctx, 110, 180, 34, '#e8862e');
  ellipse(ctx, 110, 180, 12, 20, '#c96a1e');
  if (!variant) {
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(110, 180, 58, 14, -0.4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Moon with craters, top right.
  circle(ctx, 480, 90, 48, '#d8d8d8');
  circle(ctx, 465, 80, 8, '#b8b8b8');
  if (!variant) circle(ctx, 495, 105, 10, '#b8b8b8'); // Difference 5: the big crater.
  circle(ctx, 475, 115, 6, '#b8b8b8');

  // Satellite, top left: its dish points up on the left, down on the right.
  rect(ctx, 70, 65, 40, 30, '#9aa5b8');
  rect(ctx, 30, 72, 34, 6, '#4fc3f7');
  rect(ctx, 116, 72, 34, 6, '#4fc3f7');
  if (!variant) {
    line(ctx, 90, 65, 90, 44, 4, '#d8d8d8');
    poly(ctx, [[78, 44], [102, 44], [90, 30]], '#ffd166');
  } else {
    line(ctx, 90, 95, 90, 116, 4, '#d8d8d8');
    poly(ctx, [[78, 116], [102, 116], [90, 130]], '#ffd166');
  }

  // Rocket, centre.
  rect(ctx, 272, 180, 40, 120, '#f2f5fa');
  poly(ctx, [[272, 180], [312, 180], [292, 140]], '#e63946');
  poly(ctx, [[272, 280], [252, 320], [272, 300]], '#e63946');
  poly(ctx, [[312, 280], [332, 320], [312, 300]], '#e63946');
  // Window: round on the left, square on the right.
  if (!variant) {
    circle(ctx, 292, 230, 14, '#4fc3f7');
  } else {
    rect(ctx, 278, 216, 28, 28, '#4fc3f7');
  }
  // Flame: orange on the left, blue on the right.
  poly(ctx, [[278, 300], [306, 300], [292, 344]], variant ? '#4fc3f7' : '#ff9f1c');
  poly(ctx, [[284, 300], [300, 300], [292, 328]], variant ? '#9adcff' : '#ffd166');

  // Astronaut, right: flag patch on the left picture only.
  circle(ctx, 450, 300, 26, '#f2f5fa');
  circle(ctx, 450, 300, 18, '#22304a');
  ellipse(ctx, 450, 352, 24, 30, '#f2f5fa');
  rect(ctx, 428, 336, 10, 26, '#f2f5fa');
  rect(ctx, 462, 336, 10, 26, '#f2f5fa');
  if (!variant) {
    rect(ctx, 442, 344, 16, 11, '#e63946');
    rect(ctx, 442, 344, 16, 4, '#ffffff');
  }
  line(ctx, 426, 372, 414, 388, 6, '#f2f5fa');
  line(ctx, 474, 372, 486, 388, 6, '#f2f5fa');
}

/** The three levels, in order. Each difference is a spot in panel-local coordinates. */
export const LEVELS = [
  {
    name: 'Sunny Garden',
    draw: drawGarden,
    differences: [
      { x: 500, y: 180, r: 26, label: 'Butterfly' },
      { x: 352, y: 452, r: 24, label: "Cat's tail" },
      { x: 300, y: 478, r: 22, label: 'Red flower' },
      { x: 132, y: 302, r: 26, label: 'Curtains' },
      { x: 480, y: 95, r: 30, label: 'Cloud' },
      { x: 500, y: 310, r: 18, label: 'Apple' },
      { x: 200, y: 415, r: 22, label: 'Bird' },
    ],
  },
  {
    name: 'Cozy Kitchen',
    draw: drawKitchen,
    differences: [
      { x: 250, y: 292, r: 24, label: 'Teapot steam' },
      { x: 120, y: 90, r: 30, label: 'Clock hands' },
      { x: 430, y: 386, r: 20, label: 'Orange' },
      { x: 500, y: 400, r: 20, label: "Cat's bow" },
      { x: 208, y: 131, r: 22, label: 'Jar' },
      { x: 480, y: 85, r: 26, label: 'Moon' },
      { x: 290, y: 495, r: 22, label: 'Rug stripe' },
    ],
  },
  {
    name: 'Starry Space',
    draw: drawSpace,
    differences: [
      { x: 292, y: 230, r: 22, label: 'Rocket window' },
      { x: 450, y: 349, r: 18, label: 'Flag patch' },
      { x: 110, y: 180, r: 30, label: 'Planet rings' },
      { x: 520, y: 120, r: 16, label: 'Lone star' },
      { x: 90, y: 58, r: 24, label: 'Satellite dish' },
      { x: 495, y: 105, r: 20, label: 'Moon crater' },
      { x: 292, y: 330, r: 24, label: 'Rocket flame' },
    ],
  },
];

/** Paint one picture of a level: `variant` false is the left picture, true the right. */
export function drawScene(ctx, levelIndex, variant) {
  LEVELS[levelIndex].draw(ctx, variant);
}
