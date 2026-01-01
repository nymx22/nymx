/**
 * Signal Corruption Tool
 * WebGL shader-based signal corruption for humanoid GIF
 * Also supports JavaScript-based glitch effects (like index.html)
 */

// Import JS glitch effects (ES6 modules)
import { blueBands } from '../../effects/glitch/blueBands.js';
import { pureSnow } from '../../effects/glitch/pureSnow.js';
import { purpleStatic } from '../../effects/glitch/purpleStatic.js';
import { colorLineNoise } from '../../effects/glitch/colorLineNoise.js';
import { smear } from '../../effects/glitch/smear.js';

let shader;
let humanoidImg;
let humanoidVideo = null; // Store video element
let isVideo = false; // Track if current media is video
let gui;
let fps = 0;
let frameCount = 0;
let lastTime = performance.now();
let shaderLoaded = false;
let p5Instance = null; // Store p5 instance for image upload
// imageFlipped removed - flip functionality no longer needed
let useShader = false; // Toggle between shader and JS effects (default to JS effects)
// Randomize effect mode on load - all effects from index page
const effectModes = ['none', 'band', 'snow', 'static', 'color', 'smear'];
let jsEffectMode = effectModes[Math.floor(Math.random() * (effectModes.length - 1)) + 1]; // Random effect mode (excluding 'none')
let canvasMode = 'P2D'; // Current canvas mode: 'P2D' or 'WEBGL'
let needsCanvasRecreate = false; // Flag to recreate canvas when switching modes
let mediaRecorder = null; // For recording video
let recordedChunks = []; // Store recorded video chunks
let isRecording = false; // Track recording state
let croppedRecordingCanvas = null; // Canvas for recording (cropped to image area only)
// Store media display dimensions and position for saving (without background)
let currentDisplayWidth = 0;
let currentDisplayHeight = 0;
let currentMediaX = 0; // Center X position
let currentMediaY = 0; // Center Y position

// Initialize params with randomized values
const params = {
  intensity: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
  scanLines: Math.random() * 0.7 + 0.1, // 0.1 to 0.8
  colorShift: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
  displacement: Math.random() * 0.6 + 0.4, // 0.4 to 1.0
  noise: Math.random() * 0.6 + 0.2, // 0.2 to 0.8
  noiseSize: 1, // Noise pixel size (1 = single pixel, higher = blocks)
  chromaticAberration: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
  opacity: 1.0, // Always 1.0
  blendMode: 'screen' // Default blend mode
};

// Blend mode options (from index page)
const blendModes = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity'
];

// Effect mapping (from index page)
const effectMap = {
  'none': null,
  'band': blueBands,
  'snow': pureSnow,
  'static': purpleStatic,
  'color': colorLineNoise,
  'smear': smear
};

// Function to randomize all parameters
function randomizeParams() {
  params.intensity = Math.random() * 0.8 + 0.2;
  params.scanLines = Math.random() * 0.7 + 0.1;
  params.colorShift = Math.random() * 0.8 + 0.2;
  params.displacement = Math.random() * 0.6 + 0.4;
  params.noise = Math.random() * 0.6 + 0.2;
  params.noiseSize = Math.floor(Math.random() * 4) + 1; // 1 to 4 pixels
  params.chromaticAberration = Math.random() * 0.8 + 0.2;
  params.opacity = 1.0; // Always 1.0
  
  // Random blend mode
  const randomBlendIndex = Math.floor(Math.random() * blendModes.length);
  params.blendMode = blendModes[randomBlendIndex];
  
  // Update GUI controllers if they exist
  if (gui) {
    gui.__controllers.forEach(function(controller) {
      if (controller.property in params) {
        controller.setValue(params[controller.property]);
      }
    });
  }
  
  // Apply opacity and blend mode to canvas
  const canvas = document.querySelector('#corruption-canvas');
  if (canvas) {
    canvas.style.opacity = params.opacity;
  }
  const canvasContainer = document.querySelector('#corruption-canvas-container');
  if (canvasContainer) {
    canvasContainer.style.mixBlendMode = params.blendMode;
  }
  
  console.log('Parameters randomized:', params);
}

