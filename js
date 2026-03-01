// Register a custom A-Frame component for Spidey Physics
AFRAME.registerComponent('spidey-controls', {
    schema: {
        speed: { type: 'number', default: 0.05 },
        gravity: { type: 'number', default: -0.015 }
    },

    init: function () {
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.isSwinging = false;
        this.targetPoint = new THREE.Vector3();
        this.hasSuit = false;
        this.droneCount = 0;

        // Bind events
        this.el.addEventListener('triggerdown', (e) => this.onTriggerDown(e));
        this.el.addEventListener('triggerup', () => this.isSwinging = false);
    },

    onTriggerDown: function (evt) {
        const raycaster = this.el.components.raycaster;
        const hit = raycaster.intersections[0];
        if (!hit) return;

        const target = hit.object.el;

        // Suit Logic
        if (target.id === 'suit-case') {
            this.hasSuit = true;
            target.setAttribute('visible', 'false');
            document.querySelector('.mission-text').style.display = 'block';
            return;
        }

        // Web Zip / Swing Logic
        if (this.hasSuit && (target.classList.contains('building') || target.classList.contains('enemy'))) {
            this.targetPoint.copy(hit.point);
            this.isSwinging = true;
            
            // If it's a drone, give a massive speed boost (The Zip)
            if (target.classList.contains('enemy')) {
                let zipDir = new THREE.Vector3().subVectors(hit.point, this.el.object3D.position).normalize();
                this.velocity.addScaledVector(zipDir, 0.8);
                target.parentNode.removeChild(target); // Destroy drone
                this.updateDroneUI();
            }
        }
    },

    updateDroneUI: function() {
        this.droneCount++;
        document.querySelector('.drone-counter').innerText = `Drones Neutralized: ${this.droneCount}`;
    },

    tick: function (time, delta) {
        const rig = document.querySelector('#rig');
        
        if (this.isSwinging) {
            // Calculate pull direction
            let dir = new THREE.Vector3().subVectors(this.targetPoint, rig.object3D.position).normalize();
            this.velocity.addScaledVector(dir, this.data.speed);
        } else {
            // Apply Gravity
            if (rig.object3D.position.y > 0) {
                this.velocity.y += this.data.gravity;
            }
        }

        // Apply friction (Damping)
        this.velocity.multiplyScalar(0.98);
        
        // Move the player
        rig.object3D.position.add(this.velocity);

        // Ground collision
        if (rig.object3D.position.y < 0) {
            rig.object3D.position.y = 0;
            this.velocity.set(0, 0, 0);
        }
    }
});
