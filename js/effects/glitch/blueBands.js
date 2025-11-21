/**
 * Blue Horizontal Bands Glitch Effect
 * Mathematical formula: f'(x,y) = f(x + s(y), y)
 * Creates ghostly scanline tears with horizontal displacement
 */

export function blueBands(p) {
  // If canvas is empty/white, generate base noise first
  p.loadPixels();
  const pixels = p.pixels;
  const len = pixels.length;
  
  // Quick empty check (sample first 100 pixels)
  let isEmpty = true;
  for (let i = 0; i < Math.min(400, len); i += 4) {
    if (pixels[i] !== 0 && pixels[i] !== 255) {
      isEmpty = false;
      break;
    }
  }
  
  if (isEmpty) {
    // Generate base noise pattern
    const noiseTime = p.frameCount * 0.01;
    for (let i = 0; i < len; i += 4) {
      const gray = p.noise(i * 0.001, noiseTime) * 255;
      pixels[i] = gray * 0.5;
      pixels[i + 1] = gray * 0.6;
      pixels[i + 2] = gray * 1.2;
      pixels[i + 3] = 255;
    }
    p.updatePixels();
    p.loadPixels();
  }
  
  // Use Uint8ClampedArray for faster copy
  const tempPixels = new Uint8ClampedArray(pixels);
  const width = p.width;
  const height = p.height;
  const frameOffset = p.frameCount * 0.05;
  
  // Pre-calculate constants
  const width4 = width * 4;
  
  for (let y = 0; y < height; y++) {
    // Calculate shift amount for this row (sine wave creates smooth bands)
    const shift = Math.floor(Math.sin(y * 0.1 + frameOffset) * 20);
    const rowOffset = y * width4;
    
    for (let x = 0; x < width; x++) {
      // Source x position (with wrapping)
      const sourceX = (x + shift + width) % width;
      
      // Calculate pixel array indices
      const sourceIndex = sourceX * 4 + rowOffset;
      const targetIndex = x * 4 + rowOffset;
      
      // Copy RGB values with blue emphasis (use bitwise for clamping)
      pixels[targetIndex] = (tempPixels[sourceIndex] * 0.7) | 0;
      pixels[targetIndex + 1] = (tempPixels[sourceIndex + 1] * 0.8) | 0;
      pixels[targetIndex + 2] = tempPixels[sourceIndex + 2];
      pixels[targetIndex + 3] = 255;
    }
  }
  
  p.updatePixels();
}