const sketch = function(p) {
  // Store p5 instance globally for image upload
  p5Instance = p;
  p.preload = function() {
    // Load shader - use absolute path like other shaders
    console.log('Starting preload...');
    console.log('Page location:', window.location.pathname);
    
    // Try absolute path first (like self0Shader.js and stairShader.js)
    try {
      shader = p.loadShader('/shaders/humanoid-corruption.vert', '/shaders/humanoid-corruption.frag');
      console.log('Shader loadShader called with absolute path, object:', shader);
    } catch (error) {
      console.warn('Failed to load shader with absolute path, trying relative:', error);
      // Fallback to relative path
      shader = p.loadShader('../shaders/humanoid-corruption.vert', '../shaders/humanoid-corruption.frag');
      console.log('Shader loadShader called with relative path, object:', shader);
    }
    
    // Load humanoid GIF with success/error callbacks
    // Path is relative to the HTML file (pages/glitchengine.html), so ../assets/gif/ is correct
    humanoidImg = p.loadImage('../assets/gif/humanoid.gif', 
      function(img) {
        console.log('✅ GIF loaded successfully!', img.width, 'x', img.height);
        console.log('✅ Image object:', img);
        // Force a redraw to ensure image appears
        if (p && p.redraw) {
          p.redraw();
        }
      },
      function(err) {
        console.error('❌ Failed to load GIF from ../assets/gif/humanoid.gif:', err);
        // Try alternative paths
        console.log('Trying alternative path: ../../assets/gif/humanoid.gif');
        humanoidImg = p.loadImage('../../assets/gif/humanoid.gif',
          function(img) {
            console.log('✅ GIF loaded from alternative path!', img.width, 'x', img.height);
            if (p && p.redraw) {
              p.redraw();
            }
          },
          function(err2) {
            console.error('❌ Failed to load from ../../assets/gif/humanoid.gif:', err2);
            console.log('Trying absolute path: /assets/gif/humanoid.gif');
            humanoidImg = p.loadImage('/assets/gif/humanoid.gif',
              function(img) {
                console.log('✅ GIF loaded from absolute path!', img.width, 'x', img.height);
                if (p && p.redraw) {
                  p.redraw();
                }
              },
              function(err3) {
                console.error('❌ Failed to load GIF from all paths:', err3);
              }
            );
          }
        );
      }
    );
    console.log('Image loadImage called for humanoid.gif');
  };
  
  p.setup = function() {
    // Get container dimensions (on mobile, container has fixed height)
    const container = document.getElementById('corruption-canvas-container');
    let containerWidth, containerHeight;
    
    if (container && window.innerWidth <= 767) {
      // Mobile: use container's actual dimensions
      // Force a layout recalculation to ensure container has dimensions
      const rect = container.getBoundingClientRect();
      containerWidth = Math.floor(rect.width);
      containerHeight = Math.floor(rect.height);
      
      // Fallback to calculated dimensions if getBoundingClientRect returns 0
      if (containerWidth === 0 || containerHeight === 0) {
        containerWidth = window.innerWidth;
        containerHeight = Math.floor(window.innerHeight * 0.7); // 70vh as per CSS
        console.warn('Container dimensions were 0, using fallback:', containerWidth, 'x', containerHeight);
      }
      
      // Ensure minimum dimensions
      if (containerWidth < 100) containerWidth = window.innerWidth;
      if (containerHeight < 100) containerHeight = Math.floor(window.innerHeight * 0.7);
      
      console.log('Mobile canvas setup - container rect:', rect.width, 'x', rect.height);
      console.log('Mobile canvas setup - using dimensions:', containerWidth, 'x', containerHeight);
    } else {
      // Desktop: use full window dimensions
      containerWidth = window.innerWidth;
      containerHeight = window.innerHeight;
    }
    
    // Limit to prevent memory issues
    const maxDimension = 3840; // Maximum safe dimension (4K width)
    if (containerWidth > maxDimension || containerHeight > maxDimension) {
      const scale = Math.min(maxDimension / containerWidth, maxDimension / containerHeight);
      containerWidth = Math.floor(containerWidth * scale);
      containerHeight = Math.floor(containerHeight * scale);
      console.warn('Canvas scaled down to prevent memory issues:', containerWidth, 'x', containerHeight);
    }
    
    // Ensure we have valid dimensions
    if (containerWidth <= 0 || containerHeight <= 0) {
      console.error('Invalid canvas dimensions:', containerWidth, 'x', containerHeight, '- using window dimensions');
      containerWidth = window.innerWidth || 800;
      containerHeight = window.innerHeight || 600;
    }
    
    console.log('Canvas setup:', containerWidth, 'x', containerHeight);
    
    // Use P2D mode for JS effects (like index.html GlitchEngine)
    // WEBGL will be used only when shader is enabled and loaded
    const canvas = p.createCanvas(containerWidth, containerHeight, p.P2D);
    canvas.parent('corruption-canvas-container');
    canvas.id('corruption-canvas');
    
    // Performance optimizations (like GlitchEngine)
    // Use pixelDensity(1) to reduce memory usage
    p.pixelDensity(1);
    p.frameRate(30);
    
    // Initial background
    p.background(0);
    
    // Shader loading is asynchronous, so we'll check it in draw()
    // Don't set shaderLoaded here - let draw() handle it
    shaderLoaded = false;
    
    // Initialize dat.GUI
    initGUI();
    
    // Start FPS counter
    updateFPS();
  };
  
  p.draw = function() {
    // Clear background with black
    p.background(0);
    
    // Debug: Log status every 120 frames (every 2 seconds at 60fps)
    if (frameCount % 120 === 0 && frameCount > 0) {
      console.log('=== Tool Debug (frame ' + frameCount + ') ===');
      console.log('Canvas mode: P2D (for JS effects)');
      console.log('Use shader:', useShader);
      console.log('JS effect mode:', jsEffectMode);
      console.log('Is video:', isVideo);
      console.log('Image loaded:', !!(humanoidImg && humanoidImg.width > 0));
      if (humanoidVideo) {
        const videoElt = humanoidVideo.elt || humanoidVideo;
        console.log('Video loaded:', !!(videoElt && videoElt.readyState >= 1));
        console.log('Video dimensions:', humanoidVideo.width || videoElt.videoWidth, 'x', humanoidVideo.height || videoElt.videoHeight);
      }
      // Image flip removed
      console.log('Current params:', JSON.stringify(params));
      console.log('=====================================');
    }
    
    // Handle both image and video
    let mediaWidth, mediaHeight, mediaAspect;
    
    if (isVideo && humanoidVideo) {
      // Check if video has dimensions (p5.js video element uses .width and .height)
      // Also check the underlying HTMLVideoElement via .elt
      const videoElt = humanoidVideo.elt || humanoidVideo;
      const videoWidth = humanoidVideo.width || videoElt.videoWidth || 0;
      const videoHeight = humanoidVideo.height || videoElt.videoHeight || 0;
      const readyState = videoElt.readyState || 0;
      
      if (readyState >= 1 && videoWidth > 0 && videoHeight > 0) {
        mediaWidth = videoWidth;
        mediaHeight = videoHeight;
        mediaAspect = mediaWidth / mediaHeight;
      } else {
        // Video not ready yet, log debug info occasionally
        if (frameCount % 120 === 0) {
          console.log('Video not ready yet:', {
            isVideo: isVideo,
            hasVideo: !!humanoidVideo,
            hasElt: !!(humanoidVideo && humanoidVideo.elt),
            readyState: readyState,
            videoWidth: videoWidth,
            videoHeight: videoHeight,
            p5Width: humanoidVideo ? humanoidVideo.width : 'N/A',
            p5Height: humanoidVideo ? humanoidVideo.height : 'N/A'
          });
        }
        // Skip this frame
        return;
      }
    } else if (humanoidImg) {
      // Check if image is loaded
      if (humanoidImg.width > 0 && humanoidImg.height > 0) {
        mediaWidth = humanoidImg.width;
        mediaHeight = humanoidImg.height;
        mediaAspect = mediaWidth / mediaHeight;
        
        // Debug log on mobile
        if (frameCount % 120 === 0 && window.innerWidth <= 767) {
          console.log('Mobile: Image loaded, dimensions:', mediaWidth, 'x', mediaHeight);
          console.log('Mobile: Canvas dimensions:', p.width, 'x', p.height);
        }
      } else {
        // Still loading, show loading message
        if (frameCount % 60 === 0) {
          console.log('Image still loading... width:', humanoidImg.width, 'height:', humanoidImg.height);
        }
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text('Loading GIF...', p.width / 2, p.height / 2);
        return;
      }
    } else {
      // No media loaded
      if (frameCount % 120 === 0) {
        console.log('No media loaded - humanoidImg:', humanoidImg);
      }
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(16);
      p.text('Upload an image or video', p.width / 2, p.height / 2);
      return;
    }
    
    if (mediaWidth > 0 && mediaHeight > 0) {
      // Calculate aspect ratio and size to fit window
      const canvasAspect = p.width / p.height;
      
      let displayWidth, displayHeight;
      if (mediaAspect > canvasAspect) {
        // Media is wider - fit to width (use full width)
        displayWidth = p.width;
        displayHeight = displayWidth / mediaAspect;
      } else {
        // Media is taller - fit to height (use full height)
        displayHeight = p.height;
        displayWidth = displayHeight * mediaAspect;
      }
      
      // Ensure it doesn't exceed window bounds (safety check)
      if (displayWidth > p.width) {
        displayWidth = p.width;
        displayHeight = displayWidth / mediaAspect;
      }
      if (displayHeight > p.height) {
        displayHeight = p.height;
        displayWidth = displayHeight * mediaAspect;
      }
      
      // Shader only works in WEBGL mode, but we're using P2D for JS effects
      // So shader is disabled when using P2D mode
      let usingShader = false;
      
      // Note: Shader requires WEBGL mode, but JS effects require P2D mode
      // For now, we prioritize JS effects. Shader can be enabled later with mode switching.
      if (useShader && p._renderer && p._renderer.GL) {
        const gl = p._renderer.GL;
        
        if (shader && shader._glProgram) {
          const isLinked = gl.getProgramParameter(shader._glProgram, gl.LINK_STATUS);
          
          if (isLinked) {
            // Shader is ready, but we need WEBGL mode
            // For now, disable shader when in P2D mode
            console.warn('⚠ Shader requires WEBGL mode, but canvas is P2D. Use JS effects instead.');
            usingShader = false;
          }
        }
      }
      
      // Fallback: render without shader if shader not ready or failed, or use JS effects
      if (!usingShader || !useShader) {
        // Only log warnings if user actually wants to use shader AND we're in WEBGL mode
        // Don't warn if we're in P2D mode (which is expected for JS effects)
        const isWEBGL = p._renderer && p._renderer.GL;
        if (frameCount % 120 === 0 && useShader && isWEBGL) {
          if (!shader) {
            console.warn('⚠ Not using shader: shader object is null');
          } else if (!shader._glProgram) {
            console.warn('⚠ Not using shader: program not created yet');
          } else {
            const gl = p._renderer.GL;
            const isLinked = gl.getProgramParameter(shader._glProgram, gl.LINK_STATUS);
            if (!isLinked) {
              console.warn('⚠ Not using shader: program not linked');
            }
          }
        } else if (frameCount % 120 === 0 && useShader && !isWEBGL) {
          // User wants shader but we're in P2D mode - this is expected, just log info
          console.log('ℹ Shader requires WEBGL mode. Currently in P2D mode for JS effects. Toggle "Use Shader" to switch modes.');
        }
        
        // STEP 1: Draw image/GIF first (GIFs animate automatically when drawn each frame)
        p.imageMode(p.CENTER);
        
        if (isVideo && humanoidVideo) {
          const videoElt = humanoidVideo.elt || humanoidVideo;
          if (videoElt.paused && humanoidVideo.play) {
            humanoidVideo.play().catch(function(err) {
              console.error('Failed to play video:', err);
            });
          }
          p.image(humanoidVideo, p.width / 2, p.height / 2, displayWidth, displayHeight);
        } else if (humanoidImg && humanoidImg.width > 0 && humanoidImg.height > 0) {
          // Draw GIF - it will animate automatically
          // Store display dimensions for saving
          currentDisplayWidth = displayWidth;
          currentDisplayHeight = displayHeight;
          currentMediaX = p.width / 2;
          currentMediaY = p.height / 2;
          
          // Debug on mobile
          if (frameCount % 120 === 0 && window.innerWidth <= 767) {
            console.log('Mobile: Drawing image at center:', currentMediaX, currentMediaY);
            console.log('Mobile: Display size:', displayWidth, 'x', displayHeight);
          }
          
          p.image(humanoidImg, p.width / 2, p.height / 2, displayWidth, displayHeight);
        } else {
          // Debug: show message if image not loaded
          if (frameCount % 60 === 0) {
            console.warn('Cannot draw image - humanoidImg:', humanoidImg, 'width:', humanoidImg ? humanoidImg.width : 'N/A');
          }
          p.fill(255);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(16);
          p.text('Image not loaded', p.width / 2, p.height / 2);
        }
        
        // STEP 2: Apply all glitch effects in a single layer - restricted to image/video area
        if (jsEffectMode !== 'none' || params.noise > 0 || params.scanLines > 0 || params.colorShift > 0 || params.chromaticAberration > 0 || params.displacement > 0) {
          // Create effect layer matching the displayed image/video size (not full canvas)
          const effectLayerWidth = Math.ceil(displayWidth);
          const effectLayerHeight = Math.ceil(displayHeight);
          const effectLayer = p.createGraphics(effectLayerWidth, effectLayerHeight);
          
          // Copy the image/video area from canvas to effect layer
          effectLayer.imageMode(p.CORNER);
          if (isVideo && humanoidVideo) {
            effectLayer.image(humanoidVideo, 0, 0, effectLayerWidth, effectLayerHeight);
          } else if (humanoidImg && humanoidImg.width > 0) {
            effectLayer.image(humanoidImg, 0, 0, effectLayerWidth, effectLayerHeight);
          }
          
          // Apply main glitch effect if enabled
          if (jsEffectMode !== 'none') {
            const effect = effectMap[jsEffectMode];
            
            if (effect && typeof effect === 'function') {
              // Apply effect to the layer
              const effectP5 = {
                width: effectLayer.width,
                height: effectLayer.height,
                frameCount: p.frameCount,
                millis: p.millis,
                noise: p.noise.bind(p),
                random: p.random.bind(p),
                loadPixels: () => effectLayer.loadPixels(),
                updatePixels: () => effectLayer.updatePixels(),
                get pixels() { return effectLayer.pixels; },
                set pixels(val) { 
                  if (val && val.length === effectLayer.pixels.length) {
                    effectLayer.pixels = val;
                  }
                },
                constrain: p.constrain.bind(p),
                map: p.map.bind(p),
                color: p.color.bind(p),
                noiseSize: params.noiseSize // Pass noiseSize to effects
              };
              
              // Call effect with noiseSize parameter if it's smear
              if (jsEffectMode === 'smear') {
                effect(effectP5, params.noiseSize);
              } else {
                effect(effectP5);
              }
              effectLayer.updatePixels();
            }
          }
          
          // Apply additional effects to the same layer
          // Create a proxy object for helper functions that need p5 properties
          const helperP5 = {
            width: effectLayer.width,
            height: effectLayer.height,
            frameCount: p.frameCount,
            millis: p.millis,
            loadPixels: () => effectLayer.loadPixels(),
            updatePixels: () => effectLayer.updatePixels(),
            get pixels() { return effectLayer.pixels; },
            set pixels(val) { 
              if (val && val.length === effectLayer.pixels.length) {
                effectLayer.pixels = val;
              }
            },
            constrain: p.constrain.bind(p)
          };
          
          if (params.noise > 0 && jsEffectMode !== 'static' && jsEffectMode !== 'smear') {
            applyNoiseEffect(helperP5, params.noise, params.noiseSize);
          }

          if (params.scanLines > 0) {
            applyScanLines(helperP5, params.scanLines);
          }

          if (params.colorShift > 0 && jsEffectMode !== 'smear' && jsEffectMode !== 'color') {
            applyColorShift(helperP5, params.colorShift);
          }

          if (params.chromaticAberration > 0 && jsEffectMode !== 'smear') {
            applyChromaticAberrationEffect(helperP5, params.chromaticAberration);
          }

          if (params.displacement > 0) {
            applyDisplacementEffect(helperP5, params.displacement);
          }
          
          // Blend the single effect layer on top using p5.js blend modes
          const blendModeMap = {
            'normal': p.BLEND,
            'multiply': p.MULTIPLY,
            'screen': p.SCREEN,
            'overlay': p.OVERLAY,
            'darken': p.DARKEST,
            'lighten': p.LIGHTEST,
            'color-dodge': p.DODGE,
            'color-burn': p.BURN,
            'hard-light': p.HARD_LIGHT,
            'soft-light': p.SOFT_LIGHT,
            'difference': p.DIFFERENCE,
            'exclusion': p.EXCLUSION,
            'hue': p.HUE,
            'saturation': p.SATURATION,
            'color': p.COLOR,
            'luminosity': p.LUMINOSITY
          };
          
          const p5BlendMode = blendModeMap[params.blendMode] || p.SCREEN;
          p.blendMode(p5BlendMode);
          p.tint(255, 255 * params.intensity);
          // Draw effect layer at the same position and size as the image/video (centered)
          p.imageMode(p.CENTER);
          p.image(effectLayer, p.width / 2, p.height / 2, displayWidth, displayHeight);
          p.tint(255, 255);
          p.blendMode(p.BLEND);
        }
        
        // If recording, update cropped canvas with just the image area (no background)
        if (isRecording && croppedRecordingCanvas && currentDisplayWidth > 0 && currentDisplayHeight > 0) {
          const mainCanvas = document.querySelector('#corruption-canvas');
          if (mainCanvas) {
            const croppedCtx = croppedRecordingCanvas.getContext('2d');
            const sourceX = currentMediaX - currentDisplayWidth / 2;
            const sourceY = currentMediaY - currentDisplayHeight / 2;
            croppedCtx.drawImage(
              mainCanvas,
              sourceX, sourceY, currentDisplayWidth, currentDisplayHeight,
              0, 0, currentDisplayWidth, currentDisplayHeight
            );
          }
        }
      }
    } else {
      // Show loading message or placeholder
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(24);
      p.text('Loading...', p.width / 2, p.height / 2);
      
      // If no media loaded, still apply effects if mode is not 'none'
      const effect = effectMap[jsEffectMode];
      if (jsEffectMode !== 'none' && effect && typeof effect === 'function') {
        effect(p);
      }
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
    // On mobile, use container dimensions; on desktop, use window dimensions
    const container = document.getElementById('corruption-canvas-container');
    let newWidth, newHeight;
    
    if (container && window.innerWidth <= 767) {
      // Mobile: use container's actual dimensions
      const rect = container.getBoundingClientRect();
      newWidth = Math.floor(rect.width);
      newHeight = Math.floor(rect.height);
      
      // Fallback if dimensions are 0
      if (newWidth === 0 || newHeight === 0) {
        newWidth = window.innerWidth;
        newHeight = Math.floor(window.innerHeight * 0.7);
        console.warn('Window resize: Container dimensions were 0, using fallback:', newWidth, 'x', newHeight);
      }
      
      // Ensure minimum dimensions
      if (newWidth < 100) newWidth = window.innerWidth;
      if (newHeight < 100) newHeight = Math.floor(window.innerHeight * 0.7);
      
      console.log('Mobile window resize - new dimensions:', newWidth, 'x', newHeight);
    } else {
      // Desktop: use full window dimensions
      newWidth = window.innerWidth;
      newHeight = window.innerHeight;
    }
    
    // Only resize if dimensions are valid
    if (newWidth > 0 && newHeight > 0) {
      p.resizeCanvas(newWidth, newHeight);
      console.log('Canvas resized to:', newWidth, 'x', newHeight);
    } else {
      console.error('Invalid resize dimensions:', newWidth, 'x', newHeight);
    }
  };
};

// Helper function to apply noise effect based on noise parameter
function applyNoiseEffect(p, noiseIntensity, noiseSize = 1) {
  p.loadPixels();
  const pixels = p.pixels;
  const width = p.width;
  const height = p.height;
  
  // If noiseSize is 1, use pixel-by-pixel noise (original behavior)
  if (noiseSize === 1) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (x + y * width) * 4;
        
        // Add random noise scaled by intensity
        const noise = (Math.random() - 0.5) * noiseIntensity * 255;
        
        pixels[index] = Math.max(0, Math.min(255, pixels[index] + noise)); // R
        pixels[index + 1] = Math.max(0, Math.min(255, pixels[index + 1] + noise)); // G
        pixels[index + 2] = Math.max(0, Math.min(255, pixels[index + 2] + noise)); // B
        // Alpha stays the same
      }
    }
  } else {
    // Block-based noise: apply same noise value to a block of pixels
    // This creates a pixelated/chunky noise effect
    const noiseSizeInt = Math.floor(noiseSize);
    for (let y = 0; y < height; y += noiseSizeInt) {
      for (let x = 0; x < width; x += noiseSizeInt) {
        // Generate noise value for this block (same for all pixels in block)
        const noiseR = (Math.random() - 0.5) * noiseIntensity * 255;
        const noiseG = (Math.random() - 0.5) * noiseIntensity * 255;
        const noiseB = (Math.random() - 0.5) * noiseIntensity * 255;
        
        // Apply noise to all pixels in this block
        for (let blockY = 0; blockY < noiseSizeInt && (y + blockY) < height; blockY++) {
          for (let blockX = 0; blockX < noiseSizeInt && (x + blockX) < width; blockX++) {
            const px = x + blockX;
            const py = y + blockY;
            const index = (px + py * width) * 4;
            
            // Apply different noise to each color channel for more visible effect
            pixels[index] = Math.max(0, Math.min(255, pixels[index] + noiseR)); // R
            pixels[index + 1] = Math.max(0, Math.min(255, pixels[index + 1] + noiseG)); // G
            pixels[index + 2] = Math.max(0, Math.min(255, pixels[index + 2] + noiseB)); // B
            // Alpha stays the same
          }
        }
      }
    }
  }
  
  p.updatePixels();
}

