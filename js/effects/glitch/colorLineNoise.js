/**
 * Color Line Noise Glitch Effect
 * Mathematical formula: f + α(y)η
 * Line-wise corruption with colored horizontal streaks
 */

export function colorLineNoise(p) {
  p.loadPixels();
  
  const pixels = p.pixels;
  const width = p.width;
  const height = p.height;
  const blend = 0.7;
  const invBlend = 0.3; // 1 - blend
  
  for (let y = 0; y < height; y++) {
    // Some rows get heavy corruption, others none
    if (p.random() < 0.15) { // 15% of rows affected
      const noiseR = p.random(100, 255);
      const noiseG = p.random(0, 100);
      const noiseB = p.random(100, 255);
      const alpha = (p.random(150, 220)) | 0;
      
      // Pre-calculate blended noise values
      const blendedR = noiseR * blend;
      const blendedG = noiseG * blend;
      const blendedB = noiseB * blend;
      
      // Calculate row start index
      let index = y * width * 4;
      
      for (let x = 0; x < width; x++) {
        // Blend with existing content
        pixels[index] = (pixels[index] * invBlend + blendedR) | 0;
        pixels[index + 1] = (pixels[index + 1] * invBlend + blendedG) | 0;
        pixels[index + 2] = (pixels[index + 2] * invBlend + blendedB) | 0;
        pixels[index + 3] = alpha;
        index += 4;
      }
    }
  }
  
  p.updatePixels();
}

