// scripts/goal.js — Goal posts, crossbar, net + collision data
import * as THREE from 'three';

// Goal dimensions (metres / game units)
export const GOAL = {
  HALF_W:  3.66,
  HEIGHT:  2.44,
  DEPTH:   2.2,
  POST_R:  0.06,
  Z:      -11,       // goal line Z
  NET_Z:  -13.2,     // back of net Z
};

export class Goal {
  constructor(scene) {
    this._group = new THREE.Group();
    this._group.name = 'goal';

    this._buildPosts();
    this._buildNet();
    this._buildTargets();      // hidden target meshes for target mode

    scene.add(this._group);

    this.targetMeshes = this._targetMeshes;
  }

  // ── Visible targets for target mode ──────────────────────────────
  _buildTargets() {
    this._targetMeshes = [];
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffcc00, transparent: true, opacity: 0.7
    });
    const offsets = [
      { nx: -0.7, ny: 0.8 }, { nx: 0.0, ny: 0.8 }, { nx: 0.7, ny: 0.8 },
      { nx: -0.7, ny: 0.3 }, { nx: 0.7, ny: 0.3 }, { nx: 0.0, ny: 0.3 },
    ];
    offsets.forEach((o, i) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.35, 0.52, 12),
        mat.clone()
      );
      ring.position.set(
        o.nx * GOAL.HALF_W * 0.85,
        GOAL.HEIGHT * o.ny,
        GOAL.Z + 0.05
      );
      ring.visible = false;
      ring.userData = { nx: o.nx, ny: o.ny, idx: i };
      this._group.add(ring);
      this._targetMeshes.push(ring);
    });
  }

  showTargets(show) {
    this._targetMeshes.forEach(t => { t.visible = show; });
  }

  markTargetHit(idx) {
    const t = this._targetMeshes[idx];
    if (t) {
      t.material.color.setHex(0x00ff88);
      t.material.opacity = 0.5;
    }
  }

  resetTargets() {
    this._targetMeshes.forEach(t => {
      t.material.color.setHex(0xffcc00);
      t.material.opacity = 0.7;
      t.visible = false;
    });
  }

  // ── Posts & Crossbar ─────────────────────────────────────────────
  _buildPosts() {
    const mat = new THREE.MeshPhongMaterial({
      color: 0xffffff, shininess: 90, specular: 0x888888
    });

    const H   = GOAL.HEIGHT;
    const HW  = GOAL.HALF_W;
    const R   = GOAL.POST_R;
    const GZ  = GOAL.Z;

    // Left post
    const lp = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H + 0.1, 10), mat);
    lp.position.set(-HW, H / 2, GZ);
    lp.castShadow = true;
    this._group.add(lp);

    // Right post
    const rp = lp.clone();
    rp.position.set(HW, H / 2, GZ);
    this._group.add(rp);

    // Crossbar
    const W  = HW * 2;
    const cb = new THREE.Mesh(new THREE.CylinderGeometry(R, R, W + R * 2, 10), mat);
    cb.rotation.z = Math.PI / 2;
    cb.position.set(0, H, GZ);
    cb.castShadow = true;
    this._group.add(cb);

    // Back posts (net support)
    const bpMat = new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 40 });
    [-HW, HW].forEach(x => {
      const bp = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.7, R * 0.7, H + 0.1, 8), bpMat);
      bp.position.set(x, H / 2, GOAL.NET_Z);
      this._group.add(bp);
    });

    // Top back bar
    const tbb = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.7, R * 0.7, W + R * 2, 8), bpMat);
    tbb.rotation.z = Math.PI / 2;
    tbb.position.set(0, H, GOAL.NET_Z);
    this._group.add(tbb);

    // Connecting bars (top sides)
    const BD = Math.abs(GOAL.NET_Z - GZ);
    [-HW, HW].forEach(x => {
      const side = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.7, R * 0.7, BD, 6), bpMat);
      side.rotation.x = Math.PI / 2;
      side.position.set(x, H, GZ - BD / 2);
      this._group.add(side);
    });
  }

  // ── Net ───────────────────────────────────────────────────────────
  _buildNet() {
    const mat = new THREE.LineBasicMaterial({
      color: 0xdddddd, transparent: true, opacity: 0.55
    });

    const H  = GOAL.HEIGHT;
    const HW = GOAL.HALF_W;
    const GZ = GOAL.Z;
    const NZ = GOAL.NET_Z;

    const pts = [];
    const COLS = 18, ROWS = 10;

    // Vertical lines (front-to-back)
    for (let c = 0; c <= COLS; c++) {
      const x = -HW + (c / COLS) * HW * 2;
      // Bottom seam
      pts.push(new THREE.Vector3(x, 0,   GZ));
      pts.push(new THREE.Vector3(x, 0,   NZ));
      pts.push(new THREE.Vector3(x, 0,   NZ));  // break
      pts.push(new THREE.Vector3(x, 0,   NZ));

      // Top seam
      pts.push(new THREE.Vector3(x, H, GZ));
      pts.push(new THREE.Vector3(x, H, NZ));
      pts.push(new THREE.Vector3(x, H, NZ));
      pts.push(new THREE.Vector3(x, H, NZ));
    }

    // Horizontal lines left-right
    for (let r = 0; r <= ROWS; r++) {
      const y = (r / ROWS) * H;
      pts.push(new THREE.Vector3(-HW, y, GZ));
      pts.push(new THREE.Vector3( HW, y, GZ));
      pts.push(new THREE.Vector3( HW, y, GZ));
      pts.push(new THREE.Vector3( HW, y, GZ));

      pts.push(new THREE.Vector3(-HW, y, NZ));
      pts.push(new THREE.Vector3( HW, y, NZ));
      pts.push(new THREE.Vector3( HW, y, NZ));
      pts.push(new THREE.Vector3( HW, y, NZ));
    }

    // Back curtain lines (depth lines on back face)
    for (let c = 0; c <= COLS; c++) {
      const x = -HW + (c / COLS) * HW * 2;
      pts.push(new THREE.Vector3(x, 0, NZ));
      pts.push(new THREE.Vector3(x, H, NZ));
    }

    // Left & right side nets
    for (let d = 0; d <= 6; d++) {
      const z = GZ - (d / 6) * Math.abs(NZ - GZ);
      pts.push(new THREE.Vector3(-HW, 0, z));
      pts.push(new THREE.Vector3(-HW, H, z));
      pts.push(new THREE.Vector3( HW, 0, z));
      pts.push(new THREE.Vector3( HW, H, z));
    }

    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const net = new THREE.LineSegments(geo, mat);
    this._group.add(net);
  }

  // ── Net shake animation ───────────────────────────────────────────
  shakeNet() {
    const net   = this._group.children.find(c => c.isLineSegments);
    if (!net) return;
    let t = 0;
    const origPos = net.position.clone();
    const shake   = () => {
      t += 0.15;
      net.position.x = origPos.x + (Math.random() - 0.5) * 0.08 * Math.max(0, 1 - t);
      net.position.y = origPos.y + (Math.random() - 0.5) * 0.06 * Math.max(0, 1 - t);
      if (t < 1) requestAnimationFrame(shake);
      else net.position.copy(origPos);
    };
    shake();
  }
}