// Helper function to apply scan lines effect
function applyScanLines(p, scanLineIntensity) {
  p.loadPixels();
  const pixels = p.pixels;
  const width = p.width;
  const height = p.height;
  
  for (let y = 0; y < height; y++) {
    // Create scan line pattern (every few lines)
    const scanLine = Math.sin(y * 0.1 + p.frameCount * 0.1) * scanLineIntensity * 0.3;
    
    for (let x = 0; x < width; x++) {
      const index = (x + y * width) * 4;
      
      pixels[index] = Math.max(0, Math.min(255, pixels[index] + scanLine * 255)); // R
      pixels[index + 1] = Math.max(0, Math.min(255, pixels[index + 1] + scanLine * 255)); // G
      pixels[index + 2] = Math.max(0, Math.min(255, pixels[index + 2] + scanLine * 255)); // B
    }
  }
  
  p.updatePixels();
}

// Helper function to apply color shift effect
function applyColorShift(p, colorShiftIntensity) {
  p.loadPixels();
  const pixels = p.pixels;
  const width = p.width;
  const height = p.height;
  
  const shift = Math.sin(p.frameCount * 0.05) * colorShiftIntensity * 50;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (x + y * width) * 4;
      
      // Shift RGB channels
      pixels[index] = Math.max(0, Math.min(255, pixels[index] + shift)); // R
      pixels[index + 2] = Math.max(0, Math.min(255, pixels[index + 2] - shift * 0.5)); // B
      // G stays the same
    }
  }
  
  p.updatePixels();
}

