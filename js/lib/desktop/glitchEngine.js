/**
 * GlitchEngine - Core p5.js-based glitch effect system
 * Manages canvas, effect switching, and rendering loop with dat.GUI controls
 */

import { blueBands } from '../../effects/glitch/blueBands.js';
import { pureSnow } from '../../effects/glitch/pureSnow.js';
import { purpleStatic } from '../../effects/glitch/purpleStatic.js';
import { colorLineNoise } from '../../effects/glitch/colorLineNoise.js';
import { smear } from '../../effects/glitch/smear.js';

export class GlitchEngine {
  constructor() {
    this.p5Instance = null;
    this.gui = null;
    
    // GUI parameters
    this.params = {
      mode: 'Off',
      opacity: 0.8
    };
    
    // Effect mapping
    this.effectMap = {
      'off': null,
      'band': blueBands,
      'snow': pureSnow,
      'static': purpleStatic,
      'color': colorLineNoise,
      'smear': smear
    };
    
    this.modeOptions = ['off', 'band', 'snow', 'static', 'color', 'smear'];
  }

  /**
   * Randomize glitch mode and opacity
   */
  randomize() {
    // Get random mode (excluding 'Off' at index 0)
    const randomIndex = Math.floor(Math.random() * (this.modeOptions.length - 1)) + 1;
    this.params.mode = this.modeOptions[randomIndex];
    
    // Random opacity between 0.3 and 1.0
    this.params.opacity = Math.random() * 0.7 + 0.3;
    
    // Update GUI controllers to reflect random values
    if (this.gui) {
      // Update all controllers
      for (let i in this.gui.__controllers) {
        this.gui.__controllers[i].updateDisplay();
      }
    }
    
    // Apply opacity to canvas immediately
    const canvas = document.querySelector('#glitch-canvas canvas');
    if (canvas) {
      canvas.style.opacity = this.params.opacity;
    }
    
    console.log(`Randomized: ${this.params.mode} at ${(this.params.opacity * 100).toFixed(0)}% opacity`);
  }

  /**
   * Initialize the p5.js sketch and dat.GUI
   */
  init() {
    // Initialize dat.GUI first
    this.initGUI();
    
    // Initialize p5.js sketch
    const sketch = (p) => {
      this.p5Instance = p;

      p.setup = () => {
        // Canvas size: full viewport
        const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.parent('glitch-canvas');
        
        // Performance optimizations
        p.pixelDensity(1);
        p.frameRate(30);
        
        // Initial background
        p.background(255);
        
        // Randomize after canvas is created
        this.randomize();
      };

      p.draw = () => {
        // Get current effect
        const effect = this.effectMap[this.params.mode];
        
        if (!effect) {
          p.clear();
        } else {
          effect(p);
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };
    };

    // Create p5 instance
    new p5(sketch);
  }

  /**
   * Initialize dat.GUI controls
   */
  initGUI() {
    // Access dat.GUI from window object (loaded via CDN)
    const dat = window.dat;
    if (!dat) {
      console.error('dat.GUI not loaded');
      return;
    }
    
    this.gui = new dat.GUI();
    
    // Mode selector
    this.gui.add(this.params, 'mode', this.modeOptions)
      .name('Glitch Mode')
      .onChange((value) => {
        // Clear canvas when switching to Off
        if (value === 'Off' && this.p5Instance) {
          this.p5Instance.clear();
        }
      });
    
    // Opacity control
    const opacityController = this.gui.add(this.params, 'opacity', 0, 1, 0.1)
      .name('Opacity')
      .onChange((value) => {
        const canvas = document.querySelector('#glitch-canvas canvas');
        if (canvas) {
          canvas.style.opacity = value;
        }
      });
    
    // Set initial opacity
    setTimeout(() => {
      const canvas = document.querySelector('#glitch-canvas canvas');
      if (canvas) {
        canvas.style.opacity = this.params.opacity;
      }
    }, 100);
  }

  /**
   * Get current active mode
   * @returns {string} Current mode name
   */
  getCurrentMode() {
    return this.params.mode;
  }
}

