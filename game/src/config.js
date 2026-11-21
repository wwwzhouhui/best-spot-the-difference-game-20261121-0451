// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical area;
// the renderer scales it to the window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

// The two picture panels, side by side. Differences are stored in panel-local coordinates
// (0..PANEL.width, 0..PANEL.height) and drawn on both panels at the same spot.
export const PANEL = { leftX: 32, rightX: 664, y: 110, width: 584, height: 520 };

// How many differences each level hides, and how long a level lasts.
export const DIFFERENCES_PER_LEVEL = 7;
export const LEVEL_SECONDS = 90;
export const HINTS_PER_LEVEL = 3;

// Points: a find, a hint's cost, a wrong click's cost, and a second of time left at level end.
export const POINTS = { find: 100, hint: -15, wrong: -5, timeBonus: 10 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** How far a wrong-click X marker stays visible, in seconds. */
export const MISS_MARK_SECONDS = 0.9;
/** How long a hint's pulsing ring stays visible, in seconds. */
export const HINT_MARK_SECONDS = 1.6;

/** Keyboard cursor: arrow-key step, and the faster step while Shift is held. */
export const CURSOR = { step: 12, fastStep: 48 };

export const PALETTE = {
  backdrop: '#141a26',
  hud: '#1d2536',
  panel: '#0e1420',
  panelBorder: '#3a4763',
  text: '#f2f5fa',
  muted: '#9aa5b8',
  accent: '#ffd166',
  found: '#3ddc84',
  foundSoft: 'rgba(61, 220, 132, 0.25)',
  miss: '#ef476f',
  hint: '#ffd166',
  timer: '#4fc3f7',
  timerLow: '#ef476f',
  button: '#2a3550',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best total score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-worlds.best';
