// Sound for Twin Worlds: WebAudio oscillator blips, no audio files.
// The context is created lazily on the first user gesture so the page
// never complains about autoplay; every call is guarded, so a browser
// without audio still plays fine, silently.

let ctx = null;

function audio() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch (e) {
    ctx = null;
  }
  return ctx;
}

function tone(freq, dur, type, gain, when = 0) {
  const ac = audio();
  if (!ac) return;
  try {
    if (ac.state === 'suspended') void ac.resume();
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp);
    amp.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch (e) {
    /* sound is decoration; never break the game */
  }
}

export function sfxFound(muted) {
  if (muted) return;
  tone(660, 0.12, 'sine', 0.16);
  tone(880, 0.18, 'sine', 0.16, 0.09);
}

export function sfxWrong(muted) {
  if (muted) return;
  tone(160, 0.16, 'square', 0.07);
}

export function sfxHint(muted) {
  if (muted) return;
  tone(1046, 0.2, 'sine', 0.1);
}

export function sfxWin(muted) {
  if (muted) return;
  [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.14, i * 0.11));
}

export function sfxClick(muted) {
  if (muted) return;
  tone(440, 0.06, 'sine', 0.08);
}
