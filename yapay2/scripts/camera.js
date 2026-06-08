// scripts/camera.js — Camera state controller with smooth transitions
import * as THREE from 'three';

const STATES = {
  'menu':       { pos: [0, 2.2, 6.5],  look: [0, 1.2, -8]  },
  'pre-shot':   { pos: [0, 1.5, 4.2],  look: [0, 1.1, -11] },
  'celebrate':  { pos: [0, 3.0, -6],   look: [0, 1.2, -11] },
};

const LERP_SPEED  = 3.5;   // positional lerp speed (s⁻¹)
const LOOK_SPEED  = 4.0;

export class CameraController {
  constructor(camera) {
    this._cam      = camera;
    this._state    = 'pre-shot';

    // Follow mode
    this._followTarget = null;   // THREE.Vector3 reference
    this._followOffset  = new THREE.Vector3(0, 1.8, 4.5);

    // Celebration orbit
    this._orbitAngle = 0;

    // Working vectors
    this._targetPos  = new THREE.Vector3().copy(camera.position);
    this._targetLook = new THREE.Vector3(0, 1.1, -11);
  }

  setState(state, ball = null) {
    this._state        = state;
    this._followTarget = ball;

    if (STATES[state]) {
      const s = STATES[state];
      this._targetPos.set(...s.pos);
      this._targetLook.set(...s.look);
    }
  }

  update(dt, gameState, ballPos) {
    const cam = this._cam;

    if (this._state === 'follow' && ballPos) {
      // Camera follows ball from behind/above
      const tPos = new THREE.Vector3(
        ballPos.x * 0.35,
        Math.max(1.5, ballPos.y * 0.5 + 1.5),
        ballPos.z * 0.1 + 4.2
      );
      cam.position.lerp(tPos, Math.min(1, dt * LERP_SPEED * 1.5));

      // Look slightly ahead of ball
      const tLook = new THREE.Vector3(
        ballPos.x * 0.6,
        Math.max(0, ballPos.y * 0.8),
        ballPos.z
      );
      this._targetLook.lerp(tLook, Math.min(1, dt * LOOK_SPEED * 2));
      cam.lookAt(this._targetLook);
      return;
    }

    if (this._state === 'celebrate') {
      // Slow orbit around goal
      this._orbitAngle += dt * 0.5;
      const r = 7;
      cam.position.set(
        Math.sin(this._orbitAngle) * r,
        2.5 + Math.sin(this._orbitAngle * 0.5) * 0.5,
        -11 + Math.cos(this._orbitAngle) * r
      );
      cam.lookAt(0, 1.2, -11);
      return;
    }

    // Default: lerp to target state
    cam.position.lerp(this._targetPos, Math.min(1, dt * LERP_SPEED));
    this._targetLook.lerp(
      new THREE.Vector3(...(STATES[this._state]?.look || [0, 1.1, -11])),
      Math.min(1, dt * LOOK_SPEED)
    );
    cam.lookAt(this._targetLook);
  }
}
