export class Self {
  constructor(p5Instance) {
    this.p = p5Instance;
    this.x = 0; // Position relative to center
    this.y = 0;
    this.speed = 5; // Movement speed in pixels per frame
    this.isMoving = false;
    this.direction = 1; // 1 for right, -1 for left
    this.currentFrame = 0;
    this.frameDelay = 5; // Frames to wait before switching animation frame
    this.frameCounter = 0;
    
    // Scale to 30% of viewport height (matching previous self0 size)
    this.targetHeight = window.innerHeight * 0.3;
    this.scale = 1;
    
    // Animation frames
    this.frames = [];
    this.idleFrame = null;
    
    // Key states
    this.keys = {
      left: false,
      right: false
    };
    
    // Load all self images
    this.loadImages();
    
    // Handle window resize to rescale character
    window.addEventListener('resize', () => {
      this.targetHeight = window.innerHeight * 0.3;
      if (this.idleFrame && this.idleFrame.height > 0) {
        this.scale = this.targetHeight / this.idleFrame.height;
      }
    });

    // Setup keyboard controls
    this.setupControls();
  }
  
  loadImages() {
    // Load idle frame (self0)
    this.idleFrame = this.p.loadImage('/assets/images/self/self0.PNG', () => {
      // Calculate scale once image is loaded
      if (this.idleFrame.height > 0) {
        this.scale = this.targetHeight / this.idleFrame.height;
      }
    });
    
    // Load animation frames (self1, self2, self3) - lowercase .png
    for (let i = 1; i <= 3; i++) {
      this.frames.push(this.p.loadImage(`/assets/images/self/self${i}.png`));
    }
  }
  
  setupControls() {
    // Listen for arrow key presses
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        this.keys.right = true;
        this.direction = 1;
        this.isMoving = true;
      } else if (e.key === 'ArrowLeft') {
        this.keys.left = true;
        this.direction = -1;
        this.isMoving = true;
      }
    });
    
    // Listen for arrow key releases
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowRight') {
        this.keys.right = false;
      } else if (e.key === 'ArrowLeft') {
        this.keys.left = false;
      }
      
      // Stop moving if no keys are pressed
      if (!this.keys.left && !this.keys.right) {
        this.isMoving = false;
        this.currentFrame = 0;
        this.frameCounter = 0;
      }
    });
  }
  
  update() {
    // Update position based on key states
    if (this.keys.right) {
      this.x += this.speed;
      this.direction = 1;
      this.isMoving = true;
    } else if (this.keys.left) {
      this.x -= this.speed;
      this.direction = -1;
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }
    
    // Update animation frame
    if (this.isMoving) {
      this.frameCounter++;
      if (this.frameCounter >= this.frameDelay) {
        this.frameCounter = 0;
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      }
    } else {
      this.currentFrame = 0;
      this.frameCounter = 0;
    }
  }
  
  draw() {
    // Drawing is now handled by the shader in self0Shader.js
    // This method is kept for compatibility but does nothing
    // The shader applies to whatever getCurrentImage() returns
  }
  
  getPosition() {
    return { x: this.x, y: this.y };
  }
  
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  
  getCurrentImage() {
    // Return the current frame being displayed
    if (this.isMoving && this.frames.length > 0 && this.frames[this.currentFrame]) {
      return this.frames[this.currentFrame];
    } else if (this.idleFrame) {
      return this.idleFrame;
    }
    return null;
  }
}

