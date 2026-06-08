// scripts/stadium.js — Procedural stadium: ground, markings, stands, lights
import * as THREE from 'three';

export function createStadium(scene, isLow) {
  const root = new THREE.Group();
  root.name  = 'stadium';

  _addGround(root);
  _addFieldMarkings(root);
  _addStands(root, isLow);
  _addFloodlights(root, scene, isLow);
  _addSkyDome(scene);

  scene.add(root);
  return root;
}

// ── Ground ────────────────────────────────────────────────────────────
function _addGround(root) {
  // Base grass
  const grassMat = new THREE.MeshLambertMaterial({ color: 0x1e6b1e });
  const ground   = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    grassMat
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  // Alternating lighter stripes
  const stripeMat = new THREE.MeshLambertMaterial({ color: 0x238c23 });
  for (let i = 0; i < 12; i += 2) {
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 10),
      stripeMat
    );
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(0, 0.001, -60 + i * 10 + 5);
    stripe.receiveShadow = true;
    root.add(stripe);
  }
}

// ── Field Markings ────────────────────────────────────────────────────
function _addFieldMarkings(root) {
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Helper: draw a flat white rectangle on the ground
  function line(x1, z1, x2, z2, thick = 0.07) {
    const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
    const dx = x2 - x1,       dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz) + thick;
    const ang = Math.atan2(dx, dz);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(thick, len), mat);
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = -ang;
    m.position.set(cx, 0.002, cz);
    root.add(m);
  }

  const GZ  = -11;    // goal z
  const GW  = 3.66;   // half-width of goal
  const PAW = 20.16;  // penalty area half-width
  const PAD = 16.5;   // penalty area depth

  // Goal line
  line(-PAW, GZ, PAW, GZ);
  // Penalty area sides
  line(-PAW, GZ,  -PAW, GZ - PAD);
  line( PAW, GZ,   PAW, GZ - PAD);
  // Penalty area front
  line(-PAW, GZ - PAD, PAW, GZ - PAD);

  // 6-yard box
  const SBW = 9.16, SBD = 5.5;
  line(-SBW, GZ, -SBW, GZ - SBD);
  line( SBW, GZ,  SBW, GZ - SBD);
  line(-SBW, GZ - SBD, SBW, GZ - SBD);

  // Penalty spot
  const spot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), mat);
  spot.rotation.x = -Math.PI / 2;
  spot.position.set(0, 0.003, 0);
  root.add(spot);

  // Penalty arc
  const arcPts = [];
  for (let a = -57; a <= 57; a += 4) {
    const r = (a * Math.PI) / 180;
    arcPts.push(new THREE.Vector3(Math.sin(r) * 9.15, 0.003, Math.cos(r) * 9.15));
  }
  const arc = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcPts),
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  root.add(arc);

  // Centre circle (partial, visible portion)
  const circlePts = [];
  for (let a = 90; a <= 270; a += 4) {
    const r = (a * Math.PI) / 180;
    circlePts.push(new THREE.Vector3(Math.sin(r) * 9.15, 0.003, -11 - 16.5 + Math.cos(r) * 9.15));
  }
  const circle = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(circlePts),
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  root.add(circle);
}

// ── Stands ────────────────────────────────────────────────────────────
function _addStands(root, isLow) {
  const dark    = new THREE.MeshLambertMaterial({ color: 0x111128 });
  const seatColors = [0x1a2090, 0x8c1a1a, 0x1a8c1a, 0x8c8c1a];

  function makeBank(width, depth, tiers, cx, cz, rotY) {
    const bank = new THREE.Group();

    for (let i = 0; i < tiers; i++) {
      // Step platform
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(width, 1.2, depth),
        dark
      );
      step.position.set(0, i * 1.4, i * depth * 0.6);
      step.castShadow    = false;
      step.receiveShadow = true;
      bank.add(step);

      // Seats
      const seatMat = new THREE.MeshLambertMaterial({
        color: seatColors[i % seatColors.length]
      });
      const seats = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.92, 0.55, depth * 0.7),
        seatMat
      );
      seats.position.set(0, 0.9, 0);
      step.add(seats);

      // Simple crowd (blobs)
      if (!isLow) {
        const crowdMat = new THREE.MeshLambertMaterial({ color: 0xddddee });
        const crowd    = new THREE.Mesh(
          new THREE.BoxGeometry(width * 0.88, 0.45, depth * 0.4),
          crowdMat
        );
        crowd.position.set(0, 1.2, -depth * 0.08);
        step.add(crowd);
      }
    }

    bank.position.set(cx, 0, cz);
    bank.rotation.y = rotY;
    return bank;
  }

  // Back stand (behind goal)
  root.add(makeBank(80, 4, isLow ? 5 : 9, 0, -44, 0));
  // Front stand
  root.add(makeBank(80, 4, isLow ? 5 : 9, 0,  26, Math.PI));
  // Left stand
  root.add(makeBank(60, 4, isLow ? 4 : 7, -54, -11, Math.PI / 2));
  // Right stand
  root.add(makeBank(60, 4, isLow ? 4 : 7,  54, -11, -Math.PI / 2));
}

// ── Floodlights ───────────────────────────────────────────────────────
function _addFloodlights(root, scene, isLow) {
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x888899 });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });

  function makePole(x, z) {
    const g = new THREE.Group();

    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.35, 30, 8),
      poleMat
    );
    pole.position.y = 15;
    pole.castShadow = true;
    g.add(pole);

    // Arm
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 6, 6),
      poleMat
    );
    arm.rotation.z = Math.PI / 2;
    arm.position.set(Math.sign(-x) * 3, 29, 0);
    g.add(arm);

    // Light fixture boxes
    for (let i = -1; i <= 1; i++) {
      const bulb = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.5, 0.6),
        bulbMat
      );
      bulb.position.set(Math.sign(-x) * (3 + i * 1.3), 29, 0);
      g.add(bulb);
    }

    // Spotlights
    if (!isLow) {
      const spot = new THREE.SpotLight(0xfff8e8, 2.5, 80, Math.PI / 5, 0.4, 1.2);
      spot.position.set(Math.sign(-x) * 3, 29, 0);
      spot.target.position.set(0, 0, -8);
      spot.castShadow = true;
      spot.shadow.mapSize.set(512, 512);
      spot.shadow.camera.near = 5;
      spot.shadow.camera.far  = 90;
      g.add(spot);
      g.add(spot.target);
    } else {
      const pt = new THREE.PointLight(0xfff8e8, 1.5, 70, 1.5);
      pt.position.set(0, 28, 0);
      g.add(pt);
    }

    g.position.set(x, 0, z);
    return g;
  }

  root.add(makePole(-50, -30));
  root.add(makePole( 50, -30));
  root.add(makePole(-50,  10));
  root.add(makePole( 50,  10));

  // Ambient + hemisphere
  const ambient = new THREE.AmbientLight(0x334466, 0.7);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x224488, 0x112200, 0.5);
  scene.add(hemi);
}

// ── Sky dome ──────────────────────────────────────────────────────────
function _addSkyDome(scene) {
  // Stars
  const starGeo  = new THREE.BufferGeometry();
  const starCount = 600;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(Math.random() * 2 - 1);
    const r     = 200 + Math.random() * 50;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(r * Math.cos(phi));
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, sizeAttenuation: true })
  );
  scene.add(stars);
}
