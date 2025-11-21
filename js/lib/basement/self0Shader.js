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
    
    // Split text into characters for glitch effect (preserve spaces)
    const text = 'how long has it been?';
    hintText.innerHTML = '';
    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space
      hintText.appendChild(span);
    });
    
    container.addEventListener('mouseenter', () => {
      hintText.style.opacity = '1';
    });
    
    container.addEventListener('mouseleave', () => {
      hintText.style.opacity = '0';
    });
    
    // Follow cursor
    document.addEventListener('mousemove', (e) => {
      if (hintText.style.opacity === '1') {
        hintText.style.left = `${e.clientX}px`;
        hintText.style.top = `${e.clientY - 30}px`;
      }
    });
  }
  
  return new p5(sketch);
}