// Helper function to apply displacement/warping effect
function applyDisplacementEffect(p, displacementIntensity) {
  p.loadPixels();
  const pixels = p.pixels;
  const tempPixels = new Uint8ClampedArray(pixels);
  const width = p.width;
  const height = p.height;
  
  // Displacement creates a wave-like distortion
  const maxOffset = Math.floor(displacementIntensity * 50); // Max pixel offset (increased from 20 to 50 for stronger effect)
  const waveFrequency = 0.02; // Frequency of the wave distortion
  const timeOffset = p.frameCount * 0.05; // Animated over time
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Calculate displacement using sine waves for smooth distortion
      const offsetX = Math.floor(
        Math.sin(y * waveFrequency + timeOffset) * maxOffset +
        Math.cos(x * waveFrequency * 0.7 + timeOffset * 0.8) * maxOffset * 0.5
      );
      const offsetY = Math.floor(
        Math.cos(x * waveFrequency + timeOffset) * maxOffset * 0.7 +
        Math.sin(y * waveFrequency * 0.6 + timeOffset * 1.2) * maxOffset * 0.3
      );
      
      // Calculate source coordinates with displacement
      let sourceX = x + offsetX;
      let sourceY = y + offsetY;
      
      // Constrain to image bounds
      sourceX = p.constrain(sourceX, 0, width - 1);
      sourceY = p.constrain(sourceY, 0, height - 1);
      
      // Get source pixel index
      const sourceIndex = (sourceX + sourceY * width) * 4;
      const targetIndex = (x + y * width) * 4;
      
      // Copy pixel from source to target (creates warping effect)
      pixels[targetIndex] = tempPixels[sourceIndex]; // R
      pixels[targetIndex + 1] = tempPixels[sourceIndex + 1]; // G
      pixels[targetIndex + 2] = tempPixels[sourceIndex + 2]; // B
      pixels[targetIndex + 3] = tempPixels[sourceIndex + 3]; // A
    }
  }
  
  p.updatePixels();
}

