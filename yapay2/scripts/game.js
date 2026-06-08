// scripts/game.js — Game state machine

export class GameState {
  constructor() {
    this.state      = 'MENU';   // MENU | READY | SHOOTING | RESULT_SHOW | GAME_OVER | PAUSED
    this.prevState  = 'READY';

    this.mode       = 'classic'; // classic | endless | target
    this.difficulty = 'medium';  // easy | medium | hard

    this.score      = 0;    // goals or points
    this.goals      = 0;
    this.saves      = 0;
    this.misses     = 0;
    this.posts      = 0;
    this.shots      = 0;    // total attempts
    this.maxShots   = 5;    // classic mode

    this.combo      = 0;    // target mode
    this.targets    = [];   // { id, hit } for target mode
    this.shotHistory = [];  // last N shot vectors for AI habit analysis
  }

  get accuracy() {
    if (this.shots === 0) return null;
    return Math.round((this.goals / this.shots) * 100);
  }

  startNew(mode, difficulty) {
    this.mode       = mode;
    this.difficulty = difficulty;
    this.state      = 'READY';
    this.prevState  = 'READY';

    this.score      = 0;
    this.goals      = 0;
    this.saves      = 0;
    this.misses     = 0;
    this.posts      = 0;
    this.shots      = 0;
    this.combo      = 0;
    this.shotHistory = [];

    this.maxShots = mode === 'classic' ? 5 : Infinity;
    this.targets  = mode === 'target' ? this._makeTargets() : [];
  }

  _makeTargets() {
    // 6 targets arranged inside the goal
    return [
      { id: 0, nx: -0.7, ny: 0.8, hit: false },  // top-left
      { id: 1, nx:  0.0, ny: 0.8, hit: false },  // top-centre
      { id: 2, nx:  0.7, ny: 0.8, hit: false },  // top-right
      { id: 3, nx: -0.7, ny: 0.3, hit: false },  // mid-left
      { id: 4, nx:  0.7, ny: 0.3, hit: false },  // mid-right
      { id: 5, nx:  0.0, ny: 0.3, hit: false },  // centre
    ];
  }

  resetTargets() {
    this.targets.forEach(t => { t.hit = false; });
  }

  recordGoal() {
    this.goals++;
    this.shots++;
    this.combo++;
    const points = this.mode === 'target' ? 10 * this.combo : 1;
    this.score  += points;
    this._pushHistory('goal');
    return points;
  }

  recordSave() {
    this.saves++;
    this.shots++;
    this.combo = 0;
    this._pushHistory('save');
  }

  recordMiss() {
    this.misses++;
    this.shots++;
    this.combo = 0;
    this._pushHistory('miss');
  }

  recordPost() {
    this.posts++;
    this.shots++;
    this.combo = 0;
    this._pushHistory('post');
  }

  _pushHistory(result) {
    this.shotHistory.push(result);
    if (this.shotHistory.length > 8) this.shotHistory.shift();
  }

  isGameOver() {
    if (this.mode === 'classic') return this.shots >= this.maxShots;
    if (this.mode === 'endless') return this.saves > 0 || this.misses > 0 || this.posts > 0;
    if (this.mode === 'target')  return this.targets.every(t => t.hit) || this.misses > 0 || this.saves > 0;
    return false;
  }

  pause() {
    if (this.state === 'READY' || this.state === 'SHOOTING') {
      this.prevState = this.state;
      this.state = 'PAUSED';
    }
  }

  resume() {
    if (this.state === 'PAUSED') {
      this.state = this.prevState;
    }
  }
}
