// scripts/scene.js — Three.js renderer, scene, camera setup
import * as THREE from 'three';

export class SceneManager {
  constructor(canvas) {
    this.canvas   = canvas;
    this.scene    = new THREE.Scene();
    this.camera   = null;
    this.renderer = null;
  }

  /** Returns { isLowQuality: boolean } */
  init(qualitySetting = 'auto') {
    const isMobile   = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const isLow      = qualitySetting === 'low' || (qualitySetting === 'auto' && isMobile);

    // ── Renderer ────────────────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({
      canvas:          this.canvas,
      antialias:       !isLow,
      powerPreference: 'high-performance',
      alpha:           false
    });
    this.renderer.setPixelRatio(
      isLow ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.shadowMap.enabled  = !isLow;
    this.renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.outputColorSpace   = THREE.SRGBColorSpace;

    // ── Scene background / fog ──────────────────────────────────────
    this.scene.background = new THREE.Color(0x040408);
    this.scene.fog        = new THREE.FogExp2(0x040408, 0.018);

    // ── Camera ──────────────────────────────────────────────────────
    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 500);
    this._setCameraPreShot();

    this.resize();
    return { isLow };
  }

  _setCameraPreShot() {
    this.camera.position.set(0, 1.5, 4.2);
    this.camera.lookAt(0, 1.1, -11);
  }

  resize() {
    const w = this.canvas.clientWidth  || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;

    // Only update if size actually changed
    if (this.renderer.domElement.width  === w &&
        this.renderer.domElement.height === h) return;

    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }
}