// Helper function to apply chromatic aberration effect
function applyChromaticAberrationEffect(p, chromaIntensity) {
  p.loadPixels();
  const pixels = p.pixels;
  const tempPixels = new Uint8ClampedArray(pixels); // Copy original pixels
  const width = p.width;
  const height = p.height;
  const offset = Math.floor(chromaIntensity * 5); // Pixel offset

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const targetIndex = (x + y * width) * 4;

      // Sample R from slightly right
      let sourceX_R = p.constrain(x + offset, 0, width - 1);
      const sourceIndex_R = (sourceX_R + y * width) * 4;
      pixels[targetIndex] = tempPixels[sourceIndex_R];

      // G is from original position
      pixels[targetIndex + 1] = tempPixels[targetIndex + 1];

      // Sample B from slightly left
      let sourceX_B = p.constrain(x - offset, 0, width - 1);
      const sourceIndex_B = (sourceX_B + y * width) * 4;
      pixels[targetIndex + 2] = tempPixels[sourceIndex_B + 2];

      pixels[targetIndex + 3] = tempPixels[targetIndex + 3]; // Alpha
    }
  }
  p.updatePixels();
}

// Helper function to add tooltips to GUI controls
function addTooltip(controller, tooltipText) {
  // Add title to the controller's DOM element
  if (controller.domElement) {
    controller.domElement.title = tooltipText;
  }
  
  // Also add title to the slider element if it exists
  setTimeout(function() {
    const slider = controller.domElement.querySelector('.slider');
    if (slider) {
      slider.title = tooltipText;
    }
    // Add title to the property name label
    const propertyName = controller.domElement.querySelector('.property-name');
    if (propertyName) {
      propertyName.title = tooltipText;
    }
    // Add title to the entire control row
    const controlRow = controller.domElement.closest('.cr');
    if (controlRow) {
      controlRow.title = tooltipText;
    }
  }, 100);
}

function initGUI() {
  const dat = window.dat;
  if (!dat) {
    console.error('dat.GUI not loaded');
    return;
  }
  
  // Randomize parameters before creating GUI
  randomizeParams();
  
  gui = new dat.GUI();
  
  // Force GUI to be positioned on the right side
  // Use setTimeout to ensure GUI element is created
  setTimeout(function() {
    const guiElement = document.querySelector('.dg.ac');
    if (guiElement) {
      guiElement.style.setProperty('right', '0', 'important');
      guiElement.style.setProperty('left', 'auto', 'important');
      guiElement.style.setProperty('margin-left', 'auto', 'important');
      guiElement.style.setProperty('margin-right', '0', 'important');
      console.log('GUI positioned on right side');
    }
  }, 100);
  
  // Also watch for GUI element creation
  const checkGUI = setInterval(function() {
    const guiElement = document.querySelector('.dg.ac');
    if (guiElement) {
      guiElement.style.setProperty('right', '0', 'important');
      guiElement.style.setProperty('left', 'auto', 'important');
      clearInterval(checkGUI);
    }
  }, 50);
  
  // Stop checking after 2 seconds
  setTimeout(function() {
    clearInterval(checkGUI);
  }, 2000);
  
  // Close GUI on mobile devices initially
  if (window.innerWidth <= 767) {
    gui.close();
  }
  
  // Add listeners to log changes for debugging with tooltips
  const intensityCtrl = gui.add(params, 'intensity', 0.0, 2.0).name('Intensity').step(0.01);
  addTooltip(intensityCtrl, 'Controls the overall intensity of the glitch effect');
  intensityCtrl.onChange(function(value) {
    console.log('Intensity changed to:', value);
  });
  
  const scanLinesCtrl = gui.add(params, 'scanLines', 0.0, 1.0).name('Scan Lines').step(0.01);
  addTooltip(scanLinesCtrl, 'Adds horizontal scan line patterns across the image');
  scanLinesCtrl.onChange(function(value) {
    console.log('Scan Lines changed to:', value);
  });
  
  const colorShiftCtrl = gui.add(params, 'colorShift', 0.0, 2.0).name('Color Shift').step(0.01);
  addTooltip(colorShiftCtrl, 'Shifts the color balance between red and blue channels');
  colorShiftCtrl.onChange(function(value) {
    console.log('Color Shift changed to:', value);
  });
  
  const displacementCtrl = gui.add(params, 'displacement', 0.0, 2.0).name('Displacement').step(0.01);
  addTooltip(displacementCtrl, 'Creates wave-like warping and distortion effects');
  displacementCtrl.onChange(function(value) {
    console.log('Displacement changed to:', value);
  });
  
  const noiseCtrl = gui.add(params, 'noise', 0.0, 1.0).name('Noise').step(0.01);
  addTooltip(noiseCtrl, 'Adds random pixel noise to the image');
  noiseCtrl.onChange(function(value) {
    console.log('Noise changed to:', value);
  });
  
  const noiseSizeCtrl = gui.add(params, 'noiseSize', 1, 20, 1).name('Noise Size');
  addTooltip(noiseSizeCtrl, 'Controls the block size of noise pixels (higher = chunkier)');
  noiseSizeCtrl.onChange(function(value) {
    console.log('Noise Size changed to:', value);
  });
  
  const chromaticAberrationCtrl = gui.add(params, 'chromaticAberration', 0.0, 2.0).name('Chromatic Aberration').step(0.01);
  addTooltip(chromaticAberrationCtrl, 'Separates RGB channels creating color fringing effects');
  chromaticAberrationCtrl.onChange(function(value) {
    console.log('Chromatic Aberration changed to:', value);
  });
  
  // Add toggle for shader vs JS effects
  const shaderCtrl = gui.add({ useShader: useShader }, 'useShader').name('Use Shader');
  addTooltip(shaderCtrl, 'Toggles between shader and JavaScript-based effects (requires WEBGL mode)');
  shaderCtrl.onChange(function(value) {
    useShader = value;
    console.log('Shader mode:', value ? 'ON (requires WEBGL mode)' : 'OFF (using JS effects in P2D mode)');
    
    if (value) {
      console.warn('⚠ Shader mode requires WEBGL, but canvas is currently in P2D mode.');
      console.warn('⚠ To use shader, the canvas needs to be recreated in WEBGL mode.');
      console.warn('⚠ Currently: Shader toggle is ON but using JS effects (P2D mode).');
    }
  });
  
  // Add JS effect selector (use randomized initial value) - all effects from index page
  const jsEffects = { mode: jsEffectMode };
  const effectController = gui.add(jsEffects, 'mode', effectModes).name('Glitch Mode');
  addTooltip(effectController, 'Selects the main glitch effect type to apply');
  effectController.onChange(function(value) {
    jsEffectMode = value;
    console.log('Glitch mode changed to:', value);
    // Clear canvas when switching effects to avoid artifacts
    if (p5Instance) {
      p5Instance.background(0);
    }
  });
  
  // Add blend mode selector (like index page)
  // Note: Blend mode is applied using p5.js blendMode() in the draw function
  gui.add(params, 'blendMode', blendModes).name('Blend Mode').onChange(function(value) {
    console.log('Blend mode changed to:', value);
    // Blend mode is applied in draw() using p5.js blendMode()
  });
  
  // Set initial opacity
  setTimeout(function() {
    const canvas = document.querySelector('#corruption-canvas');
    if (canvas) {
      canvas.style.opacity = params.opacity;
    }
  }, 100);
  
  // Log randomized setup
  console.log('Tool page initialized with randomized settings:');
  console.log('Effect mode:', jsEffectMode);
  console.log('Parameters:', params);
}

