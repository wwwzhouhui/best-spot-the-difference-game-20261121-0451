// Entry point for Twin Worlds (best-spot-the-difference-game-20261121-0451).
// Copies game/ and screenshots/ from this repository into the output
// directory and writes dossier.json with buildDossier from the kit's
// vendored library, so the dossier is byte for byte what the scorer
// rebuilds from the same files. Outside the grader, MAKEFUN_OUTPUT_DIR
// stands in for /output. Standard library only; runs on Node 22 as-is.

import { cpSync, existsSync, mkdirSync, readdirSync, lstatSync, chmodSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    const from = join(src, name);
    const to = join(dest, name);
    const st = lstatSync(from);
    if (st.isSymbolicLink()) throw new Error(`refusing to copy symlink: ${from}`);
    if (st.isDirectory()) copyTree(from, to);
    else if (st.isFile()) cpSync(from, to);
  }
}

function chmodTree(dir: string): void {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = lstatSync(p);
    if (st.isDirectory()) {
      chmodSync(p, 0o755);
      chmodTree(p);
    } else if (st.isFile()) {
      chmodSync(p, 0o644);
    }
  }
}

mkdirSync(outDir, { recursive: true });

// Pre-flight: fail fast with a clear message when the entry is
// incomplete, instead of handing the grader a broken output.
const indexHtml = join(repoRoot, 'game', 'index.html');
if (!existsSync(indexHtml)) throw new Error('game/index.html missing from repository');
const shots = readdirSync(join(repoRoot, 'screenshots')).filter((n) => !n.startsWith('.'));
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
}
for (const shot of shots) {
  if (!/\.(png|jpe?g)$/i.test(shot)) throw new Error(`screenshot is not PNG or JPEG: ${shot}`);
}

copyTree(join(repoRoot, 'game'), join(outDir, 'game'));
copyTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
chmodTree(outDir);
chmodSync(outDir, 0o755);
const gameFiles = readdirSync(join(outDir, 'game'), { recursive: true }).length;
console.log(`wrote ${outDir}/dossier.json (${dossier.length} bytes) from ${gameFiles} game entries and ${shots.length} screenshots`);
