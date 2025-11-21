/**
 * Custom Animated Cursor
 * Creates a custom cursor using the cursor.gif that follows the mouse
 * Optimized for performance using transform and requestAnimationFrame
 */

export function initCustomCursor() {
  // Hide default cursor
  document.body.style.cursor = 'none';

  // Create custom cursor element
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 64px;
    height: 64px;
    pointer-events: none;
    z-index: 99999;
    will-change: transform;
    background-image: url('assets/gif/cursor.gif');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  `;

  document.body.appendChild(cursor);

  // Update cursor position directly on mousemove
  document.addEventListener('mousemove', (e) => {
    // Use transform for better performance (GPU accelerated)
    cursor.style.transform = `translate3d(${e.clientX - 32}px, ${e.clientY - 32}px, 0)`;
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

