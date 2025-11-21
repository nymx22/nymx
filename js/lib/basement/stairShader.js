export function initStairShader() {
  let shader;
  let stairImg;
  let canvas;
  let fadeProgress = 0;
  let fadeStartTime = 0;
  let fadeDuration = 2000; // Will be calculated based on image height
  let isTypingComplete = false;
  let glitchFrequency = 0.001; // Random frequency for glitch
  let nextFrequencyChange = 0;
  let isHovered = false;
  let hideAfter20Seconds = false;
  let targetVisibility = 1.0;
  let currentVisibility = 1.0;
  
  const params = {
    smear: 0.5
  };
  
  const sketch = function(p) {
    p.preload = function() {
      shader = p.loadShader('/shaders/stair.vert', '/shaders/stair.frag');
      stairImg = p.loadImage('/assets/images/stair.png');
    };
    
    p.setup = function() {
      // Get container dimensions
      const container = document.getElementById('stair-shader-container');
      const containerHeight = container.offsetHeight;
      
      // Calculate width to maintain aspect ratio
      const aspectRatio = stairImg.width / stairImg.height;
      const canvasWidth = containerHeight * aspectRatio;
      
      canvas = p.createCanvas(canvasWidth, containerHeight, p.WEBGL);
      canvas.parent('stair-shader-container');
      p.noStroke();
      
      // Simple fade-in duration
      fadeDuration = 1500; // 1.5 seconds fade-in
      
      // Start fade-in timer
      fadeStartTime = p.millis();
      
      // Setup hover listeners on stair container
      const stairContainer = document.querySelector('.stair-container');
      stairContainer.addEventListener('mouseenter', () => {
        isHovered = true;
      });
      stairContainer.addEventListener('mouseleave', () => {
        isHovered = false;
      });
      
      // Hide after 20 seconds
      setTimeout(() => {
        hideAfter20Seconds = true;
        console.log('Stair hidden after 20 seconds, hover to reveal');
      }, 20000);
    };
    
    p.draw = function() {
      // Calculate fade progress (0 to 1)
      const elapsed = p.millis() - fadeStartTime;
      fadeProgress = p.constrain(elapsed / fadeDuration, 0, 1);
      
      // Check if fade-in is complete
      if (fadeProgress >= 1.0 && !isTypingComplete) {
        isTypingComplete = true;
        console.log('Fade-in complete, starting glitch effect');
      }
      
      // Smooth fade-in progress
      const smoothProgress = fadeProgress;
      
      // Calculate glitch intensity (only after typing completes)
      let glitchIntensity = 0.0;
      if (isTypingComplete) {
        const timeSinceComplete = p.millis() - (fadeStartTime + fadeDuration);
        
        // Randomize frequency every 3-8 seconds
        if (timeSinceComplete > nextFrequencyChange) {
          // Random frequency between 0.0005 and 0.002 (slower glitch)
          glitchFrequency = 0.0005 + Math.random() * 0.0015;
          // Next change in 3000-8000ms
          nextFrequencyChange = timeSinceComplete + 3000 + Math.random() * 5000;
          console.log(`New glitch frequency: ${glitchFrequency.toFixed(4)}`);
        }
        
        // Glitch in and out with sine wave (slower, randomized frequency)
        glitchIntensity = (p.sin(timeSinceComplete * glitchFrequency) + 1.0) * 0.5; // 0 to 1
      }
      
      // Calculate target visibility based on 20-second rule
      if (hideAfter20Seconds && !isHovered) {
        targetVisibility = 0.0; // Hidden
      } else {
        targetVisibility = 1.0; // Visible
      }
      
      // Smoothly interpolate current visibility towards target
      const fadeSpeed = 0.05; // Adjust for faster/slower fade
      currentVisibility += (targetVisibility - currentVisibility) * fadeSpeed;
      
      // Apply shader
      p.shader(shader);
      
      // Pass uniforms to shader
      shader.setUniform('uTexture', stairImg);
      shader.setUniform('uTime', p.millis());
      shader.setUniform('uSmearIntensity', params.smear);
      shader.setUniform('uFadeProgress', smoothProgress);
      shader.setUniform('uGlitchIntensity', glitchIntensity);
      shader.setUniform('uVisibility', currentVisibility);
      
      // Draw rectangle (shader applies to this)
      p.rect(0, 0, p.width, p.height);
    };
    
    p.windowResized = function() {
      const container = document.getElementById('stair-shader-container');
      const containerHeight = container.offsetHeight;
      const aspectRatio = stairImg.width / stairImg.height;
      const canvasWidth = containerHeight * aspectRatio;
      p.resizeCanvas(canvasWidth, containerHeight);
    };
  };
  
  return new p5(sketch);
}

