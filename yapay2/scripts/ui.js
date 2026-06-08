// scripts/ui.js — DOM UI manager
export class UIManager {
  constructor(app) {
    this._app = app;
    this._currentScreen = 'loading-screen';
    this._shotResultTimer = null;

    this._bind();
  }

  // ── Screen Management ─────────────────────────────────────────────

  showScreen(id) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });

    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      el.classList.add('active');
    }
    this._currentScreen = id;
  }

  // ── Menu Stats ────────────────────────────────────────────────────

  updateMenuStats(data) {
    const el = document.getElementById('menu-stats');
    if (!el) return;
    el.innerHTML = `
      <div class="stat-chip">🏆 Rekor: <b>${data.highScore}</b></div>
      <div class="stat-chip">⚽ Toplam Gol: <b>${data.totalGoals}</b></div>
      <div class="stat-chip">🎮 Maç: <b>${data.totalMatches}</b></div>
    `;
  }

  updateScores(data) {
    const el = document.getElementById('scores-list');
    if (!el) return;
    el.innerHTML = `
      <div class="score-row">
        <span class="score-row-label">🏆 Tüm Zamanlar Rekoru</span>
        <span class="score-row-val">${data.highScore}</span>
      </div>
      <div class="score-row">
        <span class="score-row-label">⚽ Klasik Mod En İyi</span>
        <span class="score-row-val">${data.classicBest}</span>
      </div>
      <div class="score-row">
        <span class="score-row-label">♾ Sonsuz Mod En İyi</span>
        <span class="score-row-val">${data.endlessBest}</span>
      </div>
      <div class="score-row">
        <span class="score-row-label">🎯 Hedef Mod En İyi</span>
        <span class="score-row-val">${data.targetBest}</span>
      </div>
      <div class="score-row">
        <span class="score-row-label">⚽ Toplam Gol</span>
        <span class="score-row-val">${data.totalGoals}</span>
      </div>
      <div class="score-row">
        <span class="score-row-label">🎮 Toplam Maç</span>
        <span class="score-row-val">${data.totalMatches}</span>
      </div>
    `;
  }

  updateSettings(settings) {
    const togSound = document.getElementById('tog-sound');
    const togQual  = document.getElementById('tog-quality');
    const togDiff  = document.getElementById('tog-diff');
    if (togSound) {
      togSound.dataset.state = settings.sound ? 'on' : 'off';
      togSound.textContent   = settings.sound ? 'AÇIK' : 'KAPALI';
    }
    if (togQual) {
      togQual.dataset.state = settings.quality;
      togQual.textContent   = { auto: 'OTO', high: 'YÜKSEK', low: 'DÜŞÜK' }[settings.quality] || 'OTO';
    }
    if (togDiff) {
      togDiff.dataset.state = settings.difficulty;
      togDiff.textContent   = { easy: 'KOLAY', medium: 'ORTA', hard: 'ZOR' }[settings.difficulty] || 'ORTA';
    }
  }

  // ── HUD ───────────────────────────────────────────────────────────

  updateHUD(game) {
    const score    = document.getElementById('hud-score');
    const accuracy = document.getElementById('hud-accuracy');
    const modeLabel = document.getElementById('hud-mode-label');
    const badge    = document.getElementById('hud-diff-badge');
    const shots    = document.getElementById('hud-shots');

    if (score)    score.textContent    = game.goals;
    if (accuracy) accuracy.textContent = game.accuracy !== null ? game.accuracy + '%' : '–';

    if (modeLabel) {
      const labels = { classic: 'KLASİK', endless: 'SONSUZ', target: 'HEDEF' };
      modeLabel.textContent = labels[game.mode] || 'KLASİK';
    }

    if (badge) {
      const labels = { easy: 'KOLAY', medium: 'ORTA', hard: 'ZOR' };
      badge.textContent = labels[game.difficulty] || 'ORTA';
    }

    // Shot indicators (classic mode)
    if (shots) {
      if (game.mode === 'classic') {
        shots.innerHTML = '';
        for (let i = 0; i < game.maxShots; i++) {
          const dot = document.createElement('div');
          dot.className = 'shot-dot';
          if (i < game.shots) {
            // past shot
            const h = game.shotHistory[i];
            dot.classList.add(h === 'goal' ? 'goal' : h === 'save' ? 'save' : 'miss');
          } else if (i === game.shots) {
            dot.classList.add('active');
          }
          shots.appendChild(dot);
        }
      } else if (game.mode === 'endless') {
        shots.innerHTML = `<span style="font-family:Orbitron;font-size:18px;color:var(--primary)">${game.goals}</span>`;
      } else {
        const remaining = game.targets.filter(t => !t.hit).length;
        shots.innerHTML = `<span style="font-size:13px;color:var(--text-muted)">Kalan: <b style="color:var(--primary)">${remaining}</b></span>`;
      }
    }
  }

  // ── Instruction / Power ───────────────────────────────────────────

  showInstruction() {
    const el = document.getElementById('hud-instruction');
    if (el) el.classList.remove('hidden');
  }

  hideInstruction() {
    const el = document.getElementById('hud-instruction');
    if (el) el.classList.add('hidden');
  }

  setPower(power) {
    const wrap = document.getElementById('power-wrap');
    const fill = document.getElementById('power-fill');
    if (wrap) wrap.classList.remove('hidden');
    if (fill) {
      fill.style.width = (power * 100) + '%';
      // Colour shifts from green → orange → red
      const hue = Math.round(120 - power * 120);
      fill.style.background = `hsl(${hue},100%,50%)`;
    }
  }

  hidePowerBar() {
    const wrap = document.getElementById('power-wrap');
    if (wrap) wrap.classList.add('hidden');
  }

  showAim(screenX, screenY) {
    const ring = document.getElementById('aim-ring');
    if (!ring) return;
    ring.classList.remove('hidden');
    ring.style.left = screenX + 'px';
    ring.style.top  = screenY + 'px';
  }

  hideAim() {
    const ring = document.getElementById('aim-ring');
    if (ring) ring.classList.add('hidden');
  }

  // ── Shot Result ───────────────────────────────────────────────────

  showShotResult(text, type) {
    if (this._shotResultTimer) clearTimeout(this._shotResultTimer);

    const overlay = document.getElementById('shot-overlay');
    const textEl  = document.getElementById('shot-text');
    if (!overlay || !textEl) return;

    textEl.textContent = text;
    textEl.className   = 'shot-text ' + type;
    overlay.classList.remove('hidden');

    this._shotResultTimer = setTimeout(() => this.hideShotResult(), 1800);
  }

  hideShotResult() {
    const overlay = document.getElementById('shot-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  // ── Result Screen ─────────────────────────────────────────────────

  showResult(game, isNewRecord) {
    const icons   = { classic: '🏆', endless: '♾', target: '🎯' };
    const rIcon   = document.getElementById('result-icon');
    const rTitle  = document.getElementById('result-title');
    const rGoals  = document.getElementById('res-goals');
    const rSaves  = document.getElementById('res-saves');
    const rMisses = document.getElementById('res-misses');
    const rAcc    = document.getElementById('res-acc');
    const rNew    = document.getElementById('new-record');

    if (rIcon)   rIcon.textContent  = icons[game.mode] || '🏆';
    if (rTitle)  rTitle.textContent = game.goals >= 3 ? 'HARIKA! 🔥' : game.goals >= 1 ? 'OYUN BİTTİ' : 'BU SEFER OLMADI';
    if (rGoals)  rGoals.textContent  = game.goals;
    if (rSaves)  rSaves.textContent  = game.saves;
    if (rMisses) rMisses.textContent = game.misses + game.posts;
    if (rAcc)    rAcc.textContent    = game.accuracy !== null ? game.accuracy + '%' : '–';
    if (rNew)    rNew.classList.toggle('hidden', !isNewRecord);

    this.showScreen('result-screen');
  }

  // ── Button Binding ────────────────────────────────────────────────

  _bind() {
    const app = this._app;

    // ── Main Menu ──
    this._on('btn-play',    () => this.showScreen('mode-select'));
    this._on('btn-scores',  () => {
      app.updateScoresScreen();
      this.showScreen('scores-screen');
    });
    this._on('btn-settings', () => {
      app.updateSettingsScreen();
      this.showScreen('settings-screen');
    });

    // ── Mode Select ──
    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        app.selectedMode = btn.dataset.mode;
        this.showScreen('difficulty-select');
      });
    });
    this._on('mode-back', () => this.showScreen('main-menu'));

    // ── Difficulty Select ──
    document.querySelectorAll('[data-diff]').forEach(btn => {
      btn.addEventListener('click', () => {
        app.startGame(app.selectedMode, btn.dataset.diff);
      });
    });
    this._on('diff-back', () => this.showScreen('mode-select'));

    // ── HUD ──
    this._on('hud-pause-btn', () => app.pauseGame());

    // ── Pause Menu ──
    this._on('btn-resume',   () => app.resumeGame());
    this._on('btn-restart',  () => app.restartGame());
    this._on('btn-to-menu',  () => app.goToMenu());

    // ── Result Screen ──
    this._on('btn-play-again', () => app.restartGame());
    this._on('btn-res-menu',   () => app.goToMenu());

    // ── Scores ──
    this._on('scores-back', () => this.showScreen('main-menu'));

    // ── Settings ──
    this._on('settings-back', () => {
      app.saveSettings();
      this.showScreen('main-menu');
    });
    this._on('tog-sound', () => app.toggleSetting('sound'));
    this._on('tog-quality', () => app.toggleSetting('quality'));
    this._on('tog-diff',  () => app.toggleSetting('difficulty'));
  }

  _on(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }
}