function updateFPS() {
  const fpsDisplay = document.getElementById('fps-display');
  if (fpsDisplay) {
    fpsDisplay.textContent = `FPS: ${fps}`;
  }
}

// Save function removed - now handled by setupSaveButton

// Handle image/video upload
function setupImageUpload() {
  const fileInput = document.getElementById('image-upload');
  if (!fileInput) {
    console.error('Image upload input not found');
    return;
  }
  
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    
    // Check if file is an image or video
    const isImageFile = file.type.startsWith('image/');
    const isVideoFile = file.type.startsWith('video/');
    
    // Also check file extension for .mov files (browser might not detect MIME type correctly)
    const fileName = file.name.toLowerCase();
    const isMovFile = fileName.endsWith('.mov') || fileName.endsWith('.mp4') || fileName.endsWith('.webm') || fileName.endsWith('.avi') || fileName.endsWith('.m4v');
    
    console.log('File upload:', {
      name: file.name,
      type: file.type,
      size: file.size,
      isImageFile: isImageFile,
      isVideoFile: isVideoFile,
      isMovFile: isMovFile
    });
    
    if (!isImageFile && !isVideoFile && !isMovFile) {
      alert('Please select an image or video file');
      return;
    }
    
    // Treat .mov and other video extensions as video files
    const shouldTreatAsVideo = isVideoFile || isMovFile;
    
    // Create FileReader to load the file
    const reader = new FileReader();
    
    reader.onload = function(event) {
      const fileUrl = event.target.result;
      
      // Wait for p5 instance to be ready
      const checkP5AndLoad = setInterval(function() {
        if (p5Instance) {
          clearInterval(checkP5AndLoad);
          
          if (shouldTreatAsVideo) {
            // Load video using p5.js's createVideo method
            try {
              // Remove old video if exists
              if (humanoidVideo && humanoidVideo.elt) {
                humanoidVideo.remove();
              }
              const oldVideo = document.querySelector('#uploaded-video');
              if (oldVideo) {
                oldVideo.remove();
              }
              
              // Use p5.js's createVideo to properly create a video element
              // This ensures p5.js recognizes it as a valid media element
              console.log('Creating video element for:', fileName);
              humanoidVideo = p5Instance.createVideo(fileUrl, function() {
                console.log('✅ Video uploaded and loaded successfully (p5.js)');
                console.log('Video dimensions:', humanoidVideo.width, 'x', humanoidVideo.height);
                console.log('Video readyState:', humanoidVideo.elt.readyState);
                
                isVideo = true;
                humanoidImg = null; // Clear image
                
                // Configure video properties
                humanoidVideo.loop();
                humanoidVideo.elt.muted = true; // Muted for autoplay
                humanoidVideo.elt.playsInline = true; // Important for mobile
                humanoidVideo.hide(); // Hide video element, we'll render it on canvas
                
                // Start playing video
                try {
                  const playPromise = humanoidVideo.play();
                  if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function(err) {
                      console.error('Failed to play video:', err);
                      // Try again after a short delay
                      setTimeout(function() {
                        try {
                          const retryPromise = humanoidVideo.play();
                          if (retryPromise && typeof retryPromise.catch === 'function') {
                            retryPromise.catch(function(err2) {
                              console.error('Failed to play video on retry:', err2);
                            });
                          }
                        } catch (err2) {
                          console.error('Failed to play video on retry:', err2);
                        }
                      }, 500);
                    });
                  } else {
                    // play() doesn't return a Promise, just call it
                    humanoidVideo.play();
                  }
                } catch (err) {
                  console.error('Error calling play():', err);
                }
                
                // Show save button
                const saveButton = document.getElementById('save-button');
                if (saveButton) {
                  saveButton.style.display = 'inline-block';
                }
              }, function(err) {
                console.error('Failed to load video:', err);
                alert('Failed to load video. Please try another file.');
              });
              
              // Also listen for canplay event to ensure video is ready
              if (humanoidVideo && humanoidVideo.elt) {
                humanoidVideo.elt.addEventListener('canplay', function() {
                  console.log('Video can play, readyState:', humanoidVideo.elt.readyState);
                  if (humanoidVideo.elt.paused) {
                    try {
                      const playPromise = humanoidVideo.play();
                      if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function(err) {
                          console.error('Failed to play video on canplay:', err);
                        });
                      }
                    } catch (err) {
                      console.error('Error calling play() on canplay:', err);
                    }
                  }
                });
                
              humanoidVideo.elt.addEventListener('error', function(err) {
                console.error('❌ Failed to load video:', err);
                console.error('Video error details:', humanoidVideo.elt.error);
                console.error('Video error code:', humanoidVideo.elt.error ? humanoidVideo.elt.error.code : 'N/A');
                console.error('Video error message:', humanoidVideo.elt.error ? humanoidVideo.elt.error.message : 'N/A');
                alert('Failed to load video. The file format may not be supported by your browser. Try converting to MP4 or WebM format.');
              });
              
              // Add additional error listeners
              humanoidVideo.elt.addEventListener('loadstart', function() {
                console.log('Video load started');
              });
              
              humanoidVideo.elt.addEventListener('loadedmetadata', function() {
                console.log('Video metadata loaded');
                console.log('Video dimensions (HTML):', humanoidVideo.elt.videoWidth, 'x', humanoidVideo.elt.videoHeight);
              });
              
              humanoidVideo.elt.addEventListener('canplay', function() {
                console.log('Video can play');
              });
              
              humanoidVideo.elt.addEventListener('stalled', function() {
                console.warn('Video loading stalled');
              });
              
              humanoidVideo.elt.addEventListener('suspend', function() {
                console.warn('Video loading suspended');
              });
              }
            } catch (error) {
              console.error('Error loading video:', error);
              alert('Failed to load video. Please try another file.');
            }
          } else {
            // Load image using p5's loadImage
            try {
              humanoidImg = p5Instance.loadImage(fileUrl, function(img) {
                console.log('Image uploaded and loaded successfully');
                console.log('Image dimensions:', img.width, 'x', img.height);
                humanoidImg = img;
                isVideo = false;
                humanoidVideo = null; // Clear video
                
                // Show save button for images
                const saveButton = document.getElementById('save-button');
                if (saveButton) {
                  saveButton.style.display = 'inline-block';
                }
              }, function(err) {
                console.error('Failed to load uploaded image:', err);
                alert('Failed to load image. Please try another file.');
              });
            } catch (error) {
              console.error('Error loading image:', error);
              alert('Failed to load image. Please try another file.');
            }
          }
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(function() {
        clearInterval(checkP5AndLoad);
        if (!p5Instance) {
          alert('Failed to initialize media loader. Please refresh the page.');
        }
      }, 5000);
    };
    
    reader.onerror = function() {
      console.error('FileReader error');
      alert('Failed to read file. Please try another file.');
    };
    
    // Read file as data URL
    reader.readAsDataURL(file);
  });
}

