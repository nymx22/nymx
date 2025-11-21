/**
 * Pure Snow Glitch Effect
 * Mathematical formula: f = η(x,y,t)
 * Generates time-dependent white noise (TV static)
 */

export function pureSnow(p) {
  p.loadPixels();
  
  const noiseScale = 0.02;
  
  for (let y = 0; y < p.height; y++) {
    for (let x = 0; x < p.width; x++) {
      const index = (x + y * p.width) * 4;
      
      // Perlin noise creates more organic grain than pure random
      const gray = p.noise(x * noiseScale, y * noiseScale, p.frameCount * 0.1) * 255;
      
      p.pixels[index] = gray;     // R
      p.pixels[index + 1] = gray; // G
      p.pixels[index + 2] = gray; // B
      p.pixels[index + 3] = 255;  // Alpha
    }
  }
  
  p.updatePixels();
}

