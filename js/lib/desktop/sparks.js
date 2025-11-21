/**
 * Welding Sparks Effect
 * Generates continuous random sparks around the humanoid container
 * as if welding is happening
 */

export function initWeldingSparks() {
  const container = document.querySelector('.humanoid-container');
  
  if (!container) {
    console.error('Humanoid container not found');
    return;
  }

  // Create sparks container
  const sparksContainer = document.createElement('div');
  sparksContainer.className = 'sparks-container';
  sparksContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
    z-index: 10;
  `;
  
  container.appendChild(sparksContainer);

  // Generate sparks continuously
  setInterval(() => {
    generateSpark(sparksContainer, container);
  }, 100); // New spark every 100ms

  console.log('Welding sparks effect initialized');
}

function generateSpark(sparksContainer, humanoidContainer) {
  const spark = document.createElement('div');
  spark.className = 'spark';
  
  // Get container dimensions
  const rect = humanoidContainer.getBoundingClientRect();
  const containerWidth = rect.width;
  const containerHeight = rect.height;
  
  // Random position around the edges of the container
  const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  let startX, startY;
  
  switch(side) {
    case 0: // top
      startX = Math.random() * containerWidth;
      startY = 0;
      break;
    case 1: // right
      startX = containerWidth;
      startY = Math.random() * containerHeight;
      break;
    case 2: // bottom
      startX = Math.random() * containerWidth;
      startY = containerHeight;
      break;
    case 3: // left
      startX = 0;
      startY = Math.random() * containerHeight;
      break;
  }
  
  // Random velocity and direction
  const angle = Math.random() * Math.PI * 2;
  const speed = 50 + Math.random() * 100; // pixels per second
  const velocityX = Math.cos(angle) * speed;
  const velocityY = Math.sin(angle) * speed + 50; // Add gravity effect
  
  // Random spark properties
  const size = 2 + Math.random() * 4;
  const lifetime = 0.5 + Math.random() * 1; // 0.5 to 1.5 seconds
  const brightness = 0.6 + Math.random() * 0.4;
  
  // Spark colors (orange/yellow/white for welding effect)
  const colors = [
    `rgba(255, 200, 100, ${brightness})`,
    `rgba(255, 150, 50, ${brightness})`,
    `rgba(255, 255, 200, ${brightness})`,
    `rgba(255, 100, 0, ${brightness})`
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  spark.style.cssText = `
    position: absolute;
    left: ${startX}px;
    top: ${startY}px;
    width: ${size}px;
    height: ${size}px;
    background: ${color};
    border-radius: 50%;
    box-shadow: 0 0 ${size * 2}px ${color};
    pointer-events: none;
    animation: spark-fade ${lifetime}s linear forwards;
  `;
  
  sparksContainer.appendChild(spark);
  
  // Animate spark movement
  let currentX = startX;
  let currentY = startY;
  let elapsed = 0;
  const frameRate = 60;
  const frameTime = 1000 / frameRate;
  
  const animate = setInterval(() => {
    elapsed += frameTime / 1000;
    
    if (elapsed >= lifetime) {
      clearInterval(animate);
      spark.remove();
      return;
    }
    
    // Update position with physics
    currentX += (velocityX / frameRate);
    currentY += (velocityY / frameRate) + (elapsed * 100); // Gravity acceleration
    
    spark.style.left = currentX + 'px';
    spark.style.top = currentY + 'px';
  }, frameTime);
}

// Inject CSS animation for spark fade
if (!document.querySelector('#spark-keyframes')) {
  const style = document.createElement('style');
  style.id = 'spark-keyframes';
  style.textContent = `
    @keyframes spark-fade {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.3);
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Stop generating sparks
 */
export function stopWeldingSparks() {
  const sparksContainer = document.querySelector('.sparks-container');
  if (sparksContainer) {
    sparksContainer.remove();
  }
}

