// The game's state: which screen is showing, what has been found, the score, the timer.
// Nothing here draws anything; render.js reads this state and paints it.
import { LEVELS } from './scenes.js';
import {
  PANEL, LEVEL_SECONDS, HINTS_PER_LEVEL, POINTS,
  HINT_MARK_SECONDS, MISS_MARK_SECONDS, BEST_KEY,
} from './config.js';
import { createSound } from './sound.js';

function readBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch (e) {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch (e) {
    // Private mode: the game plays on without a saved best.
  }
}

export function createWorld() {
  const sound = createSound();
  const world = {
    screen: 'title', // title | play | paused | leveldone | gameover | failed
    levelIndex: 0,
    found: LEVELS[0].differences.map(() => false),
    score: 0,
    totalScore: 0,
    timeLeft: LEVEL_SECONDS,
    hintsLeft: HINTS_PER_LEVEL,
    misses: [], // {x, y, side, t} in panel-local coords
    hintPulse: null, // {index, t}
    lastFound: null, // {label, t}
    levelBonus: 0,
    best: readBest(),
    frozen: false, // Screenshots freeze the timer so the shot is repeatable.
    cursor: { x: PANEL.leftX + PANEL.width / 2, y: PANEL.y + PANEL.height / 2 },
    cursorVisible: false,
    time: 0,
    sound,

    get level() {
      return LEVELS[this.levelIndex];
    },
    get foundCount() {
      return this.found.filter(Boolean).length;
    },
    get remainingCount() {
      return this.found.length - this.foundCount;
    },
    get muted() {
      return this.sound.muted;
    },

    startGame() {
      this.totalScore = 0;
      this.levelIndex = 0;
      this.startLevel(0);
    },

    startLevel(index) {
      this.levelIndex = index;
      this.found = LEVELS[index].differences.map(() => false);
      this.score = 0;
      this.timeLeft = LEVEL_SECONDS;
      this.hintsLeft = HINTS_PER_LEVEL;
      this.misses = [];
      this.hintPulse = null;
      this.lastFound = null;
      this.levelBonus = 0;
      this.screen = 'play';
    },

    restartLevel() {
      this.startLevel(this.levelIndex);
    },

    nextLevel() {
      if (this.levelIndex + 1 >= LEVELS.length) {
        this.screen = 'gameover';
        if (this.totalScore > this.best) {
          this.best = this.totalScore;
          saveBest(this.best);
        }
        return;
      }
      this.startLevel(this.levelIndex + 1);
    },

    pause() {
      if (this.screen === 'play') this.screen = 'paused';
    },

    resume() {
      if (this.screen === 'paused') this.screen = 'play';
    },

    toggleMute() {
      return this.sound.toggleMute();
    },

    update(dt) {
      this.time += dt;
      if (this.screen === 'play' && !this.frozen) {
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
          this.timeLeft = 0;
          this.screen = 'failed';
          this.sound.fail();
        }
      }
      for (const miss of this.misses) miss.t -= dt;
      this.misses = this.misses.filter((m) => m.t > 0);
      if (this.hintPulse) {
        this.hintPulse.t -= dt;
        if (this.hintPulse.t <= 0) this.hintPulse = null;
      }
      if (this.lastFound) {
        this.lastFound.t -= dt;
        if (this.lastFound.t <= 0) this.lastFound = null;
      }
    },

    // A click in field coordinates. Returns 'found' | 'miss' | 'ignored'.
    clickAt(fieldX, fieldY) {
      if (this.screen !== 'play') return 'ignored';
      let side = null;
      let lx = 0;
      let ly = 0;
      if (fieldX >= PANEL.leftX && fieldX <= PANEL.leftX + PANEL.width
        && fieldY >= PANEL.y && fieldY <= PANEL.y + PANEL.height) {
        side = 'left';
        lx = fieldX - PANEL.leftX;
        ly = fieldY - PANEL.y;
      } else if (fieldX >= PANEL.rightX && fieldX <= PANEL.rightX + PANEL.width
        && fieldY >= PANEL.y && fieldY <= PANEL.y + PANEL.height) {
        side = 'right';
        lx = fieldX - PANEL.rightX;
        ly = fieldY - PANEL.y;
      } else {
        return 'ignored';
      }
      const diffs = this.level.differences;
      for (let i = 0; i < diffs.length; i += 1) {
        if (this.found[i]) continue;
        const d = diffs[i];
        if (Math.hypot(lx - d.x, ly - d.y) <= d.r) {
          this.found[i] = true;
          this.score += POINTS.find;
          this.lastFound = { label: d.label, t: 2 };
          this.sound.found();
          if (this.remainingCount === 0) this.completeLevel();
          return 'found';
        }
      }
      this.misses.push({ x: lx, y: ly, side, t: MISS_MARK_SECONDS });
      this.score = Math.max(0, this.score + POINTS.wrong);
      this.sound.wrong();
      return 'miss';
    },

    completeLevel() {
      this.levelBonus = Math.ceil(this.timeLeft) * POINTS.timeBonus;
      this.totalScore += this.score + this.levelBonus;
      this.screen = 'leveldone';
      this.sound.win();
    },

    hint() {
      if (this.screen !== 'play' || this.hintsLeft <= 0) return false;
      const unfound = this.found.map((f, i) => (f ? -1 : i)).filter((i) => i >= 0);
      if (unfound.length === 0) return false;
      const index = unfound[Math.floor(Math.random() * unfound.length)];
      this.hintPulse = { index, t: HINT_MARK_SECONDS };
      this.hintsLeft -= 1;
      this.score = Math.max(0, this.score + POINTS.hint);
      this.sound.hint();
      return true;
    },

    // The buttons the current screen shows, in field coordinates. Input and
    // render share this list so a drawn button is always the clickable one.
    buttons() {
      const wide = { x: 490, y: 500, w: 300, h: 64 };
      if (this.screen === 'title') return [{ id: 'start', x: 490, y: 460, w: 300, h: 64 }];
      if (this.screen === 'leveldone') return [{ id: 'next', ...wide }];
      if (this.screen === 'gameover') return [{ id: 'again', ...wide }];
      if (this.screen === 'failed') return [{ id: 'retry', ...wide }];
      if (this.screen === 'paused') {
        return [
          { id: 'resume', x: 490, y: 420, w: 300, h: 64 },
          { id: 'restart', x: 490, y: 500, w: 300, h: 64 },
        ];
      }
      return [];
    },

    pressButton(id) {
      if (id === 'start') this.startGame();
      else if (id === 'next') this.nextLevel();
      else if (id === 'again') this.startGame();
      else if (id === 'retry') this.restartLevel();
      else if (id === 'resume') this.resume();
      else if (id === 'restart') this.restartLevel();
      this.sound.click();
    },
  };
  return world;
}
