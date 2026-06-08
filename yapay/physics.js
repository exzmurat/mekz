// 3D Kinematics and Physics Solver for 3D Football Penalty Game
class BallPhysics {
    constructor() {
        this.radius = 0.11; // 11cm standard size 5 football
        
        // Physics environment parameters
        this.gravity = -9.81; // m/s^2
        this.dragCoeff = 0.15; // Air resistance coefficient
        this.magnusCoeff = 0.08; // Curve spin coefficient
        this.bounceRestitution = 0.55; // Ground bounce elasticity
        this.postRestitution = 0.5; // Post bounce elasticity
        
        // Goal Dimensions
        this.goalWidth = 7.32;
        this.goalHeight = 2.44;
        this.goalDepth = 1.8;
        this.postRadius = 0.08;
        
        // Left/Right post positions on X axis
        this.leftPostX = -this.goalWidth / 2;
        this.rightPostX = this.goalWidth / 2;
        this.crossbarY = this.goalHeight;
        
        // State
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.spin = new THREE.Vector3(); // x: topspin/backspin, y: sidespin, z: spiral
        this.wind = new THREE.Vector3(); // Wind vector
        
        this.isKicked = false;
        this.hasCollidedWithPost = false;
        this.hasCollidedWithNet = false;
        this.hasCollidedWithGround = false;
        
        // Collision callback triggers
        this.onPostHit = null;
        this.onNetHit = null;
        this.onGroundHit = null;
    }

    reset(startPos) {
        this.position.copy(startPos || new THREE.Vector3(0, this.radius, 11));
        this.velocity.set(0, 0, 0);
        this.spin.set(0, 0, 0);
        this.isKicked = false;
        this.hasCollidedWithPost = false;
        this.hasCollidedWithNet = false;
        this.hasCollidedWithGround = false;
    }

    kick(velocity, spin, wind) {
        this.velocity.copy(velocity);
        this.spin.copy(spin);
        if (wind) this.wind.copy(wind);
        this.isKicked = true;
    }

    setWind(windVec) {
        this.wind.copy(windVec);
    }

    update(dt) {
        if (!this.isKicked) return;

        // Cap dt to prevent massive steps during lag spikes
        dt = Math.min(dt, 0.03);

        // --- 1. Force Calculations (Gravity + Air Drag + Magnus Effect + Wind) ---
        const velocityLength = this.velocity.length();
        const acceleration = new THREE.Vector3(0, this.gravity, 0);

        if (velocityLength > 0.01) {
            // Drag Force: F_drag = -c_drag * v
            const dragForce = this.velocity.clone().multiplyScalar(-this.dragCoeff);
            acceleration.add(dragForce);

            // Magnus Effect (Spin Curve): F_magnus = c_magnus * (spin x velocity)
            const magnusForce = new THREE.Vector3().crossVectors(this.spin, this.velocity);
            magnusForce.multiplyScalar(this.magnusCoeff);
            acceleration.add(magnusForce);
            
            // Wind acceleration (affects ball dynamically based on direction)
            acceleration.add(this.wind);
        }

        // --- 2. Semi-Implicit Euler Integration ---
        this.velocity.addScaledVector(acceleration, dt);
        this.position.addScaledVector(this.velocity, dt);

        // Slow down spin gradually due to air friction
        this.spin.multiplyScalar(Math.exp(-0.4 * dt));

        // --- 3. Collision Resolution ---
        this.resolveGroundCollision();
        this.resolveGoalPostCollisions();
        this.resolveNetCollisions();
    }

    resolveGroundCollision() {
        // Simple ground collision
        if (this.position.y < this.radius) {
            this.position.y = this.radius;
            
            // Bounce: Reverse vertical velocity, apply restitution
            if (this.velocity.y < -0.5) {
                this.velocity.y = -this.velocity.y * this.bounceRestitution;
                // Add minor horizontal damping
                this.velocity.x *= 0.8;
                this.velocity.z *= 0.8;
                
                if (this.onGroundHit && !this.hasCollidedWithGround) {
                    this.onGroundHit();
                }
            } else {
                // Ball rolling on ground
                this.velocity.y = 0;
                this.velocity.x *= 0.95; // Ground friction rolling drag
                this.velocity.z *= 0.95;
            }
        }
    }

    resolveGoalPostCollisions() {
        if (this.hasCollidedWithNet) return; // Net absorbs ball, stop checking hard posts

        // Post Cylinders are along Y axis (left at X=-3.66, Z=0, right at X=3.66, Z=0)
        // Crossbar is along X axis (Y=2.44, Z=0, from X=-3.66 to X=3.66)
        
        // 1. Left Post Collision
        this.checkCylinderCollision(this.leftPostX, 0, 0, 2.44, 'y');

        // 2. Right Post Collision
        this.checkCylinderCollision(this.rightPostX, 0, 0, 2.44, 'y');

        // 3. Crossbar Collision
        this.checkCylinderCollision(0, this.crossbarY, 0, this.goalWidth, 'x');
    }

