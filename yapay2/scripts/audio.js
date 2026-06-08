// scripts/audio.js — Web Audio API procedural sound engine
export class AudioManager {
  constructor() {
    this._ctx     = null;
    this._enabled = true;
    this._music   = null;   // gain node for ambient music
  }

  /** Must be called after a user gesture */
  init() {
    if (this._ctx) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this._ctx = new Ctx();
    } catch (_) { /* not supported */ }
  }

  setEnabled(v) {
    this._enabled = !!v;
    if (this._music) this._music.gain.value = v ? 0.18 : 0;
  }

  // ── Internal helpers ──────────────────────────────────────────────

  _ctx_ready() { return this._enabled && this._ctx && this._ctx.state !== 'closed'; }

  _resumeCtx() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }
  }

  _osc(freq, type = 'sine', startT, duration, gainPeak = 0.5, dest = null) {
    if (!this._ctx_ready()) return;
    const ctx = this._ctx;
    const t   = startT || ctx.currentTime;
    const out = dest || ctx.destination;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.connect(gain);
    gain.connect(out);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(gainPeak, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  _noise(startT, duration, gainPeak = 0.4, filterFreq = 4000, dest = null) {
    if (!this._ctx_ready()) return;
    const ctx  = this._ctx;
    const t    = startT || ctx.currentTime;
    const out  = dest || ctx.destination;
    const sr   = ctx.sampleRate;
    const len  = Math.ceil(sr * duration);
    const buf  = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    const src    = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain   = ctx.createGain();
    src.buffer = buf;
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    gain.gain.setValueAtTime(gainPeak, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.start(t);
    src.stop(t + duration);
  }

  // ── Sound Effects ─────────────────────────────────────────────────

  playShot() {
    if (!this._ctx_ready()) return;
    this._resumeCtx();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    // Kick-like thud
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.start(t); osc.stop(t + 0.2);

    // Air whoosh
    this._noise(t + 0.05, 0.25, 0.25, 3000);
  }

  playNet() {
    if (!this._ctx_ready()) return;
    this._resumeCtx();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    this._noise(t, 0.2, 0.55, 2500);
    // Low thud
    this._osc(80, 'sine', t + 0.08, 0.3, 0.4);
  }

  playPost() {
    if (!this._ctx_ready()) return;
    this._resumeCtx();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    // Metallic ring
    [880, 1320, 660].forEach((freq, i) => {
      this._osc(freq, 'square', t + i * 0.02, 0.35 - i * 0.05, 0.25 - i * 0.06);
    });
  }

  playSave() {
    if (!this._ctx_ready()) return;
    this._resumeCtx();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    this._osc(300, 'sawtooth', t,      0.15, 0.4);
    this._osc(200, 'sawtooth', t+0.12, 0.2,  0.3);
    this._noise(t, 0.18, 0.3, 6000);
  }

  playMiss() {
    if (!this._ctx_ready()) return;
    this._resumeCtx();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    this._osc(400, 'sine', t,      0.25, 0.2);
    this._osc(200, 'sine', t+0.15, 0.35, 0.15);
    this._noise(t, 0.3, 0.15, 2000);
  }

  playGoal() {
    if (!this._ctx_ready()) return;
    this._resumeCtx();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    // Crowd noise bursts
    for (let i = 0; i < 6; i++) {
      this._noise(t + i * 0.12, 0.2, 0.35, 1200 + i * 300);
    }

    // Victory fanfare
    const fanfare = [392, 523.25, 659.25, 784];
    fanfare.forEach((freq, i) => {
      this._osc(freq, 'sine', t + i * 0.1, 0.35, 0.22);
    });
  }

  playGameOver() {
    if (!this._ctx_ready()) return;
    this._resumeCtx();
    const ctx = this._ctx;
    const t   = ctx.currentTime;

    [392, 349.23, 311.13, 261.63].forEach((freq, i) => {
      this._osc(freq, 'sine', t + i * 0.18, 0.4, 0.2);
    });
  }

  // ── Ambient Menu Music ────────────────────────────────────────────

  startMenuMusic() {
    if (!this._ctx_ready()) return;
    this.stopMenuMusic();
    try {
      const ctx  = this._ctx;
      const gain = ctx.createGain();
      gain.gain.value = 0.18;
      gain.connect(ctx.destination);
      this._music = gain;

      const now   = ctx.currentTime;
      const scale = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];

      let t = now;
      // Simple melodic loop × 8 bars
      for (let repeat = 0; repeat < 8; repeat++) {
        const bar = scale.map((_, i) => scale[(i * 3 + repeat * 2) % scale.length]);
        bar.forEach((freq, i) => {
          this._osc(freq,       'sine',   t + i * 0.45, 0.5, 0.14, gain);
          this._osc(freq * 1.5, 'sine',   t + i * 0.45, 0.5, 0.06, gain);
          this._osc(freq * 2,   'triangle', t + i * 0.45, 0.3, 0.03, gain);
        });
        t += bar.length * 0.45;
      }
    } catch (_) { /* audio error — ignore */ }
  }

  stopMenuMusic() {
    if (!this._music) return;
    try {
      this._music.gain.setTargetAtTime(0, this._ctx.currentTime, 0.3);
      const g = this._music;
      setTimeout(() => { try { g.disconnect(); } catch (_) {} }, 600);
    } catch (_) {}
    this._music = null;
  }
}
