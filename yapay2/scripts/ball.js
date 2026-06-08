// scripts/ball.js — Football ball with physics, spin, procedural texture
import * as THREE from 'three';

const BALL_RADIUS = 0.22;
const GRAVITY     = -9.8;
const GROUND_Y    = BALL_RADIUS;

export class Ball {
  constructor(scene) {
    this._vel   = new THREE.Vector3();
    this._spin  = new THREE.Vector3();
    this._alive = false;

    this._group = new THREE.Group();
    this._group.name = 'ball';

    this._buildBall();
    this.reset();

    scene.add(this._group);
  }

  get position() { return this._group.position; }

  // ── Build ────────────────────────────────────────────────────────
  _buildBall() {
    const tex = this._buildTexture();

    const mat  = new THREE.MeshPhongMaterial({
      map:       tex,
      shininess: 60,
      specular:  new THREE.Color(0x333333),
    });
    this._mesh = new THREE.Mesh(
      new THREE.SphereGeometry(BALL_RADIUS, 24, 16),
      mat
    );
    this._mesh.castShadow    = true;
    this._mesh.receiveShadow = false;

    this._group.add(this._mesh);

    // Shadow blob on ground
    const blobGeo = new THREE.CircleGeometry(0.22, 12);
    const blobMat = new THREE.MeshBasicMaterial({
      color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false
    });
    this._shadow = new THREE.Mesh(blobGeo, blobMat);
    this._shadow.rotation.x = -Math.PI / 2;
    this._shadow.position.y = -BALL_RADIUS + 0.005;
    this._group.add(this._shadow);
  }

  /** Procedural black/white football texture */
  _buildTexture() {
    const SIZE = 256;
    const cv   = document.createElement('canvas');
    cv.width = cv.height = SIZE;
    const ctx  = cv.getContext('2d');

    // White base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Draw 5 black pentagons in UV space
    const pentagons = [
      [0.5,  0.5],   // centre
      [0.5,  0.04],  // top
      [0.04, 0.35],  // upper-left
      [0.96, 0.35],  // upper-right
      [0.2,  0.88],  // lower-left
      [0.8,  0.88],  // lower-right
    ];

    ctx.fillStyle = '#111111';
    pentagons.forEach(([cx, cy]) => {
      ctx.beginPath();
      const r = SIZE * 0.12;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const x = cx * SIZE + Math.cos(a) * r;
        const y = cy * SIZE + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    });

    const tex = new THREE.CanvasTexture(cv);
    return tex;
  }

  // ── API ──────────────────────────────────────────────────────────

  reset() {
    this._group.position.set(0, GROUND_Y, 0);
    this._group.rotation.set(0, 0, 0);
    this._vel.set(0, 0, 0);
    this._spin.set(0, 0, 0);
    this._alive = false;
    this._bounced = false;
    this._mesh.visible   = true;
    this._shadow.visible = true;
    // Reset shadow scale
    this._shadow.scale.set(1, 1, 1);
  }

  shoot(vx, vy, vz, spinX = 0) {
    this._vel.set(vx, vy, vz);
    this._spin.set(spinX, 0, 0);
    this._alive = true;
    this._bounced = false;
  }

  update(dt) {
    if (!this._alive) return;

    // Gravity
    this._vel.y += GRAVITY * dt;

    // Magnus spin effect (horizontal curve)
    this._vel.x += this._spin.x * 0.5 * dt;

    // Move
    this._group.position.addScaledVector(this._vel, dt);

    // Rotate ball visually based on velocity
    const speed = this._vel.length();
    const axis  = new THREE.Vector3(-this._vel.z, 0, this._vel.x).normalize();
    this._mesh.rotateOnWorldAxis(axis, speed * dt / BALL_RADIUS);

    // Ground bounce
    if (this._group.position.y < GROUND_Y && !this._bounced) {
      this._group.position.y = GROUND_Y;
      this._vel.y = Math.abs(this._vel.y) * 0.45;
      this._vel.x *= 0.8;
      this._vel.z *= 0.85;
      this._bounced = true;
    }

    // Update blob shadow
    const h = this._group.position.y - GROUND_Y;
    const s = Math.max(0.3, 1 - h * 0.18);
    this._shadow.scale.set(s, s, s);
    this._shadow.material.opacity = Math.max(0.05, 0.35 * s);
    // Pin shadow to ground
    this._shadow.position.y = -this._group.position.y + 0.005;
  }

  updateSpin(dt) {
    // Handled in update()
  }

  bouncePost() {
    this._vel.x = -this._vel.x * 0.6;
    this._vel.z =  this._vel.z * 0.3;
    this._vel.y = Math.abs(this._vel.y * 0.5) + 1;
  }

  bounceGround() {
    if (this._group.position.y < GROUND_Y) {
      this._group.position.y = GROUND_Y;
      this._vel.y = Math.abs(this._vel.y) * 0.4;
    }
  }

  hide() {
    this._mesh.visible   = false;
    this._shadow.visible = false;
  }
}
