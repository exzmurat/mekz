// Goalkeeper AI and Animation System for 3D Football Penalty Game
class Goalkeeper {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.difficulty = 'easy'; // easy, medium, hard
        
        // Parts references for procedural skeleton
        this.torso = null;
        this.head = null;
        this.leftShoulder = null;
        this.rightShoulder = null;
        this.leftHand = null;
        this.rightHand = null;
        this.leftHip = null;
        this.rightHip = null;
        
        // Default spawn position (centered on goal line)
        this.spawnPos = new THREE.Vector3(0, 0, 0);
        this.targetPos = new THREE.Vector3(0, 0, 0);
        this.currentPos = new THREE.Vector3(0, 0, 0);
        
        // Target rotation (lerped for diving angles)
        this.targetRotZ = 0;
        this.currentRotZ = 0;
        
        // Animation variables (pose angles)
        this.poseLerpTime = 0;
        this.poseLerpDuration = 0.35; // speed of diving animation
        this.currentPose = 'idle';
        this.targetPoseName = 'idle';
        this.jointAngles = {};
        
        // AI State
        this.hasReacted = false;
        this.reactionTimer = 0;
        this.reactionDelay = 0.35; // Seconds before starting dive
        this.diveTarget = new THREE.Vector3(); // Predicted ball path intersection at Z=0
        
        // Save hitbox (hands and torso area)
        this.saveRadius = 0.65; // coverage of goalkeeper save
        
