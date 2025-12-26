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
  
  if (!audio) {
    console.error('Background music: Audio element not found');
    return;
  }
  
  console.log('Background music: Audio element found', audio);
  
  // Set volume (0.0 to 1.0)
  audio.volume = 0.5;
  
  // Function to play audio on user interaction
  let hasStartedPlaying = false;
  const playOnInteraction = () => {
    if (hasStartedPlaying) return;
    
    console.log('Background music: User interaction detected, attempting to play');
    audio.play()
      .then(() => {
        console.log('Background music: Started playing after user interaction');
        hasStartedPlaying = true;
        // Remove listeners after successful play
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('keydown', playOnInteraction);
        document.removeEventListener('mousemove', playOnInteraction);
      })
      .catch(err => {
        console.error('Background music: Could not play audio after interaction', err);
      });
  };
  
  // Set up user interaction listeners immediately
  document.addEventListener('click', playOnInteraction, { once: true });
  document.addEventListener('touchstart', playOnInteraction, { once: true });
  document.addEventListener('keydown', playOnInteraction, { once: true });
  document.addEventListener('mousemove', playOnInteraction, { once: true });
  
  // Add error handler
  audio.addEventListener('error', (e) => {
    console.error('Background music: Error loading audio', e);
    console.error('Audio error details:', {
      error: audio.error,
      networkState: audio.networkState,
      readyState: audio.readyState,
      src: audio.src || audio.currentSrc
    });
  });
  
  // Add loaded handler
  audio.addEventListener('loadeddata', () => {
    console.log('Background music: Audio data loaded');
    console.log('Audio duration:', audio.duration, 'seconds');
  });
  
  // Try to play immediately if audio is ready
  const tryPlay = () => {
    if (hasStartedPlaying) return;
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Background music: Started playing successfully');
          hasStartedPlaying = true;
          // Remove listeners after successful play
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
          document.removeEventListener('keydown', playOnInteraction);
          document.removeEventListener('mousemove', playOnInteraction);
        })
        .catch((error) => {
          console.log('Background music: Autoplay prevented, waiting for user interaction', error);
          // Listeners are already set up above
        });
    }
  };
  
  // Try play if audio is already ready
  if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
    console.log('Background music: Audio already ready, attempting immediate play');
    tryPlay();
  } else {
    // Wait for audio to be ready
    audio.addEventListener('canplay', () => {
      console.log('Background music: Audio can play');
      tryPlay();
    }, { once: true });
  }
}
