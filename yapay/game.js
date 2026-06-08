// Main Game State Manager and Controller
class GameController {
    constructor() {
        this.renderer = null;
        this.physics = null;
        this.goalkeeper = null;
        this.audio = null;

        // Game State Variables
        this.gameState = 'MENU'; // MENU, READY, BALL_IN_FLIGHT, RESULT, GAMEOVER
        this.difficulty = 'easy'; // easy, medium, hard
        this.gameMode = 'classic'; // classic, target
        
        // Match Statistics
        this.score = 0;
        this.highScore = 0;
        this.shotsTaken = 0;
        this.maxShots = 5;
        this.streak = 0;
        this.bestStreak = 0;
        this.goalsScored = 0;
        this.shotResults = []; // Array of 'goal', 'saved', 'missed' for bullets
        
        // Touch / Mouse Swipe Interaction
        this.dragPoints = [];
        this.isDragging = false;
        this.dragStartTime = 0;
        this.minDragDistance = 45; // Pixels
        
        // Wind Settings
        this.windSpeed = 0;
        this.windDirection = 0; // Angle in radians
        this.windVector = new THREE.Vector3();

        // Target hit detection tracking (Target Practice mode)
        this.targetsHitThisTurn = new Set();

        this.init();
    }

    init() {
        // Link core engine instances
        this.renderer = window.gameSceneRenderer;
        this.physics = window.gamePhysics;
        
        // Instantiate the goalkeeper inside our scene
        this.goalkeeper = new window.GoalkeeperAgent(this.renderer.scene);
        this.audio = window.gameAudio;

        // Bind physics callbacks
        this.physics.onPostHit = () => {
            this.audio.playPost();
            // Spawn sparks at ball position
            this.renderer.spawnParticles(this.physics.position, 12, 0xffe600, 1.2, 'spark');
        };
        
        this.physics.onNetHit = () => {
            this.audio.playNet();
            this.renderer.applyNetBulge(this.physics.position, this.physics.velocity);
        };

        this.physics.onGroundHit = () => {
            // Subtle turf grass spray when bouncing
            this.renderer.spawnParticles(this.physics.position, 4, 0x5a9e32, 0.4, 'spray');
        };

        // Attach DOM UI event listeners
        this.setupMenuUIListeners();
        this.setupSwipeInputListeners();

        // Load Highscore from localStorage
        const savedHigh = localStorage.getItem('penalty_highscore');
        if (savedHigh) {
            this.highScore = parseInt(savedHigh);
        }

        // Start render animation tick
        this.lastTime = performance.now();
        this.animate();
    }

