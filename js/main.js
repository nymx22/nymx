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
 * Attempts to unlock audio automatically using Web Audio API
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
  
  let hasStartedPlaying = false;
  
  // Try to unlock audio context using Web Audio API
  const unlockAudio = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        
        // Create a silent buffer
        const buffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        
        // Resume audio context (required in some browsers)
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        
        console.log('Background music: Audio context unlocked');
        return true;
      }
    } catch (e) {
      console.log('Background music: Could not unlock audio context', e);
    }
    return false;
  };
  
  // Function to play audio
  const tryPlay = () => {
    if (hasStartedPlaying) return false;
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          console.log('Background music: Started playing successfully');
          hasStartedPlaying = true;
          return true;
        })
        .catch((error) => {
          console.log('Background music: Play attempt failed', error);
          return false;
        });
    }
    return Promise.resolve(false);
  };
  
  // Function to play audio on user interaction (fallback)
  const playOnInteraction = () => {
    if (hasStartedPlaying) return;
    
    console.log('Background music: User interaction detected, attempting to play');
    tryPlay().then(success => {
      if (success) {
        // Remove listeners after successful play
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('keydown', playOnInteraction);
        document.removeEventListener('mousemove', playOnInteraction);
      }
    });
  };
  
  // Set up user interaction listeners as fallback
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
  
  // Try to unlock audio immediately
  unlockAudio();
  
  // Try multiple play attempts with delays
  const attemptAutoPlay = () => {
    // Try immediately
    tryPlay();
    
    // Try after short delay
    setTimeout(() => {
      if (!hasStartedPlaying) {
        console.log('Background music: Retry attempt 1');
        tryPlay();
      }
    }, 100);
    
    // Try after medium delay
    setTimeout(() => {
      if (!hasStartedPlaying) {
        console.log('Background music: Retry attempt 2');
        tryPlay();
      }
    }, 500);
    
    // Try after longer delay
    setTimeout(() => {
      if (!hasStartedPlaying) {
        console.log('Background music: Retry attempt 3');
        tryPlay();
      }
    }, 1000);
  };
  
  // Try play if audio is already ready
  if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
    console.log('Background music: Audio already ready, attempting immediate play');
    attemptAutoPlay();
  } else {
    // Wait for audio to be ready
    audio.addEventListener('canplay', () => {
      console.log('Background music: Audio can play');
      attemptAutoPlay();
    }, { once: true });
  }
  
  // Also try when page becomes visible (if it was hidden)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !hasStartedPlaying) {
      console.log('Background music: Page visible, attempting to play');
      setTimeout(() => tryPlay(), 100);
    }
  });
}
