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

  // Update cursor position using CSS variables (most performant method)
  document.addEventListener('mousemove', (e) => {
    cursor.style.setProperty('--mouse-x', `${e.clientX - 32}px`);
    cursor.style.setProperty('--mouse-y', `${e.clientY - 32}px`);
    // Show cursor on first move
    cursor.style.opacity = '1';
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

