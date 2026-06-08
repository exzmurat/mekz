// scripts/goalkeeper.js — Humanoid goalkeeper with AI
import * as THREE from 'three';
import { GOAL } from './goal.js';

const GK_Z = GOAL.Z + 0.55;   // stands slightly in front of goal line
const GK_Y_BASE = 0;
const MAX_JUMP_X = 3.2;
const MAX_JUMP_Y = 1.9;

// Difficulty settings: { reactionMs, saveRadius, randomChance }
const DIFF = {
  easy: { reactionMs: 700, saveRadius: 1.05, randomChance: 0.85 },
  medium: { reactionMs: 380, saveRadius: 1.20, randomChance: 0.50 },
  hard: { reactionMs: 140, saveRadius: 1.40, randomChance: 0.20 },
};

export class Goalkeeper {
  constructor(scene) {
  this._group = new THREE.Group();
  this._group.name = 'goalkeeper';

  this._diff = DIFF.medium;
  this._jumpTarget = new THREE.Vector3(0, 0, GK_Z);
  this._jumpStart = new THREE.Vector3(0, 0, GK_Z);
  this._jumpT = 1;
  this._jumpDur = 0.45;
  this._reacted = false;

  this._build();
  this._group.add(this._root);

  this._root.scale.set(1.15, 1.15, 1.15);
  this._group.position.set(0, GK_Y_BASE, GK_Z);

  this.reset();

  scene.add(this._group);
}

  // ── Build ────────────────────────────────────────────────────────

