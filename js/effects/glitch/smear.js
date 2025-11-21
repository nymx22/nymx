/**
 * Smear (bottom-left) Glitch Effect
 * Mathematical formula: f(x, y - d(x))
 * Vertical timebase error creating motion blur displacement
 */

export function smear(p) {
  // If canvas is empty/white, generate base noise first
  p.loadPixels();
  const isEmpty = p.pixels.every((val, i) => i % 4 === 3 || val === 0 || val === 255);
  
  if (isEmpty) {
    // Generate base gradient pattern
    for (let y = 0; y < p.height; y++) {
      for (let x = 0; x < p.width; x++) {
        const index = (x + y * p.width) * 4;
        const noise = p.noise(x * 0.01, y * 0.01, p.frameCount * 0.01) * 255;
        p.pixels[index] = noise * 0.8;
        p.pixels[index + 1] = noise * 0.6;
        p.pixels[index + 2] = noise;
        p.pixels[index + 3] = 255;
      }
    }
    p.updatePixels();
    p.loadPixels();
  }
  
  const tempPixels = [...p.pixels];
  
  for (let x = 0; x < p.width; x++) {
    // Displacement increases toward left (x=0)
    let displacement = Math.floor(p.map(x, 0, p.width, 25, 0));
    
    // Add wave motion for organic feel
    displacement += Math.floor(Math.sin(x * 0.05 + p.frameCount * 0.03) * 5);
    
    for (let y = 0; y < p.height; y++) {
      // Source y positions for RGB channels (chromatic aberration)
      const sourceYR = p.constrain(y - displacement, 0, p.height - 1);
      const sourceYG = p.constrain(y - displacement + 2, 0, p.height - 1);
      const sourceYB = p.constrain(y - displacement + 4, 0, p.height - 1);
      
      const targetIndex = (x + y * p.width) * 4;
      
      // Separate RGB channels with different displacements
      p.pixels[targetIndex] = tempPixels[(x + sourceYR * p.width) * 4];
      p.pixels[targetIndex + 1] = tempPixels[(x + sourceYG * p.width) * 4 + 1];
      p.pixels[targetIndex + 2] = tempPixels[(x + sourceYB * p.width) * 4 + 2];
      p.pixels[targetIndex + 3] = 255;
    }
  }
  
  p.updatePixels();
}

