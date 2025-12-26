import { domReady } from './lib/utils.js';
import { initWindowManager } from './lib/windowManager.js';
import { initDesktopLogic } from './lib/desktop/desktopLogic.js';
import { attachInteractions } from './lib/interactions.js';
import { bootstrapDesktopUI } from './ui/desktop.js';
import { GlitchEngine } from './lib/desktop/glitchEngine.js';
import { randomizeBgColor } from './lib/desktop/bgcolor.js';
import { initHumanoidGlow } from './lib/desktop/glow.js';
import { initWeldingSparks } from './lib/desktop/sparks.js';
import { initCustomCursor } from './lib/desktop/cursor.js';
import { initHumanoidHover } from './lib/desktop/hover.js';

domReady(() => {
  bootstrapDesktopUI();
  initWindowManager();
  initDesktopLogic();
  attachInteractions();
  
  // Initialize glitch system with dat.GUI
  const glitchEngine = new GlitchEngine();
  glitchEngine.init();
  
  // Randomize background color from humanoid GIF
  randomizeBgColor();
  
  // Initialize humanoid glow effect
  initHumanoidGlow();
  
  // Initialize welding sparks effect
  initWeldingSparks();
  
  // Initialize custom animated cursor
  initCustomCursor();
  
  // Initialize humanoid hover interaction
  initHumanoidHover();
  
  // Initialize background music
  initBackgroundMusic();
});

/**
 * Initialize background music
 * Handles autoplay restrictions and user interaction
 */
function initBackgroundMusic() {
  const audio = document.getElementById('background-music');
  if (!audio) return;
  
  // Set volume (0.0 to 1.0)
  audio.volume = 0.5;
  
  // Try to play audio
  const playPromise = audio.play();
  
  // Handle autoplay restrictions
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        // Audio started playing
        console.log('Background music started');
      })
      .catch((error) => {
        // Autoplay was prevented
        console.log('Autoplay prevented, will play on user interaction');
        
        // Play on first user interaction
        const playOnInteraction = () => {
          audio.play().catch(err => console.log('Could not play audio:', err));
          // Remove listeners after first play
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
          document.removeEventListener('keydown', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction, { once: true });
        document.addEventListener('touchstart', playOnInteraction, { once: true });
        document.addEventListener('keydown', playOnInteraction, { once: true });
      });
  }
}
