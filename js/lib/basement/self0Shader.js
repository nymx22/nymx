export function initSelf0Shader() {
  let shader;
  let selfImg;
  let canvas;
  let gui;
  
  const params = {
    flicker: 0.3,
    glitch: 0.5,
    scanLines: 0.04,
    tracking: 0.8,
    colorShift: 0.1
  };
  
  const sketch = function(p) {
    p.preload = function() {
      shader = p.loadShader('/shaders/self0.vert', '/shaders/self0.frag');
      selfImg = p.loadImage('/assets/images/self0.PNG');
    };
    
    p.setup = function() {
      // Get container dimensions
      const container = document.getElementById('self-shader-container');
      const containerHeight = container.offsetHeight;
      
      // Calculate width to maintain aspect ratio
      const aspectRatio = selfImg.width / selfImg.height;
      const canvasWidth = containerHeight * aspectRatio;
      
      canvas = p.createCanvas(canvasWidth, containerHeight, p.WEBGL);
      canvas.parent('self-shader-container');
      p.noStroke();
      
      // Initialize dat.GUI
      gui = new dat.GUI({ autoPlace: false });
      gui.domElement.id = 'basement-gui';
      document.body.appendChild(gui.domElement);
      
      // Add controls with increased ranges
      gui.add(params, 'flicker', 0.0, 1.0).name('Flicker');
      gui.add(params, 'glitch', 0.0, 1.0).name('Glitch');
      gui.add(params, 'scanLines', 0.0, 0.2).name('Scan Lines');
      gui.add(params, 'tracking', 0.0, 1.0).name('Tracking');
      gui.add(params, 'colorShift', 0.0, 1.0).name('Color Shift');
      
      // Setup hover hint text
      setupHintText();
    };
    
    p.draw = function() {
      // Apply shader
      p.shader(shader);
      
      // Pass uniforms to shader
      shader.setUniform('uTexture', selfImg);
      shader.setUniform('uTime', p.millis());
      shader.setUniform('uFlickerIntensity', params.flicker);
      shader.setUniform('uGlitchIntensity', params.glitch);
      shader.setUniform('uScanLineIntensity', params.scanLines);
      shader.setUniform('uTrackingIntensity', params.tracking);
      shader.setUniform('uColorShiftIntensity', params.colorShift);
      
      // Draw rectangle (shader applies to this)
      p.rect(0, 0, p.width, p.height);
    };
    
    p.windowResized = function() {
      const container = document.getElementById('self-shader-container');
      const containerHeight = container.offsetHeight;
      const aspectRatio = selfImg.width / selfImg.height;
      const canvasWidth = containerHeight * aspectRatio;
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
    ];
    
    let sparkleInterval;
    let currentText = '';
    
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
          // Random neon color (70% opacity for background)
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
          // Random character opacity between 30-60%
          span.style.opacity = (0.5 + Math.random() * 0.3).toFixed(2);
        }
        
        hintText.appendChild(span);
      });
      
      hintText.style.opacity = '1';
      
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
    });
    
    // Follow cursor
    document.addEventListener('mousemove', (e) => {
      if (hintText.style.opacity === '1') {
        hintText.style.left = `${e.clientX}px`;
        hintText.style.top = `${e.clientY - 30}px`;
        
        // Update sparkles position if showing
        if (currentText === 'welcome to the basement!') {
          const textRect = hintText.getBoundingClientRect();
          const textCenterX = textRect.left + textRect.width / 2;
          const textCenterY = textRect.top + textRect.height / 2;
          sparklesContainer.style.left = `${textCenterX}px`;
          sparklesContainer.style.top = `${textCenterY}px`;
        }
      }
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

