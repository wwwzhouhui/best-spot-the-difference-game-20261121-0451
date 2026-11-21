// Seeded random helpers for Twin Worlds.
// A tiny mulberry32 generator so the star field and flower scatter are
// identical on every load: the two panels must match exactly except for
// the designed differences.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A deterministic pick from a seeded stream: returns count items of arr.
export function seededPick(rand, arr, count) {
  const copy = arr.slice();
  const out = [];
  while (copy.length > 0 && out.length < count) {
    const i = Math.floor(rand() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}
