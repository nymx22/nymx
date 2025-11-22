/**
 * Custom Animated Cursor
 * Creates a custom cursor using the cursor.gif that follows the mouse
 * Highly optimized using CSS variables for maximum performance
 */

export function initCustomCursor() {
  // Create custom cursor element
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  
  // Set initial CSS variables to center of screen
  cursor.style.setProperty('--mouse-x', `${window.innerWidth / 2 - 32}px`);
  cursor.style.setProperty('--mouse-y', `${window.innerHeight / 2 - 32}px`);
  
  // Start with cursor hidden
  cursor.style.opacity = '0';

  document.body.appendChild(cursor);

  // Create sparkle container for cursor2 firework effect
  const sparkleContainer = document.createElement('div');
  sparkleContainer.className = 'cursor2-sparkles';
  document.body.appendChild(sparkleContainer);

  // Firework sparkle generation (optimized)
  let isCursor2 = false;
  let lastSparkleTime = 0;
  let rafId = null;
  
  // Cache background colors (update periodically)
  let cachedBgColor = 'rgba(173, 216, 230, 1)';
  let cachedBgColorDim = 'rgba(173, 216, 230, 0.6)';
  
  function updateCachedColors() {
    cachedBgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim() || 'rgba(173, 216, 230, 1)';
    cachedBgColorDim = getComputedStyle(document.documentElement).getPropertyValue('--bg-color-dim').trim() || 'rgba(173, 216, 230, 0.6)';
  }
  
  // Update colors every 500ms
  setInterval(updateCachedColors, 500);
  updateCachedColors();

  function createFireworkSparkle(x, y) {
    // Create 8-12 sparkle lines radiating outward (reduced for performance)
    const particleCount = 8 + Math.floor(Math.random() * 5);
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < particleCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'cursor2-sparkle-line';
      
      // Random angle for firework burst (360 degrees)
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
      const distance = 25 + Math.random() * 35; // Distance lines travel
      const lineLength = 8 + Math.random() * 12;
      const lineWidth = 1.5 + Math.random() * 1;
      const duration = 0.5 + Math.random() * 0.3;
      
      // Calculate end position
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      // Use CSS variables for transform (GPU accelerated)
      sparkle.style.setProperty('--start-x', `${x}px`);
      sparkle.style.setProperty('--start-y', `${y}px`);
      sparkle.style.setProperty('--end-x', `${endX}px`);
      sparkle.style.setProperty('--end-y', `${endY}px`);
      sparkle.style.setProperty('--angle', `${angle}rad`);
      sparkle.style.setProperty('--length', `${lineLength}px`);
      sparkle.style.setProperty('--width', `${lineWidth}px`);
      sparkle.style.background = cachedBgColor;
      sparkle.style.boxShadow = `0 0 ${lineWidth * 2}px ${cachedBgColorDim}, 0 0 ${lineWidth * 4}px ${cachedBgColor}`;
      sparkle.style.animation = `firework-line ${duration}s ease-out forwards`;
      
      fragment.appendChild(sparkle);
      
      // Remove after animation
      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.remove();
        }
      }, duration * 1000);
    }
    
    // Batch DOM operation
    sparkleContainer.appendChild(fragment);
  }

  // Inject firework animation keyframes (optimized for lines)
  if (!document.querySelector('#firework-keyframes')) {
    const style = document.createElement('style');
    style.id = 'firework-keyframes';
    style.textContent = `
      @keyframes firework-line {
        0% {
          opacity: 1;
          transform: translate(var(--start-x), var(--start-y)) rotate(var(--angle)) scaleX(1);
        }
        100% {
          opacity: 0;
          transform: translate(calc(var(--start-x) + var(--end-x)), calc(var(--start-y) + var(--end-y))) rotate(var(--angle)) scaleX(0.3);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Update cursor position using CSS variables (most performant method)
  document.addEventListener('mousemove', (e) => {
    const x = e.clientX - 32;
    const y = e.clientY - 32;
    cursor.style.setProperty('--mouse-x', `${x}px`);
    cursor.style.setProperty('--mouse-y', `${y}px`);
    // Show cursor on first move
    cursor.style.opacity = '1';
    
    // Generate firework sparkles when cursor2 is active (optimized with RAF)
    if (isCursor2) {
      const now = performance.now();
      // Generate sparkles every 200ms (reduced frequency for performance)
      if (now - lastSparkleTime > 200) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          createFireworkSparkle(e.clientX, e.clientY);
          lastSparkleTime = now;
        });
      }
    }
  }, { passive: true });

  // Hide cursor when mouse leaves window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    isCursor2 = false;
    if (rafId) cancelAnimationFrame(rafId);
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  // Watch for cursor2 class changes
  const observer = new MutationObserver(() => {
    const wasCursor2 = isCursor2;
    isCursor2 = cursor.classList.contains('cursor2');
    
    if (isCursor2 && !wasCursor2) {
      // Cursor2 just activated - create initial burst
      const rect = cursor.getBoundingClientRect();
      createFireworkSparkle(rect.left + 32, rect.top + 32);
    } else if (!isCursor2 && wasCursor2) {
      // Cursor2 deactivated
      if (rafId) cancelAnimationFrame(rafId);
    }
  });

  observer.observe(cursor, { attributes: true, attributeFilter: ['class'] });

  console.log('Custom animated cursor initialized');
}

