/**
 * Chunky Purple Static Glitch Effect
 * Mathematical formula: G_σ * f, R(θ)
 * Filtered noise with chroma phase shift (VHS degradation)
 * Optimized with chunky noise generation instead of blur
 */

export function purpleStatic(p) {
  p.loadPixels();
  
  const pixels = p.pixels;
  const width = p.width;
  const height = p.height;
  
  // Generate chunky noise by using larger blocks instead of blur
  // This is much faster than generating full-res noise + blur
  const chunkSize = 6; // Size of each noise block (simulates blur)
  
  for (let y = 0; y < height; y += chunkSize) {
    for (let x = 0; x < width; x += chunkSize) {
      // Generate one random value per chunk
      const gray = (p.random(255)) | 0;
      
      // Apply purple tint directly during generation
      const r = (gray * 0.7) | 0;  // Purple = less red
      const g = (gray * 0.4) | 0;  // Purple = less green
      const b = (gray * 0.8) | 0;  // Purple = more blue
      
      // Fill the chunk with this color
      const maxX = Math.min(x + chunkSize, width);
      const maxY = Math.min(y + chunkSize, height);
      
      for (let cy = y; cy < maxY; cy++) {
        let index = (x + cy * width) * 4;
        for (let cx = x; cx < maxX; cx++) {
          pixels[index++] = r;
          pixels[index++] = g;
          pixels[index++] = b;
          pixels[index++] = 255;
        }
      }
    }
  }
  
  p.updatePixels();
}

