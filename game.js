AFRAME.registerComponent('spidey-controls', {
  schema: {
    speed: { type: 'number', default: 0.1 },
    gravity: { type: 'number', default: -0.015 },
    swingForce: { type: 'number', default: 0.02 }
  },

  init: function () {
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.isSwinging = false;
    this.currentSuit = 'none'; // No suit at start
    this.activeMission = 'none';

    // Interaction Listeners
    this.el.addEventListener('triggerdown', (e) => this.onTriggerDown(e));
    this.el.addEventListener('triggerup', () => { this.isSwinging = false; });
    
    console.log("Spidey Systems Online: The One and Only Game VR");
  },

  onTriggerDown: function (evt) {
    const raycaster = this.el.components.raycaster;
    const intersections = raycaster.intersections;

    if (intersections.length > 0) {
      const target = intersections[0].el;

      // --- SUIT SELECTION LOGIC ---
      if (target.classList.contains('menu-item')) {
        this.currentSuit = target.id;
        this.equipSuit(target.id);
        return;
      }

      // --- SWINGING LOGIC (Only works if you have a suit!) ---
      if (target.classList.contains('building') && this.currentSuit !== 'none') {
        this.isSwinging = true;
        this.targetPoint = intersections[0].point;
        
        // Visual Feedback for Web Line
        this.el.setAttribute('line', {
            start: {x: 0, y: 0, z: 0},
            end: this.el.object3D.worldToLocal(this.targetPoint.clone()),
            color: (this.currentSuit === 'hoodie-suit') ? '#ff0000' : '#ffffff',
            opacity: 1
        });
      }
    }
  },

  equipSuit: function (suitId) {
    const hand = this.el;
    console.log("Equipping: " + suitId);
    
    if (suitId === 'hoodie-suit') {
      // ITSV Mozzarella Look: Red Web
      hand.setAttribute('line', 'color: #ff0000; opacity: 0.8');
    } else if (suitId === 'insomniac-suit') {
      // Insomniac Miles Look: White/Blue tech web
      hand.setAttribute('line', 'color: #ffffff; opacity: 0.8');
    } else if (suitId === 'collider-suit') {
      // Collider Look: Glitchy electricity
      hand.setAttribute('line', 'color: #ffff00; opacity: 0.9');
    }
  },

  tick: function (time, timeDelta) {
    const rig = document.querySelector('#rig');
    const pos = rig.object3D.position;

    // 1. SWINGING PHYSICS
    if (this.isSwinging) {
      const pull = new THREE.Vector3().subVectors(this.targetPoint, pos).normalize();
      this.velocity.add(pull.multiplyScalar(this.data.swingForce));
      
      // Update Web Line visual
      const localTarget = this.el.object3D.worldToLocal(this.targetPoint.clone());
      this.el.setAttribute('line', 'end', localTarget);
    } else {
      // Hide line when not swinging
      this.el.setAttribute('line', 'opacity: 0');
    }

    // 2. GRAVITY & VELOCITY
    this.velocity.y += this.data.gravity;
    pos.add(this.velocity);

    // 3. FLOOR COLLISION (So you don't fall forever)
    if (pos.y < 0) {
      pos.y = 0;
      this.velocity.set(0, 0, 0);
    }

    // 4. AIR FRICTION (Slows you down slightly)
    this.velocity.multiplyScalar(0.98);
  }
});