    checkCylinderCollision(offsetX, offsetY, offsetZ, length, axis) {
        let normal = new THREE.Vector3();
        let penetration = 0;
        let isHit = false;

        const totalRadius = this.radius + this.postRadius;

        if (axis === 'y') {
            // Post: vertical cylinder from Y = 0 to length (Y=2.44) at X = offsetX, Z = offsetZ
            if (this.position.y >= -this.radius && this.position.y <= length + this.radius) {
                // Distance in XZ plane
                const dx = this.position.x - offsetX;
                const dz = this.position.z - offsetZ;
                const distXZ = Math.sqrt(dx * dx + dz * dz);
                
                if (distXZ < totalRadius) {
                    isHit = true;
                    penetration = totalRadius - distXZ;
                    
                    // Normal in XZ plane
                    normal.set(dx, 0, dz).normalize();
                    
                    // Cap position outside post
                    this.position.addScaledVector(normal, penetration);
                }
            }
        } else if (axis === 'x') {
            // Crossbar: horizontal cylinder from X = -length/2 to length/2 at Y = offsetY, Z = offsetZ
            if (this.position.x >= -length/2 - this.radius && this.position.x <= length/2 + this.radius) {
                // Distance in YZ plane
                const dy = this.position.y - offsetY;
                const dz = this.position.z - offsetZ;
                const distYZ = Math.sqrt(dy * dy + dz * dz);
                
                if (distYZ < totalRadius) {
                    isHit = true;
                    penetration = totalRadius - distYZ;
                    
                    // Normal in YZ plane
                    normal.set(0, dy, dz).normalize();
                    
                    // Cap position outside crossbar
                    this.position.addScaledVector(normal, penetration);
                }
            }
        }

        if (isHit) {
            // Reflect velocity: v_new = v - (1 + e) * (v . n) * n
            const dot = this.velocity.dot(normal);
            if (dot < 0) { // Moving towards the cylinder
                this.velocity.addScaledVector(normal, -(1 + this.postRestitution) * dot);
                
                // Add spin impact bounce effect
                this.velocity.x += this.spin.y * 0.05;
                
                if (this.onPostHit) {
                    this.onPostHit();
                }
                this.hasCollidedWithPost = true;
            }
        }
    }

    resolveNetCollisions() {
        // Goal net boundary (box behind goal line)
        // Goal line is Z = 0. Net extends to Z = -this.goalDepth (-1.8m).
        // Left is X = -3.66, Right is X = 3.66. Top is Y = 2.44.
        
        // If ball passes behind goal line
        if (this.position.z <= 0) {
            // Check if it's inside the goal frame (GOAL!)
            const isInsideWidth = this.position.x > this.leftPostX && this.position.x < this.rightPostX;
            const isInsideHeight = this.position.y > 0 && this.position.y < this.crossbarY;

            if (isInsideWidth && isInsideHeight) {
                // Collide with Back Net (Z = -this.goalDepth)
                if (this.position.z < -this.goalDepth + this.radius) {
                    this.position.z = -this.goalDepth + this.radius;
                    this.velocity.z = -this.velocity.z * 0.15; // High dampening
                    this.velocity.x *= 0.5;
                    this.velocity.y *= 0.5;
                    
                    if (this.onNetHit && !this.hasCollidedWithNet) {
                        this.onNetHit();
                    }
                    this.hasCollidedWithNet = true;
                }
                
                // Collide with Side Nets (X = leftPostX or rightPostX)
                if (this.position.z < -0.1) { // Only collide with side nets behind the posts
                    const wallThreshold = this.radius;
                    if (this.position.x < this.leftPostX + wallThreshold) {
                        this.position.x = this.leftPostX + wallThreshold;
                        this.velocity.x = -this.velocity.x * 0.15;
                        this.velocity.z *= 0.5;
                        if (this.onNetHit && !this.hasCollidedWithNet) this.onNetHit();
                        this.hasCollidedWithNet = true;
                    } else if (this.position.x > this.rightPostX - wallThreshold) {
                        this.position.x = this.rightPostX - wallThreshold;
                        this.velocity.x = -this.velocity.x * 0.15;
                        this.velocity.z *= 0.5;
                        if (this.onNetHit && !this.hasCollidedWithNet) this.onNetHit();
                        this.hasCollidedWithNet = true;
                    }
                }

                // Collide with Top Net (Y = crossbarY)
                if (this.position.z < -0.1 && this.position.y > this.crossbarY - this.radius) {
                    this.position.y = this.crossbarY - this.radius;
                    this.velocity.y = -this.velocity.y * 0.15;
                    this.velocity.z *= 0.5;
                    if (this.onNetHit && !this.hasCollidedWithNet) this.onNetHit();
                    this.hasCollidedWithNet = true;
                }
            } else {
                // Out of bounds / Missed (Z went past goal line, but not through frame)
                // Let the ball roll/bounce in space naturally.
            }
        }
    }
}

// Global Single Instance
const physics = new BallPhysics();
window.gamePhysics = physics;
