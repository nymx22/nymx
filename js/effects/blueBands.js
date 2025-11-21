/**
 * Blue Horizontal Bands Glitch Effect
 * Mathematical formula: f'(x,y) = f(x + s(y), y)
 * Creates ghostly scanline tears with horizontal displacement
 */

export function blueBands(p) {
  p.loadPixels();
  
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

