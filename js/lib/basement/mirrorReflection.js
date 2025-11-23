/**
 * Mirror Reflection Effect
 * Shows self4.png in the mirror with static glitch overlay
 */

export function initMirrorReflection(selfInstance, selfShader) {
  const mirrorContainer = document.querySelector('.mirror-container');
  const mirrorReflection = document.getElementById('mirrorReflection');
  
  if (!mirrorContainer || !mirrorReflection) {
    console.error('Mirror elements not found');
    return;
  }
  
  // Use purpleStatic from window (set in basement.html)
  const purpleStatic = window.purpleStatic;
  
  // Create a separate static overlay canvas element
  // Place it inside mirrorReflection to match the reflection bounds
  const staticOverlay = document.createElement('div');
  staticOverlay.className = 'mirror-static-overlay';
  mirrorReflection.appendChild(staticOverlay);
  
  // Create hint text for mirror hover
  const mirrorHintText = document.createElement('div');
  mirrorHintText.className = 'mirror-hint-text';
  mirrorHintText.textContent = 'talk... to me?';
  document.body.appendChild(mirrorHintText);
  
  let hintAnimationFrame = null;
  
  // Update hint text position to follow mirror
  const updateMirrorHintPosition = () => {
    const rect = mirrorContainer.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      hintAnimationFrame = requestAnimationFrame(updateMirrorHintPosition);
      return;
    }
    const centerX = rect.left + rect.width / 2;
    const topY = rect.top - 20;
    mirrorHintText.style.left = `${centerX}px`;
    mirrorHintText.style.top = `${topY}px`;
    hintAnimationFrame = requestAnimationFrame(updateMirrorHintPosition);
  };
  
  // Show/hide hint text on hover
  mirrorContainer.addEventListener('mouseenter', () => {
    mirrorHintText.style.opacity = '1';
    if (hintAnimationFrame === null) {
      updateMirrorHintPosition();
    }
  });
  
  mirrorContainer.addEventListener('mouseleave', () => {
    mirrorHintText.style.opacity = '0';
    if (hintAnimationFrame !== null) {
      cancelAnimationFrame(hintAnimationFrame);
      hintAnimationFrame = null;
    }
  });
  
  // Create QQ window
  const qqWindow = document.createElement('div');
  qqWindow.className = 'qqWindow';
  qqWindow.innerHTML = `
    <div class="qq-window-titlebar">
      <div class="qq-titlebar-left">
        <div class="qq-profile-photo"></div>
        <span class="qq-window-title">nymx.22</span>
      </div>
      <div class="qq-window-controls">
        <button class="qq-window-close">×</button>
      </div>
    </div>
    <div class="qq-window-chat-area">
      <div class="qq-chat-messages-container">
        <div class="qq-chat-messages">
          <!-- Messages will appear here -->
        </div>
      </div>
      <div class="qq-profile-section">
        <div class="qq-profile-avatar">
          <div class="qq-profile-photo-large"></div>
          <div class="qq-profile-name">Angel</div>
        </div>
      </div>
    </div>
    <div class="qq-window-input-area">
      <div class="qq-input-field-container">
        <textarea class="qq-input-field" placeholder="Type a message..."></textarea>
      </div>
    </div>
    <div class="qq-window-bottom-bar">
      <button class="qq-send-btn">Send</button>
      <button class="qq-close-btn">Close</button>
    </div>
  `;
  document.body.appendChild(qqWindow);
  
  // Navigate to about page when clicking on mirror (temporarily disabled)
  // mirrorContainer.addEventListener('click', () => {
  //   window.location.href = '../pages/about.html';
  // });
  
  // Close window handlers
  const closeWindow = () => {
    qqWindow.classList.remove('qq-window-visible');
  };
  
  qqWindow.querySelector('.qq-window-close').addEventListener('click', closeWindow);
  qqWindow.querySelector('.qq-close-btn').addEventListener('click', closeWindow);
  
  // Send button functionality
  const sendBtn = qqWindow.querySelector('.qq-send-btn');
  const inputField = qqWindow.querySelector('.qq-input-field');
  const chatMessages = qqWindow.querySelector('.qq-chat-messages');
  
  const sendMessage = () => {
    const message = inputField.value.trim();
    if (message) {
      // Create message element
      const messageDiv = document.createElement('div');
      messageDiv.className = 'qq-message qq-message-sent';
      messageDiv.textContent = message;
      chatMessages.appendChild(messageDiv);
      
      // Clear input
      inputField.value = '';
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  };
  
  sendBtn.addEventListener('click', sendMessage);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Make window draggable
  const titleBar = qqWindow.querySelector('.qq-window-titlebar');
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;
  
  titleBar.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);
  
  function dragStart(e) {
    if (e.target.classList.contains('qq-window-close')) {
      return; // Don't drag if clicking on control buttons
    }
    
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    
    if (e.target === titleBar || titleBar.contains(e.target)) {
      isDragging = true;
    }
  }
  
  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      xOffset = currentX;
      yOffset = currentY;
      
      setTranslate(currentX, currentY, qqWindow);
    }
  }
  
  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
  }
  
  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
  }
  
  // Function to check if self is within mirror's horizontal range
  const isSelfInMirrorRange = () => {
    const mirrorRect = mirrorContainer.getBoundingClientRect();
    const selfContainer = document.getElementById('self-shader-container');
    
    if (!selfContainer) return false;
    
    const selfContainerRect = selfContainer.getBoundingClientRect();
    // Self's x position is relative to center of canvas (0,0 in WEBGL)
    // Canvas center is at screen center, so self's screen position = screen center + self.x
    const screenCenterX = window.innerWidth / 2;
    const selfScreenX = screenCenterX + selfInstance.x;
    
    // Get self's width (scaled)
    const selfImage = selfInstance.getCurrentImage();
    if (!selfImage || selfImage.width === 0) return false;
    
    const selfWidth = selfImage.width * selfInstance.scale;
    const selfLeft = selfScreenX - selfWidth / 2;
    const selfRight = selfScreenX + selfWidth / 2;
    
    // Check if self overlaps with mirror's horizontal range
    const mirrorLeft = mirrorRect.left;
    const mirrorRight = mirrorRect.right;
    
    return (selfRight >= mirrorLeft && selfLeft <= mirrorRight);
  };
  
  // Setup p5 sketch for reflection (image only)
  const sketch = function(p) {
    let self4Image = null;
    
    p.preload = function() {
      // Load self4.png for mirror reflection
      self4Image = p.loadImage('/assets/images/self/self4.PNG');
    };
    
    p.setup = function() {
      const rect = mirrorContainer.getBoundingClientRect();
      const canvasWidth = rect.width > 0 ? rect.width : window.innerWidth * 0.1;
      const canvasHeight = rect.height > 0 ? rect.height : window.innerHeight * 0.3;
      
      // Main canvas for the image
      const canvas = p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
      canvas.parent(mirrorReflection);
      p.textureMode(p.NORMAL);
    };
    
    p.draw = function() {
      p.clear();
      
      if (!self4Image || self4Image.width === 0) {
        return;
      }
      
      // Check if self is in mirror range
      const inRange = isSelfInMirrorRange();
      
      // Update active class for CSS transition
      if (inRange) {
        mirrorReflection.classList.add('active');
      } else {
        mirrorReflection.classList.remove('active');
      }
      
      // Always draw the image (CSS opacity handles the fade)
      // This allows the CSS transition to work properly
      // Calculate scale
      const scale = selfInstance.scale;
      const scaledWidth = self4Image.width * scale;
      const scaledHeight = self4Image.height * scale;
      
      // Position image so bottom 1/3 is visible in mirror
      // In WEBGL, Y=0 is center, positive Y is up
      // We want the bottom 1/3 of the image to be in the mirror
      // So we translate down by (scaledHeight/2 - scaledHeight/6) = scaledHeight/3
      // This positions the image so its bottom third is centered at Y=0
      const translateY = scaledHeight / 3;
      
      // Draw the image
      p.push();
      p.translate(0, translateY, 0);
      p.noStroke();
      p.texture(self4Image);
      p.rectMode(p.CENTER);
      p.rect(0, 0, scaledWidth, scaledHeight);
      p.pop();
    };
    
    p.windowResized = function() {
      const rect = mirrorContainer.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        p.resizeCanvas(rect.width, rect.height);
      }
    };
  };
  
  // Start the reflection sketch
  new p5(sketch);
  
  // Setup separate static overlay sketch with purple static
  // Wait a bit to ensure mirror container has dimensions
  setTimeout(() => {
    if (purpleStatic) {
      const staticSketch = function(p) {
        p.setup = function() {
          const rect = mirrorContainer.getBoundingClientRect();
          // Match the exact dimensions of the mirror reflection
          let canvasWidth = rect.width;
          let canvasHeight = rect.height;
          
          // Fallback if dimensions are still 0
          if (canvasWidth === 0 || canvasHeight === 0) {
            canvasWidth = window.innerWidth * 0.1;
            canvasHeight = window.innerHeight * 0.3;
          }
          
          const canvas = p.createCanvas(canvasWidth, canvasHeight);
          canvas.parent(staticOverlay);
          p.pixelDensity(1);
          console.log('Static overlay canvas created:', canvasWidth, canvasHeight, 'Container rect:', rect);
        };
        
        p.draw = function() {
          if (purpleStatic) {
            purpleStatic(p);
          }
        };
        
        p.windowResized = function() {
          const rect = mirrorContainer.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            p.resizeCanvas(rect.width, rect.height);
          }
        };
      };
      
      new p5(staticSketch);
      console.log('Static overlay sketch initialized');
    } else {
      console.error('purpleStatic not available');
    }
  }, 100);
  
  console.log('Mirror reflection initialized');
}
