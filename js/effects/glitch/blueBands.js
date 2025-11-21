/**
 * Blue Horizontal Bands Glitch Effect
 * Mathematical formula: f'(x,y) = f(x + s(y), y)
 * Creates ghostly scanline tears with horizontal displacement
 */

export function blueBands(p) {
  // If canvas is empty/white, generate base noise first
  p.loadPixels();
  const isEmpty = p.pixels.every((val, i) => i % 4 === 3 || val === 0 || val === 255);
  
  if (isEmpty) {
    // Generate base noise pattern
    for (let i = 0; i < p.pixels.length; i += 4) {
      const gray = p.noise(i * 0.001, p.frameCount * 0.01) * 255;
      p.pixels[i] = gray * 0.5;
      p.pixels[i + 1] = gray * 0.6;
      p.pixels[i + 2] = gray * 1.2;
      p.pixels[i + 3] = 255;
    }
    p.updatePixels();
    p.loadPixels();
  }
  
  // Create a temporary copy of current frame
  const tempPixels = [...p.pixels];
  
  for (let y = 0; y < p.height; y++) {
    // Calculate shift amount for this row (sine wave creates smooth bands)
    const shift = Math.floor(Math.sin(y * 0.1 + p.frameCount * 0.05) * 20);
    
    for (let x = 0; x < p.width; x++) {
      // Source x position (with wrapping)
      const sourceX = (x + shift + p.width) % p.width;
      
      // Calculate pixel array indices
      const sourceIndex = (sourceX + y * p.width) * 4;
      const targetIndex = (x + y * p.width) * 4;
      
      // Copy RGB values with blue emphasis
      p.pixels[targetIndex] = tempPixels[sourceIndex] * 0.7;     // R reduced
      p.pixels[targetIndex + 1] = tempPixels[sourceIndex + 1] * 0.8; // G reduced
      p.pixels[targetIndex + 2] = tempPixels[sourceIndex + 2];   // B full
      p.pixels[targetIndex + 3] = 255; // Alpha
    }
  }
  
  p.updatePixels();
}

