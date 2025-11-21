/**
 * GlitchControls - UI component for glitch effect switching
 * Creates and manages control buttons in the bottom section
 */

export function initGlitchControls(glitchEngine) {
  const bottomSection = document.querySelector('.bottom-section');
  
  if (!bottomSection) {
    console.error('Bottom section not found');
    return;
  }

  // Create controls container
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'glitch-controls';
  
  // Button configurations
  const buttons = [
    { mode: 0, label: 'Off', title: 'Disable glitch effects' },
    { mode: 1, label: 'Blue Bands', title: 'Horizontal sync drift' },
    { mode: 2, label: 'Snow', title: 'White noise static' },
    { mode: 3, label: 'Purple Static', title: 'Filtered noise with chroma shift' },
    { mode: 4, label: 'Color Lines', title: 'Line-wise corruption' },
    { mode: 5, label: 'Smear', title: 'Vertical timebase error' }
  ];

  // Create buttons
  buttons.forEach(({ mode, label, title }) => {
    const button = document.createElement('button');
    button.className = 'glitch-btn';
    button.dataset.mode = mode;
    button.textContent = label;
    button.title = title;
    
    // Set initial active state
    if (mode === 0) {
      button.classList.add('active');
    }
    
    // Click handler
    button.addEventListener('click', () => {
      // Switch glitch mode
      glitchEngine.switchMode(mode);
      
      // Update active state
      document.querySelectorAll('.glitch-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
    });
    
    controlsContainer.appendChild(button);
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Number keys 0-5 to switch modes
    if (e.key >= '0' && e.key <= '5') {
      const mode = parseInt(e.key);
      glitchEngine.switchMode(mode);
      
      // Update UI
      document.querySelectorAll('.glitch-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.mode) === mode) {
          btn.classList.add('active');
        }
      });
    }
  });

  bottomSection.appendChild(controlsContainer);
}

