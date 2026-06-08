// scripts/main.js — Game orchestrator (entry point)
import * as THREE from 'three';
import { SceneManager }   from './scene.js';
import { createStadium }  from './stadium.js';
import { Goal, GOAL }     from './goal.js';
import { Ball }           from './ball.js';
import { Goalkeeper }     from './goalkeeper.js';
import { InputManager }   from './input.js';
import { CameraController } from './camera.js';
import { AudioManager }   from './audio.js';
import { UIManager }      from './ui.js';
import { GameState }      from './game.js';
import { load, save, recordResult } from './storage.js';

// ────────────────────────────────────────────────────────────────────────────
class PenaltyGame {
  constructor() {
    this.sceneMgr    = null;
    this.audio       = new AudioManager();
    this.ui          = null;
    this.game        = new GameState();
    this.input       = null;
    this.cameraCtrl  = null;

    this.goal        = null;
    this.ball        = null;
    this.goalkeeper  = null;

    this.data         = load();
    this.selectedMode = 'classic';

    this._clock      = new THREE.Clock();
    this._animId     = null;
    this._loop       = this._gameLoop.bind(this);

    // Outcome guard — prevent double-triggering
    this._outcomeHandled = false;
  }

  // ── Initialisation ────────────────────────────────────────────────

  async init() {
    const canvas = document.getElementById('game-canvas');

    this._setProgress(10, 'Renderer oluşturuluyor…');
    await this._tick();

    // Scene
    this.sceneMgr = new SceneManager(canvas);
    const { isLow } = this.sceneMgr.init(this.data.settings.quality);

    this._setProgress(30, 'Stadyum inşa ediliyor…');
    await this._tick();
    createStadium(this.sceneMgr.scene, isLow);

    this._setProgress(50, 'Kale kuruluyor…');
    await this._tick();
    this.goal = new Goal(this.sceneMgr.scene);

    this._setProgress(65, 'Top hazırlanıyor…');
    await this._tick();
    this.ball = new Ball(this.sceneMgr.scene);

    this._setProgress(78, 'Kaleci sahaya giriyor…');
    await this._tick();
    this.goalkeeper = new Goalkeeper(this.sceneMgr.scene);

    this._setProgress(90, 'Kontroller ayarlanıyor…');
    await this._tick();

    // Input
    this.input = new InputManager(canvas);
    this.input.onDragStart = (x, y)            => this._onDragStart(x, y);
    this.input.onDragMove  = (x, y, dx, dy)    => this._onDragMove(x, y, dx, dy);
    this.input.onDragEnd   = (dx, dy, pw, spd) => this._onDragEnd(dx, dy, pw, spd);

    // Camera
    this.cameraCtrl = new CameraController(this.sceneMgr.camera);
    this.cameraCtrl.setState('menu');

    // UI
    this.ui = new UIManager(this);
    this.ui.updateMenuStats(this.data);
    this.ui.updateSettings(this.data.settings);

    // Sound
    this.audio.setEnabled(this.data.settings.sound);

    // Resize
    window.addEventListener('resize', () => this.sceneMgr.resize());

    this._setProgress(100, 'Hazır!');
    await this._tick(400);

    this.ui.showScreen('main-menu');
    this.audio.init();
    this.audio.startMenuMusic();

    // Start render loop
    this._clock.start();
    this._loop();
  }

  _setProgress(pct, text) {
    const bar  = document.getElementById('loading-bar');
    const txt  = document.getElementById('loading-text');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = text;
  }

  _tick(ms = 30) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ── Game Loop ─────────────────────────────────────────────────────

  _gameLoop() {
    this._animId = requestAnimationFrame(this._loop);
    const dt = Math.min(this._clock.getDelta(), 0.05);

    this._update(dt);
    this.sceneMgr.render();
  }

  _update(dt) {
    // Always update goalkeeper animation
    if (this.goalkeeper) this.goalkeeper.update(dt);

    // Always update camera
    if (this.cameraCtrl) {
      this.cameraCtrl.update(
        dt,
        this.game.state,
        this.ball ? this.ball.position : null
      );
    }

    // Update ball physics only when shooting
    if (this.game.state === 'SHOOTING' && this.ball) {
      this.ball.update(dt);
      this._checkShotOutcome();
    }
  }

  // ── Input Handlers ────────────────────────────────────────────────

  _onDragStart(x, y) {
    if (this.game.state !== 'READY') return;
    this.audio.init();
    this.audio.stopMenuMusic();
  }

