import { Self } from './Self.js';

export function initSelf0Shader() {
  let shader;
  let canvas;
  let gui;
  let self; // Self character instance
  
  // Export self and shader for mirror reflection
  window.__selfInstance = null;
  window.__selfShader = null;
  
  const params = {
    flicker: 1.0,
    glitch: 1.0,
    scanLines: 0.2,
    tracking: 1.0,
    colorShift: 1.0
  };
  
  const sketch = function(p) {
    p.preload = function() {
      shader = p.loadShader('/shaders/self0.vert', '/shaders/self0.frag');
      // Self will load its own images
      self = new Self(p);
      // Export for mirror reflection
      window.__selfShader = shader;
      console.log('Shader loaded:', shader);
    };
    
    p.setup = function() {
      // Get container dimensions
      const container = document.getElementById('self-shader-container');
      const containerHeight = container.offsetHeight;
      
      // Canvas should be large enough for movement but positioned correctly
      const canvasWidth = p.windowWidth;
      
      canvas = p.createCanvas(canvasWidth, containerHeight, p.WEBGL);
      canvas.parent('self-shader-container');
      
      // Set texture mode for proper UV mapping
      p.textureMode(p.NORMAL);
      
      // Initialize Self at center (0, 0 in WEBGL coordinates)
      self = new Self(p);
      // Export for mirror reflection
      window.__selfInstance = self;
      
      // Initialize dat.GUI
      gui = new dat.GUI({ autoPlace: false });
      gui.domElement.id = 'basement-gui';
      document.body.appendChild(gui.domElement);
      
      // Add controls with increased ranges
      gui.add(params, 'flicker', 0.0, 1.0).name('Flicker').onChange((val) => {
        console.log('Flicker changed to:', val);
      });
      gui.add(params, 'glitch', 0.0, 5.0).name('Glitch').onChange((val) => {
        console.log('Glitch changed to:', val);
      });
      gui.add(params, 'scanLines', 0.0, 0.2).name('Scan Lines').onChange((val) => {
        console.log('Scan Lines changed to:', val);
      });
      gui.add(params, 'tracking', 0.0, 1.0).name('Tracking').onChange((val) => {
        console.log('Tracking changed to:', val);
      });
      gui.add(params, 'colorShift', 0.0, 1.0).name('Color Shift').onChange((val) => {
        console.log('Color Shift changed to:', val);
      });
      
      // Setup hover hint text
      setupHintText();
      
      console.log('Setup complete. Initial params:', params);
    };
    
    p.draw = function() {
      // Clear background
      p.clear();
      
      // Update self character
      self.update();
      
      // Get current image from self
      const currentImage = self.getCurrentImage();
      
      if (currentImage && currentImage.width > 0) {
        // Calculate scaled dimensions
        const scaledWidth = currentImage.width * self.scale;
        const scaledHeight = currentImage.height * self.scale;
        
        // Draw with shader, positioned and flipped based on self state
        p.push();
        p.translate(self.x, self.y, 0);
        
        // Flip horizontally if moving left
        if (self.direction === -1) {
          p.scale(-1, 1);
        }
        
        // Apply shader and pass uniforms
        p.shader(shader);
        shader.setUniform('uTexture', currentImage);
        shader.setUniform('uTime', p.millis());
        shader.setUniform('uFlickerIntensity', params.flicker);
        shader.setUniform('uGlitchIntensity', params.glitch);
        shader.setUniform('uScanLineIntensity', params.scanLines);
        shader.setUniform('uTrackingIntensity', params.tracking);
        shader.setUniform('uColorShiftIntensity', params.colorShift);
        
        // Draw rectangle (shader applies to this)
        // Don't use p.texture() - texture is passed as uniform only
        p.noStroke();
        p.rect(-scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
        
        p.pop();
        
        // Reset shader after drawing
        p.resetShader();
      }
    };
    
    p.windowResized = function() {
      const container = document.getElementById('self-shader-container');
      const containerHeight = container.offsetHeight;
      // Make canvas wide enough for movement
      const canvasWidth = p.windowWidth;
      p.resizeCanvas(canvasWidth, containerHeight);
    };
  };
  
  // Setup hint text functionality
  function setupHintText() {
    const container = document.querySelector('.self-container');
    const hintText = document.createElement('div');
    hintText.className = 'self0-hint-text';
    document.body.appendChild(hintText);
    
    // Create sparkles container
    const sparklesContainer = document.createElement('div');
    sparklesContainer.className = 'self0-hint-sparkles';
    document.body.appendChild(sparklesContainer);
    
    // Array of possible hint texts
    const hintTexts = [
      'how long has it been?',
      'welcome to the basement!',
      'who is this?',
      'who am i?',
      '*teary eyes*'
    ];
    
    let sparkleInterval;
    let currentText = '';
    let hintAnimationFrame = null;

    const updateHintPosition = () => {
      // Calculate self's actual screen position
      // Self's x is relative to canvas center (which is at screen center)
      const screenCenterX = window.innerWidth / 2;
      const selfScreenX = screenCenterX + self.x;
      
      // Get container to find self's vertical position
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        hintAnimationFrame = requestAnimationFrame(updateHintPosition);
        return;
      }
      
      // Position hint text above self
      // Get self's height to position text above it
      const selfImage = self.getCurrentImage();
      const selfHeight = selfImage ? selfImage.height * self.scale : rect.height;
      const selfTop = rect.top;
      
      hintText.style.left = `${selfScreenX}px`;
      hintText.style.top = `${selfTop-10}px`; // Position at top of self, CSS transform will move it up

      if (currentText === 'welcome to the basement!') {
        sparklesContainer.style.left = `${selfScreenX}px`;
        sparklesContainer.style.top = `${selfTop + selfHeight / 2}px`;
      }

      hintAnimationFrame = requestAnimationFrame(updateHintPosition);
    };

    const startHintFollow = () => {
      if (hintAnimationFrame === null) {
        updateHintPosition();
      }
    };

    const stopHintFollow = () => {
      if (hintAnimationFrame !== null) {
        cancelAnimationFrame(hintAnimationFrame);
        hintAnimationFrame = null;
      }
    };

    container.addEventListener('mouseenter', () => {
      // Pick random text on each hover
      currentText = hintTexts[Math.floor(Math.random() * hintTexts.length)];
      
      // Split text into characters for glitch effect (preserve spaces)
      hintText.innerHTML = '';
      const chars = currentText.split('');
      
      // For "welcome to the basement!", pick 3 random non-space characters to highlight
      let highlightIndices = [];
      if (currentText === 'welcome to the basement!') {
        const nonSpaceIndices = chars
          .map((char, idx) => char !== ' ' ? idx : -1)
          .filter(idx => idx !== -1);
        
        // Randomly pick 3 indices
        const shuffled = [...nonSpaceIndices].sort(() => Math.random() - 0.5);
        highlightIndices = shuffled.slice(0, 3);
      }
      
      chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space
        
        // Add neon highlight to selected characters
        if (highlightIndices.includes(index)) {
          span.classList.add('neon-highlight');
          // Random neon color
          const neonColors = [
            'rgba(255, 0, 255, 0.7)',   // Magenta
            'rgba(0, 255, 255, 0.7)',   // Cyan
            'rgba(255, 255, 0, 0.7)',   // Yellow
            'rgba(0, 255, 0, 0.7)',     // Green
            'rgba(255, 100, 0, 0.7)'    // Orange
          ];
          const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];
          span.style.backgroundColor = randomColor;
          span.style.boxShadow = `0 0 10px ${randomColor}, 0 0 20px ${randomColor}`;
          // Random character opacity between 50-80%
          span.style.opacity = (0.5 + Math.random() * 0.3).toFixed(2);
        }
        
        hintText.appendChild(span);
      });
      
      hintText.style.opacity = '1';
      startHintFollow();
      
      // Only show sparkles for "welcome to the basement!"
      if (currentText === 'welcome to the basement!') {
        sparklesContainer.style.opacity = '1';
        sparkleInterval = setInterval(() => {
          createSparkle(sparklesContainer);
        }, 100);
      }
    });
    
    container.addEventListener('mouseleave', () => {
      hintText.style.opacity = '0';
      sparklesContainer.style.opacity = '0';
      clearInterval(sparkleInterval);
      sparklesContainer.innerHTML = '';
      stopHintFollow();
    });
  }
  
  function createSparkle(container) {
    const sparkle = document.createElement('div');
    sparkle.className = 'self0-hint-sparkle-cross';
    
    const angle = Math.random() * 360;
    const distance = 40 + Math.random() * 60;
    const x = Math.cos(angle * Math.PI / 180) * distance;
    const y = Math.sin(angle * Math.PI / 180) * distance;
    
    sparkle.style.left = `calc(50% + ${x}px)`;
    sparkle.style.top = `calc(50% + ${y}px)`;
    sparkle.style.width = `${2 + Math.random() * 4}px`;
    sparkle.style.height = `${2 + Math.random() * 4}px`;
    sparkle.style.animation = `self0-sparkle-fade ${0.5 + Math.random() * 1}s ease-out forwards`;
    sparkle.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
    
    container.appendChild(sparkle);
    
    setTimeout(() => {
      sparkle.remove();
    }, 1500);
  }
  
  return new p5(sketch);
}

