/**
 * Signal Corruption Tool
 * WebGL shader-based signal corruption for humanoid GIF
 */

let shader;
let humanoidImg;
let gui;
let fps = 0;
let frameCount = 0;
let lastTime = performance.now();

const params = {
  intensity: 0.5,
  scanLines: 0.1,
  colorShift: 0.3,
  displacement: 0.5,
  noise: 0.2,
  chromaticAberration: 0.8
};

const sketch = function(p) {
  p.preload = function() {
    // Load shader
    shader = p.loadShader('/shaders/humanoid-corruption.vert', '/shaders/humanoid-corruption.frag');
    
    // Load humanoid GIF
    humanoidImg = p.loadImage('/assets/gif/humanoid.gif');
  };
  
  p.setup = function() {
    const container = document.getElementById('corruption-canvas-container');
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Create WEBGL canvas
    const canvas = p.createCanvas(containerWidth, containerHeight, p.WEBGL);
    canvas.parent('corruption-canvas-container');
    canvas.id('corruption-canvas');
    
    // Set texture mode
    p.textureMode(p.NORMAL);
    
    // Initialize dat.GUI
    initGUI();
    
    // Start FPS counter
    updateFPS();
  };
  
  p.draw = function() {
    // Clear background
    p.clear();
    
    if (humanoidImg && humanoidImg.width > 0) {
      // Calculate aspect ratio and size
      const imgAspect = humanoidImg.width / humanoidImg.height;
      const canvasAspect = p.width / p.height;
      
      let displayWidth, displayHeight;
      if (imgAspect > canvasAspect) {
        // Image is wider
        displayWidth = p.width * 0.8;
        displayHeight = displayWidth / imgAspect;
      } else {
        // Image is taller
        displayHeight = p.height * 0.8;
        displayWidth = displayHeight * imgAspect;
      }
      
      // Apply shader
      p.shader(shader);
      
      // Pass uniforms to shader
      shader.setUniform('uTexture', humanoidImg);
      shader.setUniform('uTime', p.millis());
      shader.setUniform('uIntensity', params.intensity);
      shader.setUniform('uScanLineIntensity', params.scanLines);
      shader.setUniform('uColorShiftIntensity', params.colorShift);
      shader.setUniform('uDisplacementIntensity', params.displacement);
      shader.setUniform('uNoiseIntensity', params.noise);
      shader.setUniform('uChromaticAberration', params.chromaticAberration);
      
      // Draw rectangle with shader (centered)
      p.noStroke();
      p.rectMode(p.CENTER);
      p.rect(0, 0, displayWidth, displayHeight);
      
      // Reset shader
      p.resetShader();
    }
    
    // Update FPS
    frameCount++;
    const currentTime = performance.now();
    if (currentTime - lastTime >= 1000) {
      fps = frameCount;
      frameCount = 0;
      lastTime = currentTime;
      updateFPS();
    }
  };
  
  p.windowResized = function() {
    const container = document.getElementById('corruption-canvas-container');
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    p.resizeCanvas(containerWidth, containerHeight);
  };
};

function initGUI() {
  const dat = window.dat;
  if (!dat) {
    console.error('dat.GUI not loaded');
    return;
  }
  
  gui = new dat.GUI();
  
  gui.add(params, 'intensity', 0.0, 1.0).name('Intensity').step(0.01);
  gui.add(params, 'scanLines', 0.0, 0.5).name('Scan Lines').step(0.01);
  gui.add(params, 'colorShift', 0.0, 1.0).name('Color Shift').step(0.01);
  gui.add(params, 'displacement', 0.0, 1.0).name('Displacement').step(0.01);
  gui.add(params, 'noise', 0.0, 0.5).name('Noise').step(0.01);
  gui.add(params, 'chromaticAberration', 0.0, 1.0).name('Chromatic Aberration').step(0.01);
}

function updateFPS() {
  const fpsDisplay = document.getElementById('fps-display');
  if (fpsDisplay) {
    fpsDisplay.textContent = `FPS: ${fps}`;
  }
}

// Initialize p5 sketch
new p5(sketch);

