/**
 * Humanoid Glow Effect
 * Adds an animated glow effect to the humanoid
 */

export function initHumanoidGlow() {
  const humanoid = document.querySelector('.humanoid');
  
  if (!humanoid) {
    console.error('Humanoid element not found');
    return;
  }

  // Apply glow effect via CSS
  applyGlowStyles(humanoid);
  
  console.log('Humanoid glow effect initialized');
}

function applyGlowStyles(element) {
  // Create animated glow using drop-shadow filter
  element.style.filter = 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.5))';
  
  // Add pulsing animation
  element.style.animation = 'glow-pulse 3s ease-in-out infinite';
  
  // Inject keyframes if not already present
  if (!document.querySelector('#glow-keyframes')) {
    const style = document.createElement('style');
    style.id = 'glow-keyframes';
    style.textContent = `
      @keyframes glow-pulse {
        0%, 100% {
          filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) 
                  drop-shadow(0 0 40px rgba(255, 255, 255, 0.5));
        }
        50% {
          filter: drop-shadow(0 0 30px rgba(255, 255, 255, 1)) 
                  drop-shadow(0 0 60px rgba(255, 255, 255, 0.7))
                  drop-shadow(0 0 80px rgba(255, 255, 255, 0.4));
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Remove glow effect
 */
export function removeHumanoidGlow() {
  const humanoid = document.querySelector('.humanoid');
  if (humanoid) {
    humanoid.style.filter = 'none';
    humanoid.style.animation = 'none';
  }
}

/**
 * Set custom glow color
 * @param {string} color - CSS color value (e.g., 'rgba(255, 0, 0, 0.8)')
 */
export function setGlowColor(color) {
  const humanoid = document.querySelector('.humanoid');
  if (!humanoid) return;
  
  humanoid.style.filter = `drop-shadow(0 0 20px ${color}) drop-shadow(0 0 40px ${color})`;
}

