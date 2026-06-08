// Three.js Scene Setup and Procedural Asset Renderer
class GameRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        
        // Scene core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Lighting
        this.dirLight = null;
        
        // Core meshes
        this.ballMesh = null;
        this.goalFrame = new THREE.Group();
        this.netGroup = new THREE.Group();
        this.netBack = null; // Reference for net bulge
        this.targetRings = [];
        
        // Particle Engine
        this.particles = [];
        this.particleGroup = new THREE.Group();
        
        // Camera configuration
        this.cameraStates = {
            behindBall: { pos: new THREE.Vector3(0, 1.45, 13.8), lookAt: new THREE.Vector3(0, 1.0, 0) },
            followShot: { pos: new THREE.Vector3(0, 1.7, 7.5), lookAt: new THREE.Vector3(0, 1.2, -1) },
            goalCam: { pos: new THREE.Vector3(0, 0.8, -2.5), lookAt: new THREE.Vector3(0, 1.2, 2) },
            cinematic: { pos: new THREE.Vector3(-4.5, 2.0, 7.5), lookAt: new THREE.Vector3(0, 1.2, 0) }
        };
        this.currentCamState = 'behindBall';
        this.camLerpSpeed = 4.0;
        this.targetCamPos = new THREE.Vector3();
        this.targetCamLookAt = new THREE.Vector3();
        this.currentCamLookAt = new THREE.Vector3();

        this.init();
    }

    init() {
        // 1. Initialize Scene & Fog (stadium atmosphere)
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0c0f16);
        this.scene.fog = new THREE.FogExp2(0x0c0f16, 0.02);

        // 2. Camera Setup
        this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 150);
        this.targetCamPos.copy(this.cameraStates.behindBall.pos);
        this.camera.position.copy(this.targetCamPos);
        this.targetCamLookAt.copy(this.cameraStates.behindBall.lookAt);
        this.currentCamLookAt.copy(this.targetCamLookAt);
        this.camera.lookAt(this.currentCamLookAt);

        // 3. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 4. Lighting System
        const ambientLight = new THREE.AmbientLight(0x445544, 0.55); // Ambient green light bounce
        this.scene.add(ambientLight);

        // Main Sunlight / Stadium Light
        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
        this.dirLight.position.set(-6, 12, 18);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.dirLight.shadow.camera.near = 0.5;
        this.dirLight.shadow.camera.far = 40;
        this.dirLight.shadow.camera.left = -6;
        this.dirLight.shadow.camera.right = 6;
        this.dirLight.shadow.camera.top = 10;
        this.dirLight.shadow.camera.bottom = -4;
        this.dirLight.shadow.bias = -0.0005;
        this.scene.add(this.dirLight);

        // Stadium Floodlights (Glowing backlights)
        const stadiumLight1 = new THREE.SpotLight(0x00d2ff, 8, 30, Math.PI / 4, 0.5, 1);
        stadiumLight1.position.set(-10, 8, -5);
        stadiumLight1.lookAt(0, 0, 0);
        this.scene.add(stadiumLight1);

        const stadiumLight2 = new THREE.SpotLight(0x39ff14, 5, 30, Math.PI / 4, 0.5, 1);
        stadiumLight2.position.set(10, 8, -5);
        stadiumLight2.lookAt(0, 0, 0);
        this.scene.add(stadiumLight2);

        // 5. Build Pitch, Goal, and Ball
        this.buildPitch();
        this.buildGoal();
        this.buildBall();
        this.scene.add(this.particleGroup);

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    // Canvas procedural striped grass
    createGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Dark base
        ctx.fillStyle = '#1b3b15';
        ctx.fillRect(0, 0, 256, 512);

        // Alternating mower stripes
        ctx.fillStyle = '#224a1a';
        const stripeHeight = 32;
        for (let i = 0; i < 512; i += stripeHeight * 2) {
            ctx.fillRect(0, i, 256, stripeHeight);
        }

        // Add subtle field markings (penalty box, lines)
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, 256, 512);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        return texture;
    }

    // Canvas procedural soccer ball pentagonal dots
    createBallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // White base
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, 512, 256);

        // Draw classic pentagonal soccer spots grid
        ctx.fillStyle = '#111827';
        const drawPentagon = (x, y, radius) => {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
            }
            ctx.closePath();
            ctx.fill();
        };

        const gridX = 4;
        const gridY = 3;
        for (let ix = 0; ix <= gridX; ix++) {
            for (let iy = 0; iy <= gridY; iy++) {
                const x = (ix + (iy % 2 === 0 ? 0 : 0.5)) * (512 / gridX);
                const y = iy * (256 / gridY);
                drawPentagon(x, y, 22);
                
                // Add gold/neon cyan stitching line highlights
                ctx.strokeStyle = '#222';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, y, 40, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createNetTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Black translucent grid texture
        ctx.clearRect(0, 0, 64, 64);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        
        ctx.strokeRect(0, 0, 64, 64);
        ctx.beginPath();
        ctx.moveTo(32, 0); ctx.lineTo(32, 64);
        ctx.moveTo(0, 32); ctx.lineTo(64, 32);
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 15);
        return texture;
    }

    buildPitch() {
        const grassTex = this.createGrassTexture();
        
        const pitchGeo = new THREE.PlaneGeometry(60, 40);
        const pitchMat = new THREE.MeshPhongMaterial({
            map: grassTex,
            roughness: 0.9,
            shininess: 10
        });
        
        const pitch = new THREE.Mesh(pitchGeo, pitchMat);
        pitch.rotation.x = -Math.PI / 2;
        pitch.position.y = 0;
        pitch.receiveShadow = true;
        this.scene.add(pitch);

        // Penalty spot (white circle mesh)
        const spotGeo = new THREE.RingGeometry(0, 0.12, 32);
        const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const spot = new THREE.Mesh(spotGeo, spotMat);
        spot.rotation.x = -Math.PI / 2;
        spot.position.set(0, 0.005, 11); // Elevated very slightly to prevent Z-fighting
        this.scene.add(spot);

        // Penalty arc line
        const arcGeo = new THREE.RingGeometry(9.10, 9.15, 64, 1, Math.PI*1.22, Math.PI*0.56);
        const arcMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.15, transparent: true, side: THREE.DoubleSide });
        const arc = new THREE.Mesh(arcGeo, arcMat);
        arc.rotation.x = -Math.PI / 2;
        arc.position.set(0, 0.004, 0);
        this.scene.add(arc);
    }

    buildGoal() {
        const postMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.25,
            roughness: 0.15
        });

        // 1. Goal Posts
        const postRadius = 0.08;
        const postHeight = 2.44;
        const postWidth = 7.32;
        const goalDepth = 1.8;

        const leftPostGeo = new THREE.CylinderGeometry(postRadius, postRadius, postHeight, 16);
        const leftPost = new THREE.Mesh(leftPostGeo, postMat);
        leftPost.position.set(-postWidth / 2, postHeight / 2, 0);
        leftPost.castShadow = true;
        this.goalFrame.add(leftPost);

        const rightPost = leftPost.clone();
        rightPost.position.x = postWidth / 2;
        this.goalFrame.add(rightPost);

        // 2. Crossbar
        const crossbarGeo = new THREE.CylinderGeometry(postRadius, postRadius, postWidth + postRadius*2, 16);
        const crossbar = new THREE.Mesh(crossbarGeo, postMat);
        crossbar.rotation.z = Math.PI / 2;
        crossbar.position.set(0, postHeight, 0);
        crossbar.castShadow = true;
        this.goalFrame.add(crossbar);

        // 3. Goal supports (back frames)
        const supportMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.4, roughness: 0.2 });
        const supportGeo = new THREE.CylinderGeometry(0.04, 0.04, goalDepth, 12);
        
        // Left bottom support
        const leftBtmSupport = new THREE.Mesh(supportGeo, supportMat);
        leftBtmSupport.rotation.x = Math.PI / 2;
        leftBtmSupport.position.set(-postWidth/2, 0.04, -goalDepth/2);
        this.goalFrame.add(leftBtmSupport);

        // Right bottom support
        const rightBtmSupport = leftBtmSupport.clone();
        rightBtmSupport.position.x = postWidth/2;
        this.goalFrame.add(rightBtmSupport);

        this.scene.add(this.goalFrame);

        // 4. Goal Net Assembly
        const netTex = this.createNetTexture();
        const netMat = new THREE.MeshBasicMaterial({
            map: netTex,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        // Back net
        const netBackGeo = new THREE.PlaneGeometry(postWidth, postHeight, 8, 8);
        this.netBack = new THREE.Mesh(netBackGeo, netMat);
        this.netBack.position.set(0, postHeight / 2, -goalDepth);
        this.netGroup.add(this.netBack);

        // Left net side
        const netSideGeo = new THREE.PlaneGeometry(goalDepth, postHeight, 8, 8);
        const netLeft = new THREE.Mesh(netSideGeo, netMat);
        netLeft.rotation.y = Math.PI / 2;
        netLeft.position.set(-postWidth / 2, postHeight / 2, -goalDepth / 2);
        this.netGroup.add(netLeft);

        // Right net side
        const netRight = netLeft.clone();
        netRight.rotation.y = -Math.PI / 2;
        netRight.position.x = postWidth / 2;
        this.netGroup.add(netRight);

        // Top net
        const netTopGeo = new THREE.PlaneGeometry(postWidth, goalDepth, 8, 8);
        const netTop = new THREE.Mesh(netTopGeo, netMat);
        netTop.rotation.x = Math.PI / 2;
        netTop.position.set(0, postHeight, -goalDepth / 2);
        this.netGroup.add(netTop);

        this.scene.add(this.netGroup);
    }

    buildBall() {
        const ballRadius = 0.11;
        const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 32);
        
        const ballTex = this.createBallTexture();
        const ballMat = new THREE.MeshPhongMaterial({
            map: ballTex,
            roughness: 0.3,
            shininess: 40
        });

        this.ballMesh = new THREE.Mesh(ballGeo, ballMat);
        this.ballMesh.castShadow = true;
        this.ballMesh.receiveShadow = true;
        this.ballMesh.position.set(0, ballRadius, 11);
        this.scene.add(this.ballMesh);
    }

    // Target Practice Rings
    spawnTargets() {
        // Clear old targets
        this.clearTargets();

        const ringGeo = new THREE.TorusGeometry(0.32, 0.04, 12, 48);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0xffcc00, // Gold
            emissive: 0x885500,
            metalness: 0.8,
            roughness: 0.15
        });

        // 4 corner coordinates (within 7.32 x 2.44 frame)
        const corners = [
            { x: -3.0, y: 2.0, name: 'TL' },  // Top Left
            { x: 3.0, y: 2.0, name: 'TR' },   // Top Right
            { x: -3.1, y: 0.45, name: 'BL' }, // Bottom Left
            { x: 3.1, y: 0.45, name: 'BR' }   // Bottom Right
        ];

        corners.forEach(pos => {
            const mesh = new THREE.Mesh(ringGeo, ringMat.clone());
            mesh.position.set(pos.x, pos.y, 0); // Spawns directly in goal plane
            mesh.castShadow = false;
            mesh.userData = { name: pos.name, pulseTime: Math.random() * 5 };
            
            // Add a translucent center scoring sheet mesh inside the ring
            const innerGeo = new THREE.CircleGeometry(0.32, 32);
            const innerMat = new THREE.MeshBasicMaterial({
                color: 0xff0055,
                opacity: 0.25,
                transparent: true,
                side: THREE.DoubleSide
            });
            const inner = new THREE.Mesh(innerGeo, innerMat);
            mesh.add(inner);

            this.scene.add(mesh);
            this.targetRings.push(mesh);
        });
    }

    clearTargets() {
        this.targetRings.forEach(ring => {
            this.scene.remove(ring);
            // Dispose geometries/materials
            ring.geometry.dispose();
            ring.material.dispose();
            ring.children.forEach(c => {
                c.geometry.dispose();
                c.material.dispose();
            });
        });
        this.targetRings = [];
    }

    // Particle Burst System
    spawnParticles(pos, count, color, speedScale = 1.0, type = 'spray') {
        const geo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
        
        for (let i = 0; i < count; i++) {
            const mat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 1.0
            });
            
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(pos);
            
            // Random directional velocities
            let vx, vy, vz;
            if (type === 'spray') { // Grass kick spray
                vx = (Math.random() * 2 - 1) * 2.5;
                vy = (Math.random() + 0.5) * 3.5;
                vz = (Math.random() + 0.5) * 2.0;
            } else if (type === 'spark') { // Metal clank sparks
                vx = (Math.random() * 2 - 1) * 4.0;
                vy = (Math.random() * 2 - 1) * 4.0;
                vz = (Math.random() * 2 - 1) * 4.0;
            } else { // Goal celebration confetti
                vx = (Math.random() * 2 - 1) * 3.0;
                vy = (Math.random() + 1.2) * 5.0;
                vz = (Math.random() * 2 - 1) * 3.0;
            }

            p.userData = {
                velocity: new THREE.Vector3(vx * speedScale, vy * speedScale, vz * speedScale),
                life: 1.0,
                decay: 0.6 + Math.random() * 0.9,
                gravity: type === 'spark' ? -12 : -9.81
            };

            this.particleGroup.add(p);
            this.particles.push(p);
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const data = p.userData;

            // Apply gravity
            data.velocity.y += data.gravity * dt;
            
            // Update positions
            p.position.addScaledVector(data.velocity, dt);

            // Rotate particles for visual flutter
            p.rotation.x += 4 * dt;
            p.rotation.y += 3 * dt;

            // Fade life
            data.life -= data.decay * dt;
            p.material.opacity = Math.max(0, data.life);

            if (data.life <= 0) {
                this.particleGroup.remove(p);
                p.geometry.dispose();
                p.material.dispose();
                this.particles.splice(i, 1);
            }
        }
    }

    setCameraState(stateName, instant = false) {
        if (this.cameraStates[stateName]) {
            this.currentCamState = stateName;
            this.targetCamPos.copy(this.cameraStates[stateName].pos);
            this.targetCamLookAt.copy(this.cameraStates[stateName].lookAt);
            
            if (instant) {
                this.camera.position.copy(this.targetCamPos);
                this.currentCamLookAt.copy(this.targetCamLookAt);
                this.camera.lookAt(this.currentCamLookAt);
            }
        }
    }

    update(dt, ballPos, ballVelocity) {
        // --- 1. Follow ball cam transition ---
        if (this.currentCamState === 'followShot') {
            // Camera slides behind the ball during flight
            this.targetCamPos.set(
                THREE.MathUtils.lerp(this.targetCamPos.x, ballPos.x * 0.4, dt * 5),
                THREE.MathUtils.lerp(this.targetCamPos.y, ballPos.y + 1.2, dt * 4),
                THREE.MathUtils.lerp(this.targetCamPos.z, ballPos.z + 2.8, dt * 5)
            );
            // Limit minimum camera Z behind the goal
            this.targetCamPos.z = Math.max(this.targetCamPos.z, 2.2);

            this.targetCamLookAt.copy(ballPos);
        }

        // Camera lerping
        this.camera.position.lerp(this.targetCamPos, dt * this.camLerpSpeed);
        this.currentCamLookAt.lerp(this.targetCamLookAt, dt * this.camLerpSpeed);
        this.camera.lookAt(this.currentCamLookAt);

        // --- 2. Update Ball position & roll animation ---
        if (this.ballMesh) {
            this.ballMesh.position.copy(ballPos);

            // Roll ball based on velocity vector
            const speed = ballVelocity.length();
            if (speed > 0.05) {
                // Direction of rotation axis is perpendicular to velocity
                const axis = new THREE.Vector3(-ballVelocity.z, 0, ballVelocity.x).normalize();
                // Speed / radius gives angular displacement
                const angularDistance = speed / 0.11;
                this.ballMesh.rotateOnWorldAxis(axis, angularDistance * dt);
            }
        }

        // --- 3. Animate Goal Targets ---
        this.targetRings.forEach(ring => {
            ring.userData.pulseTime += dt * 3.5;
            const scale = 1.0 + Math.sin(ring.userData.pulseTime) * 0.06;
            ring.scale.set(scale, scale, scale);
            ring.rotation.z += dt * 0.5; // Rotate ring subtly
        });

        // --- 4. Net Bulge Animation Reset ---
        // Lerp net vertices back to resting state
        if (this.netBack) {
            const posAttr = this.netBack.geometry.attributes.position;
            let netDirty = false;
            for (let i = 0; i < posAttr.count; i++) {
                const zVal = posAttr.getZ(i);
                if (Math.abs(zVal) > 0.001) {
                    posAttr.setZ(i, THREE.MathUtils.lerp(zVal, 0, dt * 3));
                    netDirty = true;
                }
            }
            if (netDirty) {
                posAttr.needsUpdate = true;
            }
        }

        // --- 5. Update Particle System ---
        this.updateParticles(dt);

        // --- 6. Render Viewport ---
        this.renderer.render(this.scene, this.camera);
    }

    // Distort net vertex coordinates at impact point to simulate bulging
    applyNetBulge(impactPoint, impactVelocity) {
        if (!this.netBack) return;

        // Convert world impact position to net local space
        const localImpact = this.netBack.worldToLocal(impactPoint.clone());
        const posAttr = this.netBack.geometry.attributes.position;
        const force = Math.max(0.15, Math.min(0.65, impactVelocity.length() * 0.035));

        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            const dist = Math.sqrt((x - localImpact.x)*(x - localImpact.x) + (y - localImpact.y)*(y - localImpact.y));

            if (dist < 1.8) {
                // Apply bulge force pushing Z backwards (-Z direction in local space)
                const displacement = force * Math.exp(-dist * 1.6);
                posAttr.setZ(i, -displacement);
            }
        }
        posAttr.needsUpdate = true;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Global Export
window.GameSceneRenderer = GameRenderer;
