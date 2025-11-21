/**
 * Custom Animated Cursor
 * Creates a custom cursor using the cursor.gif that follows the mouse
 * Highly optimized using CSS variables for maximum performance
 */

export function initCustomCursor() {
  // Hide default cursor
  document.body.style.cursor = 'none';

  // Create custom cursor element
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  
  // Set initial CSS variables
  cursor.style.setProperty('--mouse-x', '0px');
  cursor.style.setProperty('--mouse-y', '0px');
  
  cursor.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 64px;
    height: 64px;
    pointer-events: none;
    z-index: 99999;
    transform: translate3d(var(--mouse-x), var(--mouse-y), 0);
    will-change: transform;
    background: url('assets/gif/cursor.gif') no-repeat center / contain;
    filter: drop-shadow(0 0 8px rgba(173, 216, 230, 0.6)) drop-shadow(0 0 16px rgba(173, 216, 230, 0.3));
  `;

  document.body.appendChild(cursor);

  // Update cursor position using CSS variables (most performant method)
  document.addEventListener('mousemove', (e) => {
    cursor.style.setProperty('--mouse-x', `${e.clientX - 32}px`);
    cursor.style.setProperty('--mouse-y', `${e.clientY - 32}px`);
  }, { passive: true });

  // Hide cursor when mouse leaves window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  console.log('Custom animated cursor initialized');
}