// Handle save button - works for both images and videos
function setupSaveButton() {
  const saveButton = document.getElementById('save-button');
  if (!saveButton) {
    console.error('Save button not found');
    return;
  }
  
  saveButton.addEventListener('click', function() {
    if (!p5Instance) {
      alert('No media loaded to save');
      return;
    }
    
    // Get the canvas element
    const canvas = document.querySelector('#corruption-canvas');
    if (!canvas) {
      alert('Canvas not found');
      return;
    }
    
    if (isVideo && humanoidVideo) {
      // Save as video - start recording
      startVideoRecording(canvas);
    } else if (humanoidImg) {
      // Save as image
      saveImage(canvas);
    } else {
      alert('No image or video loaded to save');
    }
  });
}

// Save canvas as image (without background)
function saveImage(canvas) {
  try {
    // If we have media dimensions, crop to just the image area
    if (currentDisplayWidth > 0 && currentDisplayHeight > 0) {
      // Create a new canvas with only the image dimensions
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = currentDisplayWidth;
      croppedCanvas.height = currentDisplayHeight;
      const ctx = croppedCanvas.getContext('2d');
      
      // Calculate source rectangle (centered on main canvas)
      const sourceX = currentMediaX - currentDisplayWidth / 2;
      const sourceY = currentMediaY - currentDisplayHeight / 2;
      
      // Draw only the image area from the main canvas to the cropped canvas
      ctx.drawImage(
        canvas,
        sourceX, sourceY, currentDisplayWidth, currentDisplayHeight, // Source rectangle
        0, 0, currentDisplayWidth, currentDisplayHeight // Destination rectangle
      );
      
      // Save the cropped canvas
      croppedCanvas.toBlob(function(blob) {
        if (!blob) {
          alert('Failed to create image file');
          return;
        }
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'corrupted-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        console.log('Image saved successfully (cropped to media size)');
      }, 'image/png');
    } else {
      // Fallback: save entire canvas if dimensions not available
      canvas.toBlob(function(blob) {
        if (!blob) {
          alert('Failed to create image file');
          return;
        }
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'corrupted-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        console.log('Image saved successfully (full canvas)');
      }, 'image/png');
    }
  } catch (error) {
    console.error('Error saving image:', error);
    alert('Failed to save image. Please try again.');
  }
}

// Start recording canvas as video (without background)
function startVideoRecording(canvas) {
  try {
    let stream;
    
    // If we have media dimensions, create a cropped canvas for recording
    if (currentDisplayWidth > 0 && currentDisplayHeight > 0) {
      // Create a cropped canvas with only the image dimensions
      croppedRecordingCanvas = document.createElement('canvas');
      croppedRecordingCanvas.width = currentDisplayWidth;
      croppedRecordingCanvas.height = currentDisplayHeight;
      
      // Get stream from cropped canvas
      stream = croppedRecordingCanvas.captureStream(30); // 30 FPS
    } else {
      // Fallback: use full canvas if dimensions not available
      stream = canvas.captureStream(30); // 30 FPS
    }
    
    // Create MediaRecorder
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorder.ondataavailable = function(event) {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = function() {
      // Create blob from recorded chunks
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'corrupted-video.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      URL.revokeObjectURL(url);
      recordedChunks = [];
      croppedRecordingCanvas = null; // Clean up cropped canvas
      
      console.log('Video saved successfully (cropped to media size)');
      alert('Video saved!');
    };
    
    // Start recording
    mediaRecorder.start();
    isRecording = true;
    
    // Update button text
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
      saveButton.textContent = 'Recording...';
      saveButton.disabled = true;
    }
    
    // Record for 10 seconds (or until user stops)
    // For now, record for 10 seconds
    setTimeout(function() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        isRecording = false;
        
        if (saveButton) {
          saveButton.textContent = 'Save';
          saveButton.disabled = false;
        }
      }
    }, 10000); // Record 10 seconds
    
    console.log('Started recording video');
  } catch (error) {
    console.error('Error starting video recording:', error);
    alert('Failed to start recording. Your browser may not support video recording.');
    
    // Reset button
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
      saveButton.textContent = 'Save';
      saveButton.disabled = false;
    }
  }
}

// Initialize p5 sketch
new p5(sketch);

// Setup image upload and save button after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setupImageUpload();
    setupSaveButton();
  });
} else {
  setupImageUpload();
  setupSaveButton();
}

// Position upload container (with both buttons) below GUI, and back button below upload container
function positionUploadButton() {
  // Skip positioning on mobile - CSS handles it with relative positioning
  if (window.innerWidth <= 767) {
    return;
  }
  
  const uploadContainer = document.getElementById('upload-container');
  const backButtonContainer = document.getElementById('back-button-container');
  const guiElement = document.querySelector('.dg.ac');
  
  if (uploadContainer && guiElement) {
    // Use requestAnimationFrame to ensure we get the position after browser has rendered
    requestAnimationFrame(function() {
      // Get the full bounding box of the GUI including all its content
      // Since both GUI and buttons are position: fixed, getBoundingClientRect() 
      // gives us viewport-relative coordinates which work perfectly
      const guiRect = guiElement.getBoundingClientRect();
      
      // Also check scrollHeight and offsetHeight to get the full content height
      const scrollHeight = guiElement.scrollHeight;
      const offsetHeight = guiElement.offsetHeight;
      
      // Find the last visible child element to get the true bottom
      const allChildren = guiElement.querySelectorAll('*');
      let maxBottom = guiRect.bottom;
      
      // Check all children to find the actual bottom-most element
      allChildren.forEach(function(child) {
        const childRect = child.getBoundingClientRect();
        if (childRect.bottom > maxBottom) {
          maxBottom = childRect.bottom;
        }
      });
      
      // Use the maximum of all methods to ensure we get the full height
      const actualHeight = Math.max(
        guiRect.height, 
        scrollHeight, 
        offsetHeight,
        maxBottom - guiRect.top
      );
      const guiBottom = guiRect.top + actualHeight;
      
      const spacing = 15; // Space between GUI and buttons
      
      // Use the bottom of the GUI + spacing for the button top position
      uploadContainer.style.top = (guiBottom + spacing) + 'px';
      
      // Position back button below upload container
      if (backButtonContainer) {
        const uploadRect = uploadContainer.getBoundingClientRect();
        backButtonContainer.style.top = (uploadRect.bottom + 10) + 'px';
        backButtonContainer.style.right = '20px';
        backButtonContainer.style.left = 'auto';
        backButtonContainer.style.bottom = 'auto';
      }
      
      // Debug log (only occasionally to avoid spam)
      if (typeof frameCount !== 'undefined' && frameCount % 120 === 0) {
        console.log('GUI positioning:', {
          guiRect: { top: guiRect.top, bottom: guiRect.bottom, height: guiRect.height, width: guiRect.width },
          scrollHeight,
          offsetHeight,
          actualHeight,
          buttonTop: guiBottom + spacing,
          uploadContainerTop: uploadContainer.style.top
        });
      }
    });
  } else if (uploadContainer) {
    // Fallback: position below where GUI typically is (GUI is at top: 20px)
    // Estimate GUI height when expanded (approximately 400-500px with all controls)
    uploadContainer.style.top = '520px';
    
    // Position back button below upload container in fallback case
    if (backButtonContainer) {
      backButtonContainer.style.top = '580px'; // Upload button height ~50px + spacing
      backButtonContainer.style.right = '20px';
      backButtonContainer.style.left = 'auto';
      backButtonContainer.style.bottom = 'auto';
    }
  }
}