        // Build 3D mesh
        this.buildMesh();
        this.scene.add(this.group);
        this.reset();
    }

    buildMesh() {
        // Material definitions
        const skinMat = new THREE.MeshPhongMaterial({ color: 0xffdbac, roughness: 0.6 }); // flesh tone
        const jerseyMat = new THREE.MeshPhongMaterial({ color: 0xffaa00, shininess: 30 }); // Neon yellow-orange jersey
        const shortsMat = new THREE.MeshPhongMaterial({ color: 0x111122, roughness: 0.7 }); // dark blue shorts
        const gloveMat = new THREE.MeshPhongMaterial({ color: 0x00d2ff, shininess: 50 }); // Neon cyan gloves
        const bootMat = new THREE.MeshPhongMaterial({ color: 0x222222 }); // Dark boots

        // 1. Torso (Pivot at center)
        const torsoGeo = new THREE.BoxGeometry(0.5, 0.7, 0.25);
        this.torso = new THREE.Mesh(torsoGeo, jerseyMat);
        this.torso.position.y = 0.85; // Raised from ground
        this.torso.castShadow = true;
        this.torso.receiveShadow = true;
        this.group.add(this.torso);

        // Shorts
        const shortsGeo = new THREE.BoxGeometry(0.52, 0.2, 0.27);
        const shorts = new THREE.Mesh(shortsGeo, shortsMat);
        shorts.position.y = -0.32;
        this.torso.add(shorts);

        // 2. Head
        const headGeo = new THREE.SphereGeometry(0.15, 16, 16);
        this.head = new THREE.Mesh(headGeo, skinMat);
        this.head.position.y = 0.5;
        this.head.castShadow = true;
        this.torso.add(this.head);

        // Hair/Cap
        const hairGeo = new THREE.SphereGeometry(0.155, 12, 12, 0, Math.PI*2, 0, Math.PI/2);
        const hairMat = new THREE.MeshPhongMaterial({ color: 0x4a3b32 });
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.rotation.x = -0.2;
        this.head.add(hair);

        // 3. Left Arm Group (Shoulder Pivot)
        this.leftShoulder = new THREE.Group();
        this.leftShoulder.position.set(-0.3, 0.25, 0);
        this.torso.add(this.leftShoulder);

        const leftArmGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.45, 8);
        const leftArm = new THREE.Mesh(leftArmGeo, jerseyMat);
        leftArm.position.y = -0.2;
        leftArm.castShadow = true;
        this.leftShoulder.add(leftArm);

        const leftForearmGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.4, 8);
        const leftForearm = new THREE.Mesh(leftForearmGeo, skinMat);
        leftForearm.position.y = -0.55;
        leftForearm.castShadow = true;
        this.leftShoulder.add(leftForearm);

        const gloveGeo = new THREE.BoxGeometry(0.12, 0.15, 0.06);
        this.leftHand = new THREE.Mesh(gloveGeo, gloveMat);
        this.leftHand.position.y = -0.75;
        this.leftHand.castShadow = true;
        this.leftShoulder.add(this.leftHand);

        // 4. Right Arm Group (Shoulder Pivot)
        this.rightShoulder = new THREE.Group();
        this.rightShoulder.position.set(0.3, 0.25, 0);
        this.torso.add(this.rightShoulder);

        const rightArm = new THREE.Mesh(leftArmGeo, jerseyMat);
        rightArm.position.y = -0.2;
        rightArm.castShadow = true;
        this.rightShoulder.add(rightArm);

        const rightForearm = new THREE.Mesh(leftForearmGeo, skinMat);
        rightForearm.position.y = -0.55;
        rightForearm.castShadow = true;
        this.rightShoulder.add(rightForearm);

        this.rightHand = new THREE.Mesh(gloveGeo, gloveMat);
        this.rightHand.position.y = -0.75;
        this.rightHand.castShadow = true;
        this.rightShoulder.add(this.rightHand);

        // 5. Legs (Left Hip Pivot)
        this.leftHip = new THREE.Group();
        this.leftHip.position.set(-0.18, -0.4, 0);
        this.torso.add(this.leftHip);

        const leftLegGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.5, 8);
        const leftLeg = new THREE.Mesh(leftLegGeo, skinMat);
        leftLeg.position.y = -0.25;
        leftLeg.castShadow = true;
        this.leftHip.add(leftLeg);

        const leftLowerLegGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.5, 8);
        const leftLowerLeg = new THREE.Mesh(leftLowerLegGeo, skinMat);
        leftLowerLeg.position.y = -0.7;
        leftLowerLeg.castShadow = true;
        this.leftHip.add(leftLowerLeg);

        const bootGeo = new THREE.BoxGeometry(0.1, 0.1, 0.22);
        const leftBoot = new THREE.Mesh(bootGeo, bootMat);
        leftBoot.position.set(0, -0.98, 0.05);
        leftBoot.castShadow = true;
        this.leftHip.add(leftBoot);

        // 6. Right Legs (Right Hip Pivot)
        this.rightHip = new THREE.Group();
        this.rightHip.position.set(0.18, -0.4, 0);
        this.torso.add(this.rightHip);

        const rightLeg = new THREE.Mesh(leftLegGeo, skinMat);
        rightLeg.position.y = -0.25;
        rightLeg.castShadow = true;
        this.rightHip.add(rightLeg);

        const rightLowerLeg = new THREE.Mesh(rightLowerLegGeo, skinMat);
        rightLowerLeg.position.y = -0.7;
        rightLowerLeg.castShadow = true;
        this.rightHip.add(rightLowerLeg);

        const rightBoot = new THREE.Mesh(bootGeo, bootMat);
        rightBoot.position.set(0, -0.98, 0.05);
        rightBoot.castShadow = true;
        this.rightHip.add(rightBoot);
    }

    reset() {
        this.group.position.set(0, 0, 0);
        this.targetPos.set(0, 0, 0);
        this.currentPos.set(0, 0, 0);
        this.group.rotation.set(0, 0, 0);
        
        this.targetRotZ = 0;
        this.currentRotZ = 0;

        this.hasReacted = false;
        this.reactionTimer = 0;
        this.currentPose = 'idle';
        this.targetPoseName = 'idle';
        this.poseLerpTime = 0;

        // Apply idle pose instantly
        this.applyPose('idle', 1);
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        if (difficulty === 'easy') {
            this.reactionDelay = 0.45;
            this.saveRadius = 0.55; // Smaller reach
        } else if (difficulty === 'medium') {
            this.reactionDelay = 0.28;
            this.saveRadius = 0.65; // Normal reach
        } else { // hard
            this.reactionDelay = 0.12;
            this.saveRadius = 0.78; // Large coverage reach
        }
    }

    // Triggered when ball is kicked
    onBallKicked(predictedZ0Intersect, ballSpeed) {
        this.hasReacted = false;
        this.reactionTimer = 0;
        this.diveTarget.copy(predictedZ0Intersect);
        
        // Dynamic reaction delay adjustments (fast shots give less delay, but capped)
        const flightTimeZ0 = 11 / ballSpeed; // Approx flight time
        this.reactionDelay = Math.min(this.reactionDelay, flightTimeZ0 * 0.7);

        // For Easy, 25% chance to dive the completely wrong way!
        if (this.difficulty === 'easy' && Math.random() < 0.25) {
            this.diveTarget.x = -this.diveTarget.x; // Mirror mistake!
        }
    }

    update(dt, ballPosition, isFlight) {
        // --- 1. AI Decision Timer ---
        if (isFlight && !this.hasReacted) {
            this.reactionTimer += dt;
            if (this.reactionTimer >= this.reactionDelay) {
                this.triggerDiveResponse();
                this.hasReacted = true;
            }
        }

        // --- 2. Lerp Position and Body Lean ---
        this.currentPos.lerp(this.targetPos, dt * 8);
        this.group.position.copy(this.currentPos);

        this.currentRotZ = THREE.MathUtils.lerp(this.currentRotZ, this.targetRotZ, dt * 8);
        this.group.rotation.z = this.currentRotZ;

        // --- 3. Joint Angle Interpolations ---
        if (this.currentPose !== this.targetPoseName) {
            this.poseLerpTime += dt;
            const t = Math.min(this.poseLerpTime / this.poseLerpDuration, 1);
            this.applyPoseTransition(this.currentPose, this.targetPoseName, t);
            
            if (t >= 1) {
                this.currentPose = this.targetPoseName;
            }
        }
    }

    triggerDiveResponse() {
        const x = this.diveTarget.x;
        const y = this.diveTarget.y;

        // Map predicted Z=0 intersection to 9 distinct dive animations
        let pose = 'idle';
        let jumpX = 0;
        let jumpY = 0;
        let tiltZ = 0;

        const limitX = 3.2; // Goal inner post is 3.66
        const limitY = 2.3; // Crossbar is 2.44

        // Cap target coordinates within saving reach
        const targetX = Math.max(-limitX, Math.min(limitX, x));
        const targetY = Math.max(0.1, Math.min(limitY, y));

        if (targetX < -1.2) { // Diving Left
            if (targetY > 1.4) {
                pose = 'diveLeftHigh';
                jumpX = targetX * 0.85;
                jumpY = targetY * 0.65;
                tiltZ = Math.PI / 3; // 60 deg roll
            } else if (targetY < 0.65) {
                pose = 'diveLeftLow';
                jumpX = targetX * 0.75;
                jumpY = 0.2;
                tiltZ = Math.PI / 2.3; // near ground layout
            } else {
                pose = 'diveLeftMid';
                jumpX = targetX * 0.8;
                jumpY = targetY * 0.5;
                tiltZ = Math.PI / 2.6;
            }
        } else if (targetX > 1.2) { // Diving Right
            if (targetY > 1.4) {
                pose = 'diveRightHigh';
                jumpX = targetX * 0.85;
                jumpY = targetY * 0.65;
                tiltZ = -Math.PI / 3;
            } else if (targetY < 0.65) {
                pose = 'diveRightLow';
                jumpX = targetX * 0.75;
                jumpY = 0.2;
                tiltZ = -Math.PI / 2.3;
            } else {
                pose = 'diveRightMid';
                jumpX = targetX * 0.8;
                jumpY = targetY * 0.5;
                tiltZ = -Math.PI / 2.6;
            }
        } else { // Center reacts
            jumpX = targetX * 0.4;
            if (targetY > 1.6) {
                pose = 'jumpCenter';
                jumpY = targetY * 0.5;
            } else if (targetY < 0.7) {
                pose = 'duckCenter';
                jumpY = 0;
            } else {
                pose = 'stayCenter';
                jumpY = 0.1;
            }
        }

        // Apply visual target transform updates
        this.targetPos.set(jumpX, jumpY, 0.1); // Move slightly forward for intercepting Z plane
        this.targetRotZ = tiltZ;

        // Set pose animation
        this.targetPoseName = pose;
        this.poseLerpTime = 0;
        
        // Speed up keeper dive rate for harder settings
        this.poseLerpDuration = this.difficulty === 'hard' ? 0.22 : (this.difficulty === 'medium' ? 0.32 : 0.45);
    }

    // Mathematical definitions for key skeletal joint positions/angles
    getPoseAngles(poseName) {
        const poses = {
            idle: {
                lShoulderZ: -0.2, lShoulderX: 0.2,
                rShoulderZ: 0.2, rShoulderX: 0.2,
                lHipZ: 0.05, lHipX: -0.2,
                rHipZ: -0.05, rHipX: -0.2,
                torsoY: 0.85
            },
            diveLeftHigh: {
                lShoulderZ: -Math.PI / 1.1, lShoulderX: 0.5,
                rShoulderZ: -Math.PI / 1.3, rShoulderX: 0.8,
                lHipZ: Math.PI / 6, lHipX: 0.1,
                rHipZ: Math.PI / 8, rHipX: 0.2,
                torsoY: 0.75
            },
            diveLeftMid: {
                lShoulderZ: -Math.PI / 1.2, lShoulderX: 0.3,
                rShoulderZ: -Math.PI / 1.5, rShoulderX: 0.6,
                lHipZ: Math.PI / 7, lHipX: 0.2,
                rHipZ: Math.PI / 9, rHipX: 0.3,
                torsoY: 0.7
            },
            diveLeftLow: {
                lShoulderZ: -Math.PI / 1.1, lShoulderX: -0.1,
                rShoulderZ: -Math.PI / 1.6, rShoulderX: 0.2,
                lHipZ: Math.PI / 8, lHipX: 0.4,
                rHipZ: Math.PI / 12, rHipX: 0.4,
                torsoY: 0.5
            },
            diveRightHigh: {
                lShoulderZ: Math.PI / 1.3, lShoulderX: 0.8,
                rShoulderZ: Math.PI / 1.1, rShoulderX: 0.5,
                lHipZ: -Math.PI / 8, lHipX: 0.2,
                rHipZ: -Math.PI / 6, rHipX: 0.1,
                torsoY: 0.75
            },
            diveRightMid: {
                lShoulderZ: Math.PI / 1.5, lShoulderX: 0.6,
                rShoulderZ: Math.PI / 1.2, rShoulderX: 0.3,
                lHipZ: -Math.PI / 9, lHipX: 0.3,
                rHipZ: -Math.PI / 7, rHipX: 0.2,
                torsoY: 0.7
            },
            diveRightLow: {
                lShoulderZ: Math.PI / 1.6, lShoulderX: 0.2,
                rShoulderZ: Math.PI / 1.1, rShoulderX: -0.1,
                lHipZ: -Math.PI / 12, lHipX: 0.4,
                rHipZ: -Math.PI / 8, rHipX: 0.4,
                torsoY: 0.5
            },
            jumpCenter: {
                lShoulderZ: -Math.PI / 1.1, lShoulderX: 0.4,
                rShoulderZ: Math.PI / 1.1, rShoulderX: 0.4,
                lHipZ: 0, lHipX: -0.4,
                rHipZ: 0, rHipX: -0.4,
                torsoY: 0.95
            },
            duckCenter: {
                lShoulderZ: 0.2, lShoulderX: 0.4,
                rShoulderZ: -0.2, rShoulderX: 0.4,
                lHipZ: 0.2, lHipX: -0.7,
                rHipZ: -0.2, rHipX: -0.7,
                torsoY: 0.55
            },
            stayCenter: {
                lShoulderZ: -0.8, lShoulderX: 0.2,
                rShoulderZ: 0.8, rShoulderX: 0.2,
                lHipZ: 0.05, lHipX: -0.2,
                rHipZ: -0.05, rHipX: -0.2,
                torsoY: 0.85
            }
        };
        return poses[poseName] || poses['idle'];
    }

    applyPose(poseName, ratio) {
        const pose = this.getPoseAngles(poseName);
        this.leftShoulder.rotation.z = pose.lShoulderZ * ratio;
        this.leftShoulder.rotation.x = pose.lShoulderX * ratio;
        this.rightShoulder.rotation.z = pose.rShoulderZ * ratio;
        this.rightShoulder.rotation.x = pose.rShoulderX * ratio;
        this.leftHip.rotation.z = pose.lHipZ * ratio;
        this.leftHip.rotation.x = pose.lHipX * ratio;
        this.rightHip.rotation.z = pose.rHipZ * ratio;
        this.rightHip.rotation.x = pose.rHipX * ratio;
        this.torso.position.y = pose.torsoY;
    }

    applyPoseTransition(fromPoseName, toPoseName, t) {
        const from = this.getPoseAngles(fromPoseName);
        const to = this.getPoseAngles(toPoseName);
        
        // Linear Interpolate joint angles
        this.leftShoulder.rotation.z = THREE.MathUtils.lerp(from.lShoulderZ, to.lShoulderZ, t);
        this.leftShoulder.rotation.x = THREE.MathUtils.lerp(from.lShoulderX, to.lShoulderX, t);
        
        this.rightShoulder.rotation.z = THREE.MathUtils.lerp(from.rShoulderZ, to.rShoulderZ, t);
        this.rightShoulder.rotation.x = THREE.MathUtils.lerp(from.rShoulderX, to.rShoulderX, t);
        
        this.leftHip.rotation.z = THREE.MathUtils.lerp(from.lHipZ, to.lHipZ, t);
        this.leftHip.rotation.x = THREE.MathUtils.lerp(from.lHipX, to.lHipX, t);
        
        this.rightHip.rotation.z = THREE.MathUtils.lerp(from.rHipZ, to.rHipZ, t);
        this.rightHip.rotation.x = THREE.MathUtils.lerp(from.rHipX, to.rHipX, t);
        
        this.torso.position.y = THREE.MathUtils.lerp(from.torsoY, to.torsoY, t);
    }

    // Save detection algorithm check
    checkBallIntercept(ballPos, ballRadius) {
        if (!this.hasReacted) return false; // Can't block if not reacted yet

        // Goalkeeper's coverage points:
        // Left hand, Right hand, and Torso center.
        // Let's compute world positions for left/right hands and torso center.
        const torsoWorld = new THREE.Vector3();
        this.torso.getWorldPosition(torsoWorld);

        const leftHandWorld = new THREE.Vector3();
        this.leftHand.getWorldPosition(leftHandWorld);

        const rightHandWorld = new THREE.Vector3();
        this.rightHand.getWorldPosition(rightHandWorld);

        // Distance checks
        const distTorso = ballPos.distanceTo(torsoWorld);
        const distLeftHand = ballPos.distanceTo(leftHandWorld);
        const distRightHand = ballPos.distanceTo(rightHandWorld);

        // Combined dynamic hitbox radius
        const handHitbox = this.saveRadius * 0.75;
        const torsoHitbox = this.saveRadius * 0.85;

        if (distLeftHand < (ballRadius + handHitbox) || 
            distRightHand < (ballRadius + handHitbox) || 
            distTorso < (ballRadius + torsoHitbox)) {
            return true;
        }

        return false;
    }
}

// Global Single Instance export
window.GoalkeeperAgent = Goalkeeper;
