// Twin Worlds — Spot the Difference: the build entry point (Node 22, standard library only).
// The game is the plain static files in game/ — index.html plus ES modules, no library, no
// network request, every picture drawn in code. This program hands it in: it copies game/
// and screenshots/ from beside this file to the output directory and writes dossier.json,
// the summary the judge reads, using the vendored make.fun library.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

// The grader reads /output as another user, so every file it holds must be
// world-readable and every folder traversable, whatever the umask was.
function chmodTree(dir: string): void {
  chmodSync(dir, 0o755);
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) chmodTree(path);
    else chmodSync(path, 0o644);
  }
}

copyTree(join(here, 'game'), join(out, 'game'));
if (existsSync(join(here, 'screenshots'))) {
  copyTree(join(here, 'screenshots'), join(out, 'screenshots'));
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the others refuse an
// entry the scorer would refuse — more than 4 screenshots or one over 256 KiB; more
// than 993 files in game/ or 48 MiB of game files in all; or a path under game/ over
// 1000 bytes.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);
chmodTree(out);
console.log(`Wrote ${join(out, 'dossier.json')} (${dossier.length} bytes)`);