  _onDragMove(x, y, dx, dy) {
    if (this.game.state !== 'READY') return;

    const power = this.input.getDragPower();
    this.ui.setPower(power);

    // Aim ring: project drag onto the goal region on screen
    // Simple linear mapping: drag up/left/right moves ring around goal centre
    const cx   = window.innerWidth  * 0.5;
    const cy   = window.innerHeight * 0.38;   // approx goal centre Y on screen
    const aimX = cx + (dx / window.innerWidth)  * window.innerWidth  * 0.5;
    const aimY = cy + (dy / window.innerHeight)  * window.innerHeight * 0.3;
    this.ui.showAim(aimX, aimY);
  }

  _onDragEnd(dx, dy, power, speed) {
    if (this.game.state !== 'READY') return;
    if (power < 0.04) return;  // ignore micro-swipes

    this.ui.hideInstruction();
    this.ui.hidePowerBar();
    this.ui.hideAim();

    this._shoot(dx, dy, power);
  }

  // ── Shooting ─────────────────────────────────────────────────────

  _shoot(dx, dy, power) {
    this.game.state       = 'SHOOTING';
    this._outcomeHandled  = false;

    const W = window.innerWidth;
    const H = window.innerHeight;

    // Horizontal: drag right → ball goes right (positive X in our scene)
    const vx = (dx / W) * 18 * power;

    // Vertical: drag up (negative dy) → ball goes higher
    const vy = (-dy / H) * 14 * power + 2.5;

    // Always shoot toward goal (negative Z)
    const minSpd = 13, maxSpd = 24;
    const vz = -(minSpd + power * (maxSpd - minSpd));

    // Slight Magnus spin based on horizontal component
    const spinX = (dx / W) * 1.2;

    this.ball.shoot(vx, vy, vz, spinX);

    // Goalkeeper reacts
    this.goalkeeper.react(
      dx, dy, this.game.difficulty, this.game.shotHistory
    );

    // Camera follows ball
    this.cameraCtrl.setState('follow');

    // Sound
    this.audio.playShot();

    // Shot history is recorded by GameState.record*() methods after outcome
  }

  // ── Outcome Detection ─────────────────────────────────────────────

  _checkShotOutcome() {
    if (this._outcomeHandled) return;

    const pos  = this.ball.position;
    const goalZ = GOAL.Z;

    // ── Detect when ball reaches goal plane ──────────────────────────
    if (pos.z > goalZ - 0.3) return;  // ball hasn't reached goal yet

    this._outcomeHandled = true;

    const HW       = GOAL.HALF_W;
    const HEIGHT   = GOAL.HEIGHT;
    const POST_R   = GOAL.POST_R + 0.22;  // ball radius added

    // Post collision — check edges
    const nearLeftPost  = Math.abs(pos.x - (-HW)) < POST_R && pos.y > 0 && pos.y < HEIGHT;
    const nearRightPost = Math.abs(pos.x -  HW)   < POST_R && pos.y > 0 && pos.y < HEIGHT;
    const nearCrossbar  = Math.abs(pos.y -  HEIGHT) < POST_R && pos.x > -HW && pos.x < HW;

    if (nearLeftPost || nearRightPost || nearCrossbar) {
      this._onPost();
      return;
    }

    // Goal bounds check
    const inGoal = pos.x > -HW + 0.05 &&
                   pos.x <  HW - 0.05 &&
                   pos.y >  0.05       &&
                   pos.y <  HEIGHT - 0.05;

    if (!inGoal) {
      this._onMiss();
      return;
    }

    // Goalkeeper save check
    if (this.goalkeeper.checkSave(pos)) {
      this._onSave();
    } else {
      this._onGoal(pos);
    }
  }

  // ── Outcome Handlers ──────────────────────────────────────────────

  _onGoal(ballPos) {
    this.game.recordGoal();
    this.audio.playNet();
    this.goal.shakeNet();

    // Target mode: check which target was hit
    if (this.game.mode === 'target' && ballPos) {
      this._checkTargetHit(ballPos);
    }

    if (navigator.vibrate) navigator.vibrate(200);

    setTimeout(() => {
      this.audio.playGoal();
      this.cameraCtrl.setState('celebrate');
    }, 100);

    this.ui.showShotResult('⚽ GOL!', 'goal');
    this._scheduleNextShot(2800);
  }

  _onSave() {
    this.game.recordSave();
    this.audio.playSave();

    this.ui.showShotResult('🧤 KURTARILDI!', 'save');

    if (this.game.mode === 'endless' || this.game.mode === 'target') {
      this._scheduleGameOver(2200);
    } else {
      this._scheduleNextShot(2200);
    }
  }

  _onMiss() {
    this.game.recordMiss();
    this.audio.playMiss();

    this.ui.showShotResult('❌ KAÇIRILDI', 'miss');

    if (this.game.mode === 'endless' || this.game.mode === 'target') {
      this._scheduleGameOver(2200);
    } else {
      this._scheduleNextShot(2200);
    }
  }

