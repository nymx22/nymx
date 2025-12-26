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
let shaderLoaded = false;

const params = {
  intensity: 1.0,
  scanLines: 0.3,
  colorShift: 0.6,
  displacement: 0.8,
  noise: 0.4,
  chromaticAberration: 1.0
};

const sketch = function(p) {
  p.preload = function() {
    // Load shader - try relative path first, then absolute
    try {
      shader = p.loadShader('../shaders/humanoid-corruption.vert', '../shaders/humanoid-corruption.frag');
      shaderLoaded = true;
      console.log('Shader loading started');
    } catch (error) {
      console.error('Shader load error:', error);
      try {
        shader = p.loadShader('/shaders/humanoid-corruption.vert', '/shaders/humanoid-corruption.frag');
        shaderLoaded = true;
      } catch (e) {
        console.error('Shader failed to load with both paths:', e);
        shaderLoaded = false;
      }
    }
    
    // Load humanoid GIF
    try {
      humanoidImg = p.loadImage('../assets/gif/humanoid.gif');
      console.log('Humanoid image loading started');
    } catch (error) {
      console.error('Failed to load humanoid image:', error);
      try {
        humanoidImg = p.loadImage('/assets/gif/humanoid.gif');
      } catch (e) {
        console.error('Failed to load humanoid image with both paths:', e);
      }
    }
  };
  
  p.setup = function() {
    // Use full window dimensions
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    console.log('Canvas setup:', containerWidth, 'x', containerHeight);
    
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
    // Clear background with black
    p.background(0);
    
    if (humanoidImg && humanoidImg.width > 0) {
      // Calculate aspect ratio and size
      const imgAspect = humanoidImg.width / humanoidImg.height;
      const canvasAspect = p.width / p.height;
      
      let displayWidth, displayHeight;
      if (imgAspect > canvasAspect) {
        // Image is wider - fit to width
        displayWidth = p.width * 0.9;
        displayHeight = displayWidth / imgAspect;
      } else {
        // Image is taller - fit to height
        displayHeight = p.height * 0.9;
        displayWidth = displayHeight * imgAspect;
      }
      
      // Check if shader is loaded and compiled before using it
      if (shader && shader._fragShader && shader._vertShader && shader._fragShader !== -1 && shader._vertShader !== -1) {
        try {
          // Apply shader
          p.shader(shader);
          
          // Pass uniforms to shader
          shader.setUniform('uTexture', humanoidImg);
          shader.setUniform('uTime', p.millis() * 0.001);
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
        } catch (error) {
          console.error('Shader rendering error:', error);
          // Fallback to texture rendering
          p.noStroke();
          p.texture(humanoidImg);
          p.rectMode(p.CENTER);
          p.rect(0, 0, displayWidth, displayHeight);
        }
      } else {
        // Fallback: render without shader using texture (always works)
        p.noStroke();
        p.texture(humanoidImg);
        p.rectMode(p.CENTER);
        p.rect(0, 0, displayWidth, displayHeight);
      }
    } else {
      // Show loading message or placeholder
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('Loading...', 0, 0);
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
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };
};

function initGUI() {
  const dat = window.dat;
  if (!dat) {
    console.error('dat.GUI not loaded');
    return;
  }
  
  gui = new dat.GUI();
  
  // Close GUI on mobile devices initially
  if (window.innerWidth <= 767) {
    gui.close();
  }
  
  gui.add(params, 'intensity', 0.0, 2.0).name('Intensity').step(0.01);
  gui.add(params, 'scanLines', 0.0, 1.0).name('Scan Lines').step(0.01);
  gui.add(params, 'colorShift', 0.0, 2.0).name('Color Shift').step(0.01);
  gui.add(params, 'displacement', 0.0, 2.0).name('Displacement').step(0.01);
  gui.add(params, 'noise', 0.0, 1.0).name('Noise').step(0.01);
  gui.add(params, 'chromaticAberration', 0.0, 2.0).name('Chromatic Aberration').step(0.01);
}

function updateFPS() {
  const fpsDisplay = document.getElementById('fps-display');
  if (fpsDisplay) {
    fpsDisplay.textContent = `FPS: ${fps}`;
  }
}

// Initialize p5 sketch
new p5(sketch);

