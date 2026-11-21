// All sound is synthesised with WebAudio oscillators: no audio files, no network.
// The context is created lazily on the first sound, so a page load makes no noise.
export function createSound() {
  let ctx = null;
  let muted = false;

  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, when, vol) {
    if (muted) return;
    try {
      const a = audio();
      const osc = a.createOscillator();
      const gain = a.createGain();
      const t = a.currentTime + (when || 0);
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol || 0.12, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(a.destination);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    } catch (e) {
      // No audio device: the game plays on silently.
    }
  }

  return {
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    click() {
      tone(660, 0.06, 'sine', 0, 0.07);
    },
    found() {
      tone(659, 0.12);
      tone(880, 0.2, 'sine', 0.1);
    },
    wrong() {
      tone(160, 0.18, 'square', 0, 0.1);
    },
    hint() {
      tone(988, 0.15);
    },
    win() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, 'sine', i * 0.12));
    },
    fail() {
      [392, 330, 262].forEach((f, i) => tone(f, 0.22, 'sine', i * 0.14));
    },
  };
}