  _onPost() {
    this.game.recordPost();
    this.audio.playPost();
    this.ball.bouncePost();
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);

    this.ui.showShotResult('🥅 DİREK!', 'post');

    if (this.game.mode === 'endless' || this.game.mode === 'target') {
      this._scheduleGameOver(2200);
    } else {
      this._scheduleNextShot(2200);
    }
  }

  _checkTargetHit(ballPos) {
    const HW = GOAL.HALF_W;
    const H  = GOAL.HEIGHT;
    let hitIdx = -1;
    let minDist = Infinity;

    this.game.targets.forEach((t, i) => {
      if (t.hit) return;
      const tx = t.nx * HW * 0.85;
      const ty = H * t.ny;
      const d  = Math.sqrt((ballPos.x - tx) ** 2 + (ballPos.y - ty) ** 2);
      if (d < 0.8 && d < minDist) {
        minDist = d;
        hitIdx  = i;
      }
    });

    if (hitIdx >= 0) {
      this.game.targets[hitIdx].hit = true;
      this.goal.markTargetHit(hitIdx);

      // Check if all targets hit → bonus
      if (this.game.targets.every(t => t.hit)) {
        setTimeout(() => this._scheduleGameOver(500), 1000);
      }
    }
  }

  _scheduleNextShot(delay) {
    setTimeout(() => {
      // Update HUD before checking game over
      this.ui.updateHUD(this.game);

      if (this.game.isGameOver()) {
        this._endGame();
        return;
      }

      this.ball.reset();
      this.goalkeeper.reset();
      this.cameraCtrl.setState('pre-shot');
      this.game.state = 'READY';

      this.ui.hideShotResult();
      this.ui.showInstruction();
      this.ui.updateHUD(this.game);
    }, delay);
  }

  _scheduleGameOver(delay) {
    setTimeout(() => this._endGame(), delay);
  }

  _endGame() {
    this.game.state = 'GAME_OVER';
    this.cameraCtrl.setState('pre-shot');

    const isNew = recordResult(this.data, this.game.mode, this.game.goals);
    save(this.data);

    setTimeout(() => {
      this.audio.playGameOver();
      this.ui.showResult(this.game, isNew);
    }, 600);
  }

  // ── App-Level Actions (called from UI) ────────────────────────────

  startGame(mode, difficulty) {
    this.game.startNew(mode, difficulty);
    this.ball.reset();
    this.goalkeeper.reset();
    this.goalkeeper.setDifficulty(difficulty);

    // Target mode: show targets
    if (mode === 'target') {
      this.goal.showTargets(true);
    } else {
      this.goal.showTargets(false);
    }

    this.cameraCtrl.setState('pre-shot');

    this.ui.showScreen('hud');
    this.ui.updateHUD(this.game);
    this.ui.showInstruction();
    this.ui.hidePowerBar();
    this.ui.hideShotResult();
  }

  restartGame() {
    this.startGame(this.game.mode, this.game.difficulty);
  }

  pauseGame() {
    this.game.pause();
    this.ui.showScreen('pause-menu');
  }

  resumeGame() {
    this.game.resume();
    this.ui.showScreen('hud');
    this.ui.updateHUD(this.game);
  }

  goToMenu() {
    this.game.state = 'MENU';
    this.ball.reset();
    this.goalkeeper.reset();
    this.goal.showTargets(false);
    this.goal.resetTargets();
    this.cameraCtrl.setState('menu');

    this.ui.updateMenuStats(this.data);
    this.ui.showScreen('main-menu');

    this.audio.init();
    this.audio.startMenuMusic();
  }

  updateScoresScreen() {
    this.ui.updateScores(this.data);
  }

  updateSettingsScreen() {
    this.ui.updateSettings(this.data.settings);
  }

  toggleSetting(key) {
    const s = this.data.settings;
    if (key === 'sound') {
      s.sound = !s.sound;
      this.audio.setEnabled(s.sound);
    } else if (key === 'quality') {
      const q = ['auto', 'high', 'low'];
      s.quality = q[(q.indexOf(s.quality) + 1) % q.length];
    } else if (key === 'difficulty') {
      const d = ['easy', 'medium', 'hard'];
      s.difficulty = d[(d.indexOf(s.difficulty) + 1) % d.length];
    }
    save(this.data);
    this.ui.updateSettings(s);
  }

  saveSettings() {
    save(this.data);
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────
const app = new PenaltyGame();

app.init().catch(err => {
  console.error('Oyun başlatılamadı:', err);
  const txt = document.getElementById('loading-text');
  if (txt) txt.textContent = 'Hata: ' + (err.message || err);
});
