// scripts/input.js — Unified pointer (mouse + touch) input manager
export class InputManager {
  constructor(element) {
    this._el     = element;
    this._active = false;
    this._start  = { x: 0, y: 0, time: 0 };
    this._cur    = { x: 0, y: 0 };

    // Callbacks set by owner
    this.onDragStart = null;
    this.onDragMove  = null;
    this.onDragEnd   = null;

    this._bind();
  }

  _bind() {
    const el = this._el;

    // Mouse
    el.addEventListener('mousedown',  e => this._start_drag(e.clientX, e.clientY));
    el.addEventListener('mousemove',  e => this._move_drag(e.clientX,  e.clientY));
    el.addEventListener('mouseup',    e => this._end_drag(e.clientX,   e.clientY));
    el.addEventListener('mouseleave', e => { if (this._active) this._end_drag(e.clientX, e.clientY); });

    // Touch
    el.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.touches[0];
      this._start_drag(t.clientX, t.clientY);
    }, { passive: false });

    el.addEventListener('touchmove', e => {
      e.preventDefault();
      const t = e.touches[0];
      this._move_drag(t.clientX, t.clientY);
    }, { passive: false });

    el.addEventListener('touchend', e => {
      e.preventDefault();
      const t = e.changedTouches[0];
      this._end_drag(t.clientX, t.clientY);
    }, { passive: false });
  }

  _start_drag(x, y) {
    this._active     = true;
    this._start.x    = x;
    this._start.y    = y;
    this._start.time = performance.now();
    this._cur.x      = x;
    this._cur.y      = y;
    if (this.onDragStart) this.onDragStart(x, y);
  }

  _move_drag(x, y) {
    if (!this._active) return;
    this._cur.x = x;
    this._cur.y = y;
    const dx = x - this._start.x;
    const dy = y - this._start.y;
    if (this.onDragMove) this.onDragMove(x, y, dx, dy);
  }

  _end_drag(x, y) {
    if (!this._active) return;
    this._active = false;

    const dx   = x - this._start.x;
    const dy   = y - this._start.y;
    const dt   = Math.max(1, performance.now() - this._start.time);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = dist / dt;  // px/ms

    // Normalised power 0..1
    const power = Math.min(1, dist / 220);

    if (this.onDragEnd) this.onDragEnd(dx, dy, power, speed);
  }

  /** Returns current drag power 0..1 */
  getDragPower() {
    const dx   = this._cur.x - this._start.x;
    const dy   = this._cur.y - this._start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.min(1, dist / 220);
  }

  /** Returns current drag delta {dx, dy} */
  getDragDelta() {
    return {
      dx: this._cur.x - this._start.x,
      dy: this._cur.y - this._start.y,
    };
  }
}