  _build() {
    // Materials
    const jersey = new THREE.MeshPhongMaterial({ color: 0x00d4ff }); // orange
    const shorts = new THREE.MeshPhongMaterial({ color: 0x222266 });
    const skin = new THREE.MeshPhongMaterial({ color: 0xffcc88 });
    const gloves = new THREE.MeshPhongMaterial({ color: 0xffee44 }); // yellow gloves
    const boots = new THREE.MeshPhongMaterial({ color: 0x111111 });

    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

    this._root = new THREE.Group();

    // Torso
    const torso = new THREE.Mesh(box(0.58, 0.70, 0.28), jersey);
    torso.position.y = 1.05;
    torso.castShadow = true;
    this._root.add(torso);

    // Head
  const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.18, 10, 8),
  skin
);
    head.position.y = 1.65;
    head.castShadow = true;
    this._root.add(head);

    // Hair
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.185, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshPhongMaterial({ color: 0x222200 })
    );
    hair.position.y = 1.68;
    this._root.add(hair);

    // Left arm
    this._lArm = new THREE.Group();
    const lUpper = new THREE.Mesh(box(0.18, 0.42, 0.18), jersey);
    lUpper.position.y = -0.21;
    this._lArm.add(lUpper);
    const lLower = new THREE.Mesh(box(0.14, 0.36, 0.14), skin);
    lLower.position.y = -0.55;
    this._lArm.add(lLower);
    const lGlove = new THREE.Mesh(
      box(0.28, 0.28, 0.28),
      gloves
    );
    lGlove.position.y = -0.78;
    this._lArm.add(lGlove);
    this._lArm.position.set(-0.50, 1.32, 0);
    this._root.add(this._lArm);

    // Right arm
    this._rArm = this._lArm.clone();
    this._rArm.position.set(0.50, 1.32, 0);
    this._root.add(this._rArm);

    // Pelvis
    const pelvis = new THREE.Mesh(box(0.52, 0.22, 0.24), shorts);
    pelvis.position.y = 0.65;
    this._root.add(pelvis);

    // Left leg
    this._lLeg = new THREE.Group();
    const lThigh = new THREE.Mesh(box(0.20, 0.46, 0.22), shorts);
    lThigh.position.y = -0.23;
    this._lLeg.add(lThigh);
    const lShin = new THREE.Mesh(box(0.17, 0.44, 0.18), new THREE.MeshPhongMaterial({ color: 0xffffff }));
    lShin.position.y = -0.58;
    this._lLeg.add(lShin);
    const lBoot = new THREE.Mesh(box(0.18, 0.14, 0.28), boots);
    lBoot.position.set(0, -0.84, 0.05);
    this._lLeg.add(lBoot);
    this._lLeg.position.set(-0.18, 0.62, 0);
    this._root.add(this._lLeg);

    // Right leg
    this._rLeg = this._lLeg.clone();
    this._rLeg.position.set(0.18, 0.62, 0);
    this._root.add(this._rLeg);

    // Number on jersey
    // (skipped — too complex for canvas texture without canvas2d)

    this._root.scale.set(1.15, 1.15, 1.15);
    this._group.position.set(0, GK_Y_BASE, GK_Z);
  }

  // ── API ──────────────────────────────────────────────────────────

  setDifficulty(diff) {
    this._diff = DIFF[diff] || DIFF.medium;
  }

  reset() {
    this._group.position.set(0, GK_Y_BASE, GK_Z);
    this._root.rotation.set(0, 0, 0);
    this._lArm.rotation.set(-0.2, 0, -0.3);
    this._rArm.rotation.set(-0.2, 0, 0.3);
    this._lLeg.rotation.set(0, 0, 0);
    this._rLeg.rotation.set(0, 0, 0);
    this._jumpTarget.set(0, GK_Y_BASE, GK_Z);
    this._jumpStart.set(0, GK_Y_BASE, GK_Z);
    this._jumpT = 1;
    this._reacted = false;
  }

  /**
   * Called when ball is shot. After reactionMs, goalkeeper jumps.
   * @param {number} shotDx - horizontal swipe delta (px)
   * @param {number} shotDy - vertical swipe delta (px)
   * @param {string} difficulty
   * @param {string[]} history - recent shot results for habit analysis
   */
  react(shotDx, shotDy, difficulty, history) {
    this.setDifficulty(difficulty);
    const d = this._diff;
    this._reacted = false;

    // Delay reaction
    setTimeout(() => {
      if (this._reacted) return;   // already resolved
      this._reacted = true;
      this._decideJump(shotDx, shotDy, history, d);
    }, d.reactionMs);
  }

  _decideJump(shotDx, shotDy, history, d) {
    let tX, tY;

    if (Math.random() < d.randomChance) {
      // Fully random
      tX = (Math.random() * 2 - 1) * MAX_JUMP_X;
      tY = Math.random() * MAX_JUMP_Y;
    } else {
      // Predict from shot + habit
      const habBias = this._habitBias(history);
      tX = (shotDx / Math.max(window.innerWidth, 1)) * MAX_JUMP_X * 2.2 + habBias * 0.6;
      tY = Math.max(0, (-shotDy / Math.max(window.innerHeight, 1)) * MAX_JUMP_Y * 1.8 + 0.5);
      tX = Math.max(-MAX_JUMP_X, Math.min(MAX_JUMP_X, tX));
      tY = Math.max(0, Math.min(MAX_JUMP_Y, tY));
    }

    this._startJump(tX, tY);
  }

  _habitBias(history) {
    // Count recent left vs right tendencies
    let left = 0, right = 0;
    (history || []).forEach(r => {
      if (r === 'goal') return;   // we stored strings
    });
    return 0;  // simplified — full implementation can use shot vectors
  }

  _startJump(targetX, targetY) {
    this._jumpStart.copy(this._group.position);
    this._jumpTarget.set(targetX, GK_Y_BASE + targetY, GK_Z);
    this._jumpT = 0;

    // Rotate arms up
    const spread = targetX > 0 ? -0.3 : 0.3;
    this._lArm.rotation.z = -1.0 + spread;
    this._rArm.rotation.z = 1.0 + spread;
    this._lArm.rotation.x = -0.8;
    this._rArm.rotation.x = -0.8;
  }

  /**
   * Called per frame. Returns true once jump tween is complete.
   */
  update(dt) {
    if (this._jumpT >= 1) return;

    this._jumpT = Math.min(1, this._jumpT + dt / this._jumpDur);
    const t = this._easeOut(this._jumpT);

    this._group.position.lerpVectors(this._jumpStart, this._jumpTarget, t);

    // Tilt body in jump direction
    this._root.rotation.z = -Math.sign(this._jumpTarget.x) * t * 0.4;
    this._lLeg.rotation.x = t * 0.5;
    this._rLeg.rotation.x = -t * 0.3;
  }

  _easeOut(t) { return 1 - (1 - t) * (1 - t); }

  /**
   * Returns true if goalkeeper's body overlaps ball position.
   */
  checkSave(ballPos) {
    const gkPos = this._group.position;
    const dx = Math.abs(ballPos.x - gkPos.x);
    const dy = Math.abs(ballPos.y - (gkPos.y + 0.9));  // gk centre height
    const r = this._diff.saveRadius;
    return dx < r * 0.85 && dy < r * 0.9;
  }
}
