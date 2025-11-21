/**
 * Humanoid Hover Interaction
 * Changes cursor to cursor2.png and opens humanoid like a book
 * Reveals clickable white space underneath that leads to basement page
 */

export function initHumanoidHover() {
  const container = document.querySelector('.humanoid-container');
  const humanoid = document.querySelector('.humanoid');
  const customCursor = document.querySelector('.custom-cursor');
  
  if (!container || !humanoid) {
    console.error('Humanoid elements not found');
    return;
  }

  // Create glow container that will hold everything
  const glowContainer = document.createElement('div');
  glowContainer.className = 'humanoid-glow-container';
  
  // Create the book halves (left and right)
  const leftHalf = document.createElement('div');
  leftHalf.className = 'humanoid-left';
  
  const rightHalf = document.createElement('div');
  rightHalf.className = 'humanoid-right';
  
  // Clone the humanoid image for each half
  const leftImg = humanoid.cloneNode(true);
  const rightImg = humanoid.cloneNode(true);
  
  // Remove glow class from clones (glow will be on container)
  leftImg.classList.remove('humanoid');
  rightImg.classList.remove('humanoid');
  
  leftHalf.appendChild(leftImg);
  rightHalf.appendChild(rightImg);
  
  // Add halves to glow container
  glowContainer.appendChild(leftHalf);
  glowContainer.appendChild(rightHalf);
  
  // Create white space underneath (clickable area)
  const whiteSpace = document.createElement('a');
  whiteSpace.href = 'pages/basement.html';
  whiteSpace.className = 'white-space-link';
  
  // Create hint text that follows cursor with wavy effect
  const hintText = document.createElement('div');
  hintText.className = 'cursor-hint';
  
  // Split text into individual characters for wave effect
  const text = 'want to see my basement?';
  
  const wavyText = text.split('').map((char, i) => 
    `<span style="animation-delay: ${i * 0.05}s;">${char === ' ' ? '&nbsp;' : char}</span>`
  ).join('');
  
  hintText.innerHTML = `
    <div style="font-size: 2rem;">${wavyText}</div>
  `;
  
  document.body.appendChild(hintText);
  
  // Create sparkle container for hint text
  const sparkleContainer = document.createElement('div');
  sparkleContainer.className = 'hint-sparkles';
  sparkleContainer.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 100001;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  `;
  document.body.appendChild(sparkleContainer);
  
  // Generate sparkles around hint text
  let sparkleInterval;
  
  function generateHintSparkle() {
    if (!isHovering) return;
    
    const rect = hintText.getBoundingClientRect();
    if (rect.width === 0) return; // Text not visible yet
    
    const sparkle = document.createElement('div');
    sparkle.className = 'hint-sparkle-cross';
    
    // Random position around text bounds
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;
    const size = 8 + Math.random() * 6; // Larger for cross shape
    const lifetime = 0.5 + Math.random() * 0.8;
    const rotation = Math.random() * 360; // Random rotation
    
    sparkle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      animation: sparkle-fade ${lifetime}s ease-out forwards;
      transform: rotate(${rotation}deg);
    `;
    
    // Create cross shape using pseudo-elements via inline style
    sparkle.innerHTML = `
      <div style="
        position: absolute;
        width: 100%;
        height: 20%;
        top: 40%;
        left: 0;
        background: rgba(173, 216, 230, ${0.8 + Math.random() * 0.2});
        box-shadow: 0 0 ${size * 2}px rgba(173, 216, 230, 0.8);
      "></div>
      <div style="
        position: absolute;
        width: 20%;
        height: 100%;
        top: 0;
        left: 40%;
        background: rgba(173, 216, 230, ${0.8 + Math.random() * 0.2});
        box-shadow: 0 0 ${size * 2}px rgba(173, 216, 230, 0.8);
      "></div>
    `;
    
    sparkleContainer.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), lifetime * 1000);
  }
  
  // Inject sparkle animation
  if (!document.querySelector('#sparkle-keyframes')) {
    const style = document.createElement('style');
    style.id = 'sparkle-keyframes';
    style.textContent = `
      @keyframes sparkle-fade {
        0% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        100% {
          opacity: 0;
          transform: scale(0.3) translateY(-10px);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Hide original humanoid
  humanoid.style.opacity = '0';
  
  // Add elements to container
  container.appendChild(whiteSpace);
  container.appendChild(glowContainer);
  
  // Hover state
  let isHovering = false;
  
  // Update hint text position on mouse move
  document.addEventListener('mousemove', (e) => {
    if (isHovering) {
      // Position hint text to the right and below cursor
      hintText.style.left = (e.clientX + 40) + 'px';
      hintText.style.top = (e.clientY + 20) + 'px';
    }
  });
  
  container.addEventListener('mouseenter', () => {
    isHovering = true;
    
    // Change cursor to cursor2.png and rotate 90 degrees
    if (customCursor) {
      customCursor.style.backgroundImage = "url('assets/images/cursor2.png')";
      customCursor.style.transition = 'transform 0.4s ease-out';
      // Add rotation to the transform (keeping the translate3d)
      const currentTransform = customCursor.style.transform;
      customCursor.style.transform = currentTransform.replace('translate3d', 'translate3d') + ' rotate(90deg)';
    }
    
    // Show hint text
    hintText.style.opacity = '1';
    
    // Start generating sparkles (denser - every 30ms)
    sparkleInterval = setInterval(generateHintSparkle, 30);
    
    // Open book animation - flip outward horizontally
    leftHalf.style.transform = 'perspective(2000px) rotateY(-90deg)';
    rightHalf.style.transform = 'perspective(2000px) rotateY(90deg)';
    
    // Reveal white space with glow
    whiteSpace.style.opacity = '1';
    whiteSpace.classList.add('active');
  });
  
  container.addEventListener('mouseleave', () => {
    isHovering = false;
    
    // Stop generating sparkles
    clearInterval(sparkleInterval);
    
    // Restore original cursor (no rotation)
    if (customCursor) {
      customCursor.style.backgroundImage = "url('assets/gif/cursor.gif')";
      // Remove rotation from transform
      const currentTransform = customCursor.style.transform;
      customCursor.style.transform = currentTransform.replace(' rotate(90deg)', '');
    }
    
    // Hide hint text
    hintText.style.opacity = '0';
    
    // Close book
    leftHalf.style.transform = 'perspective(2000px) rotateY(0deg)';
    rightHalf.style.transform = 'perspective(2000px) rotateY(0deg)';
    
    // Hide white space and remove glow
    whiteSpace.style.opacity = '0';
    whiteSpace.classList.remove('active');
  });
  
  console.log('Humanoid hover interaction initialized');
}

