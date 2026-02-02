/**
 * Initialize background music
 * Handles autoplay restrictions and user interaction
 * Attempts to unlock audio automatically using Web Audio API
 * Continues playback across page navigations
 */

// Set to true to enable background music
const MUSIC_ENABLED = false;

export function initBackgroundMusic() {
  if (!MUSIC_ENABLED) {
    return;
  }

  const audio = document.getElementById('background-music');
  
  if (!audio) {
    console.error('Background music: Audio element not found');
    return;
  }
  
  console.log('Background music: Audio element found', audio);
  
  // Set volume (0.0 to 1.0)
  audio.volume = 0.5;
  
  // Restore playback state from previous page
  const savedTime = sessionStorage.getItem('music_currentTime');
  const wasPlaying = sessionStorage.getItem('music_wasPlaying') === 'true';
  
  if (savedTime !== null) {
    const resumeTime = parseFloat(savedTime);
    console.log('Background music: Restoring playback from', resumeTime, 'seconds');
    
    // Set the current time when audio is ready
    const setResumeTime = () => {
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        audio.currentTime = resumeTime;
        console.log('Background music: Resumed at', audio.currentTime, 'seconds');
      } else {
        // Wait for audio to load
        audio.addEventListener('loadeddata', () => {
          audio.currentTime = resumeTime;
          console.log('Background music: Resumed at', audio.currentTime, 'seconds');
        }, { once: true });
      }
    };
    
    setResumeTime();
  }
  
  // Save playback state before page unload
  const savePlaybackState = () => {
    if (audio && !audio.paused) {
      sessionStorage.setItem('music_currentTime', audio.currentTime.toString());
      sessionStorage.setItem('music_wasPlaying', 'true');
      console.log('Background music: Saved state - time:', audio.currentTime, 'playing: true');
    } else if (audio) {
      sessionStorage.setItem('music_currentTime', audio.currentTime.toString());
      sessionStorage.setItem('music_wasPlaying', 'false');
      console.log('Background music: Saved state - time:', audio.currentTime, 'playing: false');
    }
  };
  
  // Save state periodically while playing
  let saveInterval = null;
  const startSavingState = () => {
    if (saveInterval) clearInterval(saveInterval);
    saveInterval = setInterval(() => {
      if (audio && !audio.paused) {
        sessionStorage.setItem('music_currentTime', audio.currentTime.toString());
        sessionStorage.setItem('music_wasPlaying', 'true');
      }
    }, 1000); // Save every second
  };
  
  // Save state on page unload
  window.addEventListener('beforeunload', savePlaybackState);
  window.addEventListener('pagehide', savePlaybackState);
  
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
  const tryPlay = (shouldResume = false) => {
    // If already playing and not resuming, don't restart
    if (hasStartedPlaying && !audio.paused && !shouldResume) return false;
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          console.log('Background music: Started playing successfully');
          hasStartedPlaying = true;
          startSavingState(); // Start saving state periodically
          return true;
        })
        .catch((error) => {
          console.log('Background music: Play attempt failed', error);
          return false;
        });
    }
    return Promise.resolve(false);
  };
  
  // If music was playing on previous page, try to resume
  if (wasPlaying && savedTime !== null) {
    console.log('Background music: Attempting to resume playback from previous page at', savedTime, 'seconds');
    
    // Set currentTime first, then play
    const attemptResume = () => {
      const resumeTime = parseFloat(savedTime);
      
      if (audio.readyState >= 2) {
        // Audio is ready, set time and play
        audio.currentTime = resumeTime;
        console.log('Background music: Set currentTime to', audio.currentTime, 'seconds');
        
        // Small delay to ensure currentTime is set before playing
        setTimeout(() => {
          tryPlay(true).then(() => {
            console.log('Background music: Resumed playback successfully');
          });
        }, 50);
      } else {
        // Wait for audio to load
        const onCanPlay = () => {
          audio.currentTime = resumeTime;
          console.log('Background music: Set currentTime to', audio.currentTime, 'seconds');
          
          setTimeout(() => {
            tryPlay(true).then(() => {
              console.log('Background music: Resumed playback successfully');
            });
          }, 50);
        };
        
        audio.addEventListener('canplay', onCanPlay, { once: true });
        audio.addEventListener('loadeddata', onCanPlay, { once: true });
      }
    };
    
    // Try to resume after ensuring audio element is ready
    if (audio.readyState >= 1) { // HAVE_METADATA or higher
      attemptResume();
    } else {
      audio.addEventListener('loadedmetadata', attemptResume, { once: true });
    }
  }
  
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
  
  // Try play if audio is already ready (only if not resuming from previous page)
  if (!wasPlaying) {
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
  }
  
  // Also try when page becomes visible (if it was hidden)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !hasStartedPlaying) {
      console.log('Background music: Page visible, attempting to play');
      setTimeout(() => tryPlay(), 100);
    }
  });
}

