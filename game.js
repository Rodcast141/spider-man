AFRAME.registerComponent('spidey-controls', {
  init: function () {
    // Each controller gets its own math data
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.isSwinging = false;
    this.targetPoint = new THREE.Vector3();
    this.currentSuit = 'none';

    // TRIGGER PRESSED (Shoot Web)
    this.el.addEventListener('triggerdown', (e) => {
      const raycaster = this.el.components.raycaster;
      const intersections = raycaster.intersections;

      if (intersections.length > 0) {
        const target = intersections[0].el;

        // 1. Check if we are clicking a suit box in the apartment
        if (target.classList.contains('menu-item')) {
          this.currentSuit = target.id;
          console.log("Suit Active: " + target.id);
          return;
        }

        // 2. Start swinging if we hit a building
        if (target.classList.contains('building')) {
          this.isSwinging = true;
          this.targetPoint.copy(intersections[0].point);
          // Play a web-shoot sound here if you have one!
        }
      }
    });

    // TRIGGER RELEASED (Cut Web)
    this.el.addEventListener('triggerup', () => {
      this.isSwinging = false;
    });
  },

  tick: function (time, delta) {
    const rig = document.querySelector('#rig');
    const dt = delta / 1000; // Convert to seconds

    if (this.isSwinging) {
      // 1. Calculate the pull direction towards the web impact point
      const rigPos = rig.object3D.position;
      const pull = new THREE.Vector3().subVectors(this.targetPoint, rigPos).normalize();
      
      // 2. Apply "Swing Force"
      this.velocity.add(pull.multiplyScalar(0.02));

      // 3. Draw the Web Line (Visible Web)
      this.el.setAttribute('line', {
        start: {x: 0, y: 0, z: 0},
        end: this.el.object3D.worldToLocal(this.targetPoint.clone()),
        opacity: 1,
        color: '#ffffff'
      });
    } else {
      // Hide the web line when not swinging
      this.el.setAttribute('line', 'opacity: 0');
    }

    // 4. PHYSICS ENGINE (Gravity & Friction)
    this.velocity.y -= 0.009; // Gravity
    rig.object3D.position.add(this.velocity);

    // Stop at the ground
    if (rig.object3D.position.y < 0) {
      rig.object3D.position.y = 0;
      this.velocity.set(0, 0, 0);
    }

    // Air Friction (Slows you down so you don't fly forever)
    this.velocity.multiplyScalar(0.99);
  }
});

// --- FAR FROM HOME LOADING SCREEN LOGIC ---
window.addEventListener('load', () => {
  const status = document.getElementById('status-text');
  const startMenu = document.getElementById('start-menu');
  const loader = document.getElementById('loading-screen');
  const playBtn = document.getElementById('play-btn');

  // Simulate EDITH Boot-up
  setTimeout(() => { if(status) status.innerText = "ACCESSING STARK-NET..."; }, 1000);
  setTimeout(() => { if(status) status.innerText = "RECOGNIZING BIOMETRICS..."; }, 2000);
  setTimeout(() => { 
    if(status) {
      status.innerText = "WELCOME HOME, PETER."; 
      status.style.color = "#00ff00    