// Watch for GUI changes (expand/collapse) and update upload button position
function watchGUIChanges() {
  const guiElement = document.querySelector('.dg.ac');
  if (!guiElement) {
    return;
  }
  
  // Use MutationObserver to watch for class changes and size changes
  const observer = new MutationObserver(function(mutations) {
    // Debounce the positioning to avoid too many updates
    // Use longer delay to wait for GUI animation to complete
    clearTimeout(watchGUIChanges.debounceTimer);
    watchGUIChanges.debounceTimer = setTimeout(function() {
      // Wait for animation frame to ensure GUI has finished expanding/collapsing
      requestAnimationFrame(function() {
        positionUploadButton();
      });
    }, 200); // Increased from 50ms to 200ms to wait for animations
  });
  
  // Observe changes to the GUI element
  observer.observe(guiElement, {
    attributes: true,
    attributeFilter: ['class', 'style'],
    childList: true,
    subtree: true,
    attributeOldValue: false,
    characterData: false
  });
  
  // Also watch for window resize
  window.addEventListener('resize', function() {
    clearTimeout(watchGUIChanges.resizeTimer);
    watchGUIChanges.resizeTimer = setTimeout(function() {
      requestAnimationFrame(positionUploadButton);
    }, 100);
  });
  
  // Use ResizeObserver if available for more accurate size tracking
  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(function(entries) {
      // Debounce resize observations
      clearTimeout(watchGUIChanges.resizeObserverTimer);
      watchGUIChanges.resizeObserverTimer = setTimeout(function() {
        requestAnimationFrame(positionUploadButton);
      }, 100);
    });
    
    resizeObserver.observe(guiElement);
    
    // Also observe all child elements that might change size
    const childElements = guiElement.querySelectorAll('.dg, .cr, .c');
    childElements.forEach(function(child) {
      resizeObserver.observe(child);
    });
  }
  
  // Watch for GUI open/close button clicks - ensure they work
  // Find all close buttons (dat.GUI may have multiple)
  const closeButtons = guiElement.querySelectorAll('.close-button, .close-top, .close-bottom');
  closeButtons.forEach(function(closeButton) {
    // Ensure button is clickable
    closeButton.style.pointerEvents = 'auto';
    closeButton.style.cursor = 'pointer';
    closeButton.style.zIndex = '100';
    
    // Add click listener to manually trigger close if needed
    closeButton.addEventListener('click', function(e) {
      console.log('Close button clicked');
      
      // Check if GUI is currently closed
      const isCurrentlyClosed = guiElement.classList.contains('closed');
      
      // Manually toggle the closed class if dat.GUI doesn't do it
      if (isCurrentlyClosed) {
        guiElement.classList.remove('closed');
        console.log('Opening GUI');
      } else {
        guiElement.classList.add('closed');
        console.log('Closing GUI');
      }
      
      // Also try dat.GUI's built-in methods
      if (gui && typeof gui.open === 'function' && typeof gui.close === 'function') {
        if (isCurrentlyClosed) {
          gui.open();
        } else {
          gui.close();
        }
      }
      
      // Wait for the GUI to finish animating
      setTimeout(function() {
        requestAnimationFrame(function() {
          positionUploadButton();
        });
      }, 400);
    }, false);
  });
  
  // Also watch for any clicks on the GUI title (which toggles expand/collapse)
  const titleElement = guiElement.querySelector('.dg .title');
  if (titleElement) {
    titleElement.style.pointerEvents = 'auto';
    titleElement.style.cursor = 'pointer';
    
    titleElement.addEventListener('click', function(e) {
      console.log('Title clicked - toggling GUI');
      
      const isCurrentlyClosed = guiElement.classList.contains('closed');
      
      // Toggle closed class
      if (isCurrentlyClosed) {
        guiElement.classList.remove('closed');
        if (gui && typeof gui.open === 'function') gui.open();
      } else {
        guiElement.classList.add('closed');
        if (gui && typeof gui.close === 'function') gui.close();
      }
      
      setTimeout(function() {
        requestAnimationFrame(function() {
          positionUploadButton();
        });
      }, 400);
    }, false);
  }
  
  // Watch for class changes to detect when GUI opens/closes
  const classObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const isClosed = guiElement.classList.contains('closed');
        console.log('GUI closed state changed:', isClosed);
        positionUploadButton();
      }
    });
  });
  
  classObserver.observe(guiElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Initial positioning
  positionUploadButton();
  
  // Also re-position periodically to catch any missed changes
  // Use a longer interval and requestAnimationFrame for accuracy
  setInterval(function() {
    requestAnimationFrame(positionUploadButton);
  }, 2000); // Check every 2 seconds
}

// Setup image upload and save button when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setupImageUpload();
    setupSaveButton();
    // Wait for GUI to be created, then position upload button and watch for changes
    setTimeout(function() {
      watchGUIChanges();
      setupMobileControlsToggle();
    }, 1000);
  });
} else {
  // Wait a bit for p5 to initialize
  setupSaveButton();
  setTimeout(setupImageUpload, 100);
  // Wait for GUI to be created, then position upload button and watch for changes
  setTimeout(function() {
    watchGUIChanges();
    setupMobileControlsToggle();
  }, 1000);
}

// Setup mobile controls toggle button
function setupMobileControlsToggle() {
  const toggleButton = document.getElementById('mobile-controls-toggle');
  const guiElement = document.querySelector('.dg.ac');
  
  if (!toggleButton || !guiElement) {
    return;
  }
  
  // Only show button on mobile - completely remove from DOM on desktop
  
  // Initially hide GUI on mobile
  guiElement.style.display = 'none';
  guiElement.classList.add('closed');
  if (gui && typeof gui.close === 'function') {
    gui.close();
  }
  
  // Toggle GUI visibility
  toggleButton.addEventListener('click', function() {
    const isHidden = guiElement.style.display === 'none' || guiElement.classList.contains('closed');
    
    if (isHidden) {
      // Show GUI
      guiElement.style.display = 'block';
      guiElement.classList.remove('closed');
      if (gui && typeof gui.open === 'function') {
        gui.open();
      }
      toggleButton.textContent = 'Close Controls';
    } else {
      // Hide GUI
      guiElement.style.display = 'none';
      guiElement.classList.add('closed');
      if (gui && typeof gui.close === 'function') {
        gui.close();
      }
    }
  });
  
  // Update button text based on GUI state
  const updateButtonText = function() {
    const isHidden = guiElement.style.display === 'none' || guiElement.classList.contains('closed');
    toggleButton.textContent = isHidden ? 'Open Controls' : 'Close Controls';
  };
  
  // Watch for GUI state changes

  
  observer.observe(guiElement, {
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  

}

