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

  // Glow effect is now handled by glow.css
  console.log('Humanoid glow effect initialized');
}

/**
 * Remove glow effect
 */
export function removeHumanoidGlow() {
  const humanoid = document.querySelector('.humanoid');
  if (humanoid) {
    humanoid.classList.remove('humanoid');
  }
}


