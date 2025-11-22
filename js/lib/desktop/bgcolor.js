/**
 * Background Color Randomizer
 * Picks a random color from the humanoid GIF and sets it as the page background
 */

export function randomizeBgColor() {
  const img = document.querySelector('.humanoid');
  
  if (!img) {
    console.error('Humanoid image not found');
    return;
  }

  // Wait for image to load
  if (!img.complete) {
    img.addEventListener('load', () => extractAndSetColor(img));
  } else {
    extractAndSetColor(img);
  }
}

function extractAndSetColor(img) {
  // Create a canvas to read pixel data from the GIF
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to match image
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  
  // Draw the image onto the canvas
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Get random pixel coordinates
  const randomX = Math.floor(Math.random() * canvas.width);
  const randomY = Math.floor(Math.random() * canvas.height);
  
  // Extract pixel color data
  const pixelData = ctx.getImageData(randomX, randomY, 1, 1).data;
  const r = pixelData[0];
  const g = pixelData[1];
  const b = pixelData[2];
  const a = pixelData[3];
  
  // Skip if pixel is transparent or too close to white
  if (a < 50 || (r > 240 && g > 240 && b > 240)) {
    // Try again with a different pixel
    randomizeBgColor();
    return;
  }
  
  // Convert to hex color
  const hexColor = rgbToHex(r, g, b);
  
  // Set as background color
  document.body.style.backgroundColor = hexColor;
  
  // Convert hex to RGB and store as CSS variables for cursor/sparkles
  const rgb = hexToRgb(hexColor);
  if (rgb) {
    document.documentElement.style.setProperty('--bg-color', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`);
    document.documentElement.style.setProperty('--bg-color-dim', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
    document.documentElement.style.setProperty('--bg-color-faint', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`);
  }
  
  console.log(`Background color set to: ${hexColor} from pixel (${randomX}, ${randomY})`);
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

