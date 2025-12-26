export class Self {
  constructor(p5Instance) {
    this.p = p5Instance;
    this.x = 0; // Position relative to center
    this.y = 0;
    this.speed = 12; // Movement speed in pixels per frame
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
    
    // Mobile tap-to-move target
    this.targetX = null;
    this.isMobile = window.innerWidth <= 767;
    
    // Load all self images
    this.loadImages();
    
    // Handle window resize to rescale character
    window.addEventListener('resize', () => {
      this.targetHeight = window.innerHeight * 0.3;
      if (this.idleFrame && this.idleFrame.height > 0) {
        this.scale = this.targetHeight / this.idleFrame.height;
      }
      // Update mobile detection on resize
      this.isMobile = window.innerWidth <= 767;
    });

    // Setup controls (keyboard for desktop, touch/click for mobile)
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
    // Desktop: Keyboard controls
    if (!this.isMobile) {
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
    } else {
      // Mobile: Touch/click to move
      const handleTap = (e) => {
        // PRIORITY: Check for links/interactive elements FIRST before anything else
        const target = e.target;
        const linkElement = target.closest('a');
        const buttonElement = target.closest('button');
        
        // If clicking on links or buttons, let the browser handle it - don't interfere
        if (linkElement || buttonElement) {
          return; // Let the link handle the click
        }
        
        // Get touch or mouse position
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // Check if click is within stair-container or shader-container bounds using coordinates
        const stairEl = document.querySelector('.stair-container');
        const shaderEl = document.querySelector('#stair-shader-container');
        
        // Check shader container first (actual image size) if it exists
        if (shaderEl) {
          const shaderRect = shaderEl.getBoundingClientRect();
          if (clientX >= shaderRect.left && clientX <= shaderRect.right && 
              clientY >= shaderRect.top && clientY <= shaderRect.bottom) {
            // Click is within shader/image bounds - trigger the link navigation
            e.preventDefault();
            e.stopPropagation();
            if (stairEl) {
              stairEl.click();
            }
            return;
          }
        }
        
        // Fallback: Check stair container bounds
        if (stairEl) {
          const rect = stairEl.getBoundingClientRect();
          if (clientX >= rect.left && clientX <= rect.right && 
              clientY >= rect.top && clientY <= rect.bottom) {
            // Click is within stair bounds - trigger the link navigation
            e.preventDefault();
            e.stopPropagation();
            // Programmatically click the link to navigate
            stairEl.click();
            return;
          }
        }
        
        // Only prevent default if we're actually handling movement (not a link)
        e.preventDefault();
        
        // Convert screen X to world X (relative to center)
        const screenCenterX = window.innerWidth / 2;
        const targetWorldX = clientX - screenCenterX;
        
        // Set target position
        this.targetX = targetWorldX;
        this.isMoving = true;
        
        // Set direction based on target
        this.direction = targetWorldX > this.x ? 1 : -1;
      };
      
      // Add touch and click listeners with lower priority (use capture: false)
      // This allows links to handle clicks first in the bubble phase
      window.addEventListener('touchstart', handleTap, { passive: false, capture: false });
      window.addEventListener('click', handleTap, { capture: false });
    }
  }
  
  update() {
    // Calculate boundaries based on window width and self's width
    const selfImage = this.getCurrentImage();
    const selfWidth = selfImage ? selfImage.width * this.scale : 0;
    const screenCenterX = window.innerWidth / 2;
    const maxLeft = -(screenCenterX - selfWidth / 2);  // Left boundary
    const maxRight = screenCenterX - selfWidth / 2;    // Right boundary
    
    if (this.isMobile && this.targetX !== null) {
      // Mobile: Move towards target position
      const distance = this.targetX - this.x;
      const absDistance = Math.abs(distance);
      
      if (absDistance > 2) {
        // Still moving towards target
        const moveAmount = Math.min(this.speed, absDistance);
        this.x += distance > 0 ? moveAmount : -moveAmount;
        this.direction = distance > 0 ? 1 : -1;
        this.isMoving = true;
      } else {
        // Reached target
        this.x = this.targetX;
        this.targetX = null;
        this.isMoving = false;
        this.currentFrame = 0;
        this.frameCounter = 0;
      }
    } else if (!this.isMobile) {
      // Desktop: Update position based on key states
      if (this.keys.right) {
        this.x = Math.min(this.x + this.speed, maxRight);
        this.direction = 1;
        this.isMoving = true;
      } else if (this.keys.left) {
        this.x = Math.max(this.x - this.speed, maxLeft);
        this.direction = -1;
        this.isMoving = true;
      } else {
        this.isMoving = false;
      }
    }
    
    // Clamp position to boundaries (in case of window resize)
    this.x = Math.max(maxLeft, Math.min(this.x, maxRight));
    
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