    setupMenuUIListeners() {
        // Play Button Click
        document.getElementById('btn-play').addEventListener('click', () => {
            this.audio.init(); // Initialize audio context on first user interaction
            this.startNewGame();
        });

        // Difficulty Buttons
        const diffButtons = document.querySelectorAll('#difficulty-toggle .btn-toggle');
        diffButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                diffButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                this.goalkeeper.setDifficulty(this.difficulty);
            });
        });

        // Game Mode Select Buttons
        const modeCards = document.querySelectorAll('.mode-card');
        modeCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const target = e.currentTarget;
                modeCards.forEach(c => c.classList.remove('active'));
                target.classList.add('active');
                this.gameMode = target.dataset.mode;
            });
        });

        // Game Over Buttons
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('btn-menu').addEventListener('click', () => {
            this.returnToMenu();
        });
    }

    setupSwipeInputListeners() {
        const container = document.getElementById('game-container');
        
        // HUD interaction block prevent
        const isHUDElement = (el) => {
            return el.closest('.hud-item') || el.closest('.btn-primary') || el.closest('.btn-secondary') || el.closest('.menu-card');
        };

        // Pointer start (unified mouse / touch)
        const onPointerDown = (clientX, clientY, target) => {
            if (this.gameState !== 'READY' || isHUDElement(target)) return;
            
            this.isDragging = true;
            this.dragStartTime = performance.now();
            this.dragPoints = [{ x: clientX, y: clientY, time: this.dragStartTime }];
            this.targetsHitThisTurn.clear();

            // Setup overlay SVG dots
            const startCircle = document.getElementById('swipe-start');
            startCircle.setAttribute('cx', clientX);
            startCircle.setAttribute('cy', clientY);
            startCircle.style.opacity = '1';

            const line = document.getElementById('swipe-line');
            line.setAttribute('x1', clientX);
            line.setAttribute('y1', clientY);
            line.setAttribute('x2', clientX);
            line.setAttribute('y2', clientY);
            line.style.opacity = '0.8';
        };

        // Pointer move
        const onPointerMove = (clientX, clientY) => {
            if (!this.isDragging) return;

            this.dragPoints.push({ x: clientX, y: clientY, time: performance.now() });

            // Update SVG line
            const line = document.getElementById('swipe-line');
            line.setAttribute('x2', clientX);
            line.setAttribute('y2', clientY);

            const endCircle = document.getElementById('swipe-end');
            endCircle.setAttribute('cx', clientX);
            endCircle.setAttribute('cy', clientY);
            endCircle.style.opacity = '1';
        };

        // Pointer end (Kick Trigger)
        const onPointerUp = () => {
            if (!this.isDragging) return;
            this.isDragging = false;

            // Hide overlay visual SVG elements
            document.getElementById('swipe-start').style.opacity = '0';
            document.getElementById('swipe-end').style.opacity = '0';
            document.getElementById('swipe-line').style.opacity = '0';

            if (this.dragPoints.length < 2) return;

            this.resolveSwipeKick();
        };

        // Mouse Bindings
        container.addEventListener('mousedown', (e) => {
            onPointerDown(e.clientX, e.clientY, e.target);
        });
        window.addEventListener('mousemove', (e) => {
            onPointerMove(e.clientX, e.clientY);
        });
        window.addEventListener('mouseup', () => {
            onPointerUp();
        });

        // Touch Bindings
        container.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            onPointerDown(touch.clientX, touch.clientY, e.target);
        }, { passive: true });
        
        window.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const touch = e.touches[0];
            onPointerMove(touch.clientX, touch.clientY);
        }, { passive: true });

        window.addEventListener('touchend', () => {
            onPointerUp();
        });
    }

    startNewGame() {
        this.score = 0;
        this.shotsTaken = 0;
        this.streak = 0;
        this.goalsScored = 0;
        this.shotResults = [];
        this.maxShots = this.gameMode === 'classic' ? 5 : 7; // Target mode has 7 shots
        
        // Hide menus, show HUD
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('game-hud').classList.remove('hidden');

        // Draw targets if in target mode
        if (this.gameMode === 'target') {
            this.renderer.spawnTargets();
        } else {
            this.renderer.clearTargets();
        }

        this.updateHUD();
        this.resetTurn();
    }

    resetTurn() {
        this.gameState = 'READY';
        
        // Reset physics and goalkeeper poses
        this.physics.reset(new THREE.Vector3(0, this.physics.radius, 11));
        this.goalkeeper.reset();
        
        // Camera back behind the ball
        this.renderer.setCameraState('behindBall', false);
        
        // Generate random wind
        this.generateWind();
        
        // Reset instructional prompt
        const instruction = document.getElementById('hud-instruction');
        instruction.textContent = "Topu kaleye fırlatmak için sürükle!";
        instruction.style.opacity = '1';

        // Play Referee Whistle!
        setTimeout(() => {
            if (this.gameState === 'READY') {
                this.audio.playWhistle();
            }
        }, 600);
    }

    generateWind() {
        // High wind only on medium/hard difficulty
        if (this.difficulty === 'easy') {
            this.windSpeed = 0;
            this.windVector.set(0, 0, 0);
        } else {
            const maxWind = this.difficulty === 'hard' ? 4.8 : 2.5;
            this.windSpeed = parseFloat((Math.random() * maxWind).toFixed(1));
            this.windDirection = Math.random() * Math.PI * 2; // Full angle
            
            // X and Z coordinates of wind force
            const wx = Math.sin(this.windDirection) * this.windSpeed * 0.15; // Scaled down to feel realistic
            const wz = Math.cos(this.windDirection) * this.windSpeed * 0.05;
            this.windVector.set(wx, 0, wz);
        }

        // Update HUD wind UI elements
        const arrow = document.getElementById('wind-arrow');
        const speedText = document.getElementById('wind-speed');
        
        if (this.windSpeed > 0) {
            speedText.textContent = `${this.windSpeed} m/s`;
            // Rotate wind arrow graphic matching wind direction angle
            arrow.style.transform = `rotate(${this.windDirection * (180 / Math.PI)}deg)`;
            arrow.style.opacity = '1';
        } else {
            speedText.textContent = `Sakin`;
            arrow.style.opacity = '0';
        }
    }

    resolveSwipeKick() {
        const start = this.dragPoints[0];
        const end = this.dragPoints[this.dragPoints.length - 1];
        const duration = end.time - start.time;

        const dx = end.x - start.x;
        const dy = start.y - end.y; // Y is inverted on screen coordinates
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Cancel if user just tapped or swiped tiny distance
        if (dist < this.minDragDistance || duration < 30) return;

        // Hide swiping help guide text
        document.getElementById('hud-instruction').style.opacity = '0';

        // --- 1. Compute velocity vectors from swipe ---
        // Map horizontal swiping swipe to X angle deflection (inner posts are at X=-3.66, 3.66)
        const scaleX = 0.024;
        const vx = dx * scaleX;

        // Map vertical swiping swipe to Y angle loft (crossbar is at Y=2.44)
        const scaleY = 0.022;
        const vy = Math.max(1.0, dy * scaleY); // Ensure it rises

        // Calculate power (Z speed) scaled by how fast the user dragged
        const swipeSpeed = dist / duration; // pixels per ms
        let speed = 15 + swipeSpeed * 15; // Base speed + swipe acceleration scaling
        speed = Math.max(16, Math.min(speed, 35)); // Cap velocities (16m/s to 35m/s)

        // Calculate Z velocity towards goal (penalty spot Z=11 to goal Z=0)
        // Normalize velocity vector and scale by speed
        const velocity = new THREE.Vector3(vx, vy, -25);
        velocity.normalize().multiplyScalar(speed);

        // --- 2. Calculate Swiping Curve (Magnus effect sidespin) ---
        let sidespin = 0;
        if (this.dragPoints.length > 4) {
            // Find line equation coefficients (Ax + By + C = 0) of the chord connecting start to end
            const A = end.y - start.y;
            const B = start.x - end.x;
            const C = end.x * start.y - start.x * end.y;
            const chordLength = Math.sqrt(A * A + B * B);
            
            // Loop through points to find the max perpendicular offset deviation
            let maxOffset = 0;
            if (chordLength > 0.01) {
                this.dragPoints.forEach(p => {
                    const dist = (A * p.x + B * p.y + C) / chordLength;
                    if (Math.abs(dist) > Math.abs(maxOffset)) {
                        maxOffset = dist;
                    }
                });
            }

            // Curve spin coefficient scaling
            const spinScale = 0.08;
            sidespin = -maxOffset * spinScale; // Invert to follow realistic slice aerodynamics
            
            // Cap maximum curvature spin
            sidespin = Math.max(-18, Math.min(sidespin, 18));
        }

        const spin = new THREE.Vector3(0, sidespin, 0); // Primary sidespin on Y axis

        // --- 3. Compute predicted ball trajectory intersection with goal plane Z=0 ---
        // Used to guide Goalkeeper AI response
        const predIntersect = this.predictZ0Intersection(new THREE.Vector3(0, this.physics.radius, 11), velocity, spin, this.windVector);

        // --- 4. Launch ball ---
        this.physics.kick(velocity, spin, this.windVector);
        this.goalkeeper.onBallKicked(predIntersect, speed);

        // Play Kick sound thud!
        this.audio.playKick();
        
        // Spawn green grass turf particles burst
        this.renderer.spawnParticles(new THREE.Vector3(0, 0.05, 11), 18, 0x489622, 1.0, 'spray');

        // Set camera follow shot mode
        this.renderer.setCameraState('followShot');
        this.gameState = 'BALL_IN_FLIGHT';
        this.shotsTaken++;
    }

    // Mathematical integration simulation to predict where the ball will pass Z=0
    predictZ0Intersection(startPos, startVel, spin, windVec) {
        const p = startPos.clone();
        const v = startVel.clone();
        const s = spin.clone();
        const dt = 0.02; // Small simulation step

        // Sim loop until it crosses goal plane
        for (let i = 0; i < 150; i++) {
            if (p.z <= 0) break;
            
            const acc = new THREE.Vector3(0, this.physics.gravity, 0);
            acc.add(v.clone().multiplyScalar(-this.physics.dragCoeff));
            
            const magnus = new THREE.Vector3().crossVectors(s, v).multiplyScalar(this.physics.magnusCoeff);
            acc.add(magnus);
            acc.add(windVec);

            v.addScaledVector(acc, dt);
            p.addScaledVector(v, dt);
            s.multiplyScalar(Math.exp(-0.4 * dt));

            if (p.y <= this.physics.radius) break; // Hits ground
        }
        return p;
    }

    updateGameLoop(dt) {
        if (this.gameState === 'BALL_IN_FLIGHT') {
            // Check Goalkeeper block interception
            if (this.goalkeeper.checkBallIntercept(this.physics.position, this.physics.radius)) {
                // SAVE!
                this.resolveTurnResult('saved');
                return;
            }

            // Check Target Practice scoring hits during flight
            if (this.gameMode === 'target' && this.renderer.targetRings.length > 0) {
                this.checkTargetRingHits();
            }

            // Check if ball passed goal plane Z = 0
            if (this.physics.position.z <= 0) {
                const isInsideX = this.physics.position.x > this.physics.leftPostX && this.physics.position.x < this.physics.rightPostX;
                const isInsideY = this.physics.position.y > 0 && this.physics.position.y < this.physics.crossbarY;

                if (isInsideX && isInsideY) {
                    this.resolveTurnResult('goal');
                } else {
                    this.resolveTurnResult('missed');
                }
            } else if (this.physics.velocity.length() < 0.25 && this.physics.position.y <= this.physics.radius + 0.02) {
                // Ball stopped short before reaching goal line
                this.resolveTurnResult('missed');
            }
        }
    }

    checkTargetRingHits() {
        this.renderer.targetRings.forEach(ring => {
            if (this.targetsHitThisTurn.has(ring.userData.name)) return;

            // Distance from center of gold ring to ball center
            const dist = this.physics.position.distanceTo(ring.position);
            // 0.32m ring radius, check if center overlap bounds
            if (dist < 0.38) {
                this.targetsHitThisTurn.add(ring.userData.name);
                
                // Explode target ring mesh
                this.renderer.spawnParticles(ring.position, 25, 0xffcc00, 1.4, 'spark');
                
                // Remove visual ring
                this.renderer.scene.remove(ring);
                // Flag to remove from registry later
                ring.userData.hit = true;

                // Grant double target point hit sound trigger
                this.audio.playPost(); // Metallic clank sound
                
                // Temporary floating hit text or point indicator
                this.showTargetHitAlert(ring.userData.name);
            }
        });

        // Filter out hit targets
        this.renderer.targetRings = this.renderer.targetRings.filter(ring => {
            if (ring.userData.hit) {
                ring.geometry.dispose();
                ring.material.dispose();
                return false;
            }
            return true;
        });

        // Respawn targets if all are hit
        if (this.renderer.targetRings.length === 0) {
            setTimeout(() => {
                if (this.gameMode === 'target' && this.gameState === 'READY') {
                    this.renderer.spawnTargets();
                }
            }, 1000);
        }
    }

    showTargetHitAlert(name) {
        const feedback = document.getElementById('feedback-screen');
        const title = document.getElementById('feedback-text');
        const desc = document.getElementById('feedback-subtitle');

        title.textContent = "TAM İSABET!";
        title.className = "feedback-title goal-text";
        desc.textContent = `🎯 Hedef ${name} vuruldu! +300 Puan`;
        
        feedback.classList.remove('hidden');
        setTimeout(() => feedback.classList.add('hidden'), 1000);
    }

    resolveTurnResult(result) {
        this.gameState = 'RESULT';
        
        let scoreGain = 0;
        let finalFeedbackText = "";
        let feedbackClass = "";

        if (result === 'goal') {
            this.goalsScored++;
            this.streak++;
            this.bestStreak = Math.max(this.bestStreak, this.streak);
            
            // Score calculation: 100 base * current streak multiplier
            scoreGain = 100 * this.streak;
            
            // Apply targets hit multiplier
            if (this.gameMode === 'target' && this.targetsHitThisTurn.size > 0) {
                scoreGain += 300 * this.targetsHitThisTurn.size;
            }

            this.score += scoreGain;

            finalFeedbackText = "GOOL!";
            feedbackClass = "feedback-title goal-text";
            
            this.shotResults.push('goal');
            
            // Cheer crowd sound
            this.audio.playCheer();

            // Spawn goal fireworks/confetti particles at goal center
            this.renderer.spawnParticles(new THREE.Vector3(0, 1.5, -0.5), 50, 0x39ff14, 1.0, 'confetti');
            this.renderer.spawnParticles(new THREE.Vector3(-2.5, 1.8, -0.5), 30, 0x00d2ff, 1.2, 'confetti');
            this.renderer.spawnParticles(new THREE.Vector3(2.5, 1.8, -0.5), 30, 0xff0055, 1.2, 'confetti');

        } else if (result === 'saved') {
            this.streak = 0;
            finalFeedbackText = "KURTARIŞ!";
            feedbackClass = "feedback-title saved-text";
            this.shotResults.push('saved');
            
            // Deflect ball physics away from goal
            this.physics.velocity.set(
                (Math.random() * 2 - 1) * 6,
                (Math.random() * 5 + 3),
                (Math.random() * 6 + 6) // bounce back forward
            );
            
            // Groan crowd sound
            this.audio.playGroan();

        } else { // Missed (out/post bounce away)
            this.streak = 0;
            finalFeedbackText = "DIŞARI!";
            feedbackClass = "feedback-title missed-text";
            this.shotResults.push('missed');
            
            // Groan crowd sound
            this.audio.playGroan();
        }

        // Show Feedback Overlay
        const feedback = document.getElementById('feedback-screen');
        const title = document.getElementById('feedback-text');
        const desc = document.getElementById('feedback-subtitle');

        title.textContent = finalFeedbackText;
        title.className = feedbackClass;
        
        if (result === 'goal') {
            desc.textContent = `+${scoreGain} Puan (x${this.streak} Seri)`;
        } else {
            desc.textContent = `Seri sıfırlandı`;
        }

        feedback.classList.remove('hidden');

        // Update HUD
        this.updateHUD();

        // Turn loop timing transition
        setTimeout(() => {
            feedback.classList.add('hidden');
            
            if (this.shotsTaken >= this.maxShots) {
                this.endGame();
            } else {
                this.resetTurn();
            }
        }, 2200);
    }

    updateHUD() {
        // Score leading zeros padding (0000)
        const scoreStr = String(this.score).padStart(4, '0');
        document.getElementById('hud-score').textContent = scoreStr;
        
        // Streak indicator
        document.getElementById('hud-streak').textContent = `x${this.streak}`;

        // Shot bullets update
        const container = document.getElementById('hud-shots');
        container.innerHTML = "";

        for (let i = 0; i < this.maxShots; i++) {
            const bullet = document.createElement('div');
            bullet.className = "shot-bullet";
            
            if (i < this.shotsTaken) {
                const res = this.shotResults[i];
                if (res === 'goal') {
                    bullet.classList.add('goal');
                } else if (res === 'saved' || res === 'missed') {
                    bullet.classList.add('missed');
                }
            } else if (i === this.shotsTaken && this.gameState === 'READY') {
                bullet.classList.add('active');
            }
            container.appendChild(bullet);
        }
    }

    endGame() {
        this.gameState = 'GAMEOVER';
        
        // Save HighScore
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('penalty_highscore', this.highScore);
        }

        // Camera cinematic swoop
        this.renderer.setCameraState('cinematic');

        // Fill Stats Panel elements
        document.getElementById('final-score').textContent = this.score;
        
        const ratio = this.shotsTaken > 0 ? Math.round((this.goalsScored / this.shotsTaken) * 100) : 0;
        document.getElementById('final-ratio').textContent = `${ratio}%`;
        document.getElementById('final-streak').textContent = this.bestStreak;

        // Overlay swaps
        document.getElementById('game-hud').classList.add('hidden');
        document.getElementById('game-over-screen').classList.remove('hidden');
    }

    returnToMenu() {
        this.gameState = 'MENU';
        this.renderer.clearTargets();
        
        // Reset view back behind spot
        this.renderer.setCameraState('behindBall', true);
        this.physics.reset(new THREE.Vector3(0, this.physics.radius, 11));
        this.goalkeeper.reset();

        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('game-hud').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
    }

    // Animation Tick Frame Loop
    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const dt = (now - this.lastTime) / 1000; // Delta seconds
        this.lastTime = now;

        // Update physics kinematic solver
        if (this.gameState === 'BALL_IN_FLIGHT' || this.gameState === 'RESULT') {
            this.physics.update(dt);
        }

        // Update goalkeeper AI poses and translations
        const isBallFlight = this.gameState === 'BALL_IN_FLIGHT';
        this.goalkeeper.update(dt, this.physics.position, isBallFlight);

        // Custom game scoring triggers (saves, target rings, bounds check)
        this.updateGameLoop(dt);

        // Update Three.js scene renderer (cameras, particles, mesh locations)
        this.renderer.update(dt, this.physics.position, this.physics.velocity);
    }
}

// Instantiate Global Game Orchestrator once document loaded
window.addEventListener('DOMContentLoaded', () => {
    // Initialise Three.js Canvas viewport renderer
    window.gameSceneRenderer = new window.GameSceneRenderer('game-canvas');
    // Start controller
    window.gameController = new GameController();
});
