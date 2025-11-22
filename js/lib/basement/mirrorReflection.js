/**
 * Mirror Reflection Effect
 * Shows self4.png in the mirror with static glitch overlay
 */

export function initMirrorReflection(selfInstance, selfShader) {
  const mirrorContainer = document.querySelector('.mirror-container');
  const mirrorReflection = document.getElementById('mirrorReflection');
  
  if (!mirrorContainer || !mirrorReflection) {
    console.error('Mirror elements not found');
    return;
  }
  
  // Use purpleStatic from window (set in basement.html)
  const purpleStatic = window.purpleStatic;
  
  // Create a separate static overlay canvas element
  // Place it inside mirrorReflection to match the reflection bounds
  const staticOverlay = document.createElement('div');
  staticOverlay.className = 'mirror-static-overlay';
  mirrorReflection.appendChild(staticOverlay);
  
  // Function to check if self is within mirror's horizontal range
  const isSelfInMirrorRange = () => {
    const mirrorRect = mirrorContainer.getBoundingClientRect();
    const selfContainer = document.getElementById('self-shader-container');
    
    if (!selfContainer) return false;
    
    const selfContainerRect = selfContainer.getBoundingClientRect();
    // Self's x position is relative to center of canvas (0,0 in WEBGL)
    // Canvas center is at screen center, so self's screen position = screen center + self.x
    const screenCenterX = window.innerWidth / 2;
    const selfScreenX = screenCenterX + selfInstance.x;
    
    // Get self's width (scaled)
    const selfImage = selfInstance.getCurrentImage();
    if (!selfImage || selfImage.width === 0) return false;
    
    const selfWidth = selfImage.width * selfInstance.scale;
    const selfLeft = selfScreenX - selfWidth / 2;
    const selfRight = selfScreenX + selfWidth / 2;
    
    // Check if self overlaps with mirror's horizontal range
    const mirrorLeft = mirrorRect.left;
    const mirrorRight = mirrorRect.right;
    
    return (selfRight >= mirrorLeft && selfLeft <= mirrorRight);
  };
  
  // Setup p5 sketch for reflection (image only)
  const sketch = function(p) {
    let self4Image = null;
    
    p.preload = function() {
      // Load self4.png for mirror reflection
      self4Image = p.loadImage('/assets/images/self/self4.PNG');
    };
    
    p.setup = function() {
      const rect = mirrorContainer.getBoundingClientRect();
      const canvasWidth = rect.width > 0 ? rect.width : window.innerWidth * 0.1;
      const canvasHeight = rect.height > 0 ? rect.height : window.innerHeight * 0.3;
      
      // Main canvas for the image
      const canvas = p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
      canvas.parent(mirrorReflection);
      p.textureMode(p.NORMAL);
    };
    
    p.draw = function() {
      p.clear();
      
      if (!self4Image || self4Image.width === 0) {
        return;
      }
      
      // Check if self is in mirror range
      const inRange = isSelfInMirrorRange();
      
      // Update active class for CSS transition
      if (inRange) {
        mirrorReflection.classList.add('active');
      } else {
        mirrorReflection.classList.remove('active');
      }
      
      // Always draw the image (CSS opacity handles the fade)
      // This allows the CSS transition to work properly
      // Calculate scale
      const scale = selfInstance.scale;
      const scaledWidth = self4Image.width * scale;
      const scaledHeight = self4Image.height * scale;
      
      // Position image so bottom 1/3 is visible in mirror
      // In WEBGL, Y=0 is center, positive Y is up
      // We want the bottom 1/3 of the image to be in the mirror
      // So we translate down by (scaledHeight/2 - scaledHeight/6) = scaledHeight/3
      // This positions the image so its bottom third is centered at Y=0
      const translateY = scaledHeight / 3;
      
      // Draw the image
      p.push();
      p.translate(0, translateY, 0);
      p.noStroke();
      p.texture(self4Image);
      p.rectMode(p.CENTER);
      p.rect(0, 0, scaledWidth, scaledHeight);
      p.pop();
    };
    
    p.windowResized = function() {
      const rect = mirrorContainer.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        p.resizeCanvas(rect.width, rect.height);
      }
    };
  };
  
  // Start the reflection sketch
  new p5(sketch);
  
  // Setup separate static overlay sketch with purple static
  // Wait a bit to ensure mirror container has dimensions
  setTimeout(() => {
    if (purpleStatic) {
      const staticSketch = function(p) {
        p.setup = function() {
          const rect = mirrorContainer.getBoundingClientRect();
          // Match the exact dimensions of the mirror reflection
          let canvasWidth = rect.width;
          let canvasHeight = rect.height;
          
          // Fallback if dimensions are still 0
          if (canvasWidth === 0 || canvasHeight === 0) {
            canvasWidth = window.innerWidth * 0.1;
            canvasHeight = window.innerHeight * 0.3;
          }
          
          const canvas = p.createCanvas(canvasWidth, canvasHeight);
          canvas.parent(staticOverlay);
          p.pixelDensity(1);
          console.log('Static overlay canvas created:', canvasWidth, canvasHeight, 'Container rect:', rect);
        };
        
        p.draw = function() {
          if (purpleStatic) {
            purpleStatic(p);
          }
        };
        
        p.windowResized = function() {
          const rect = mirrorContainer.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            p.resizeCanvas(rect.width, rect.height);
          }
        };
      };
      
      new p5(staticSketch);
      console.log('Static overlay sketch initialized');
    } else {
      console.error('purpleStatic not available');
    }
  }, 100);
  
  console.log('Mirror reflection initialized');
}
