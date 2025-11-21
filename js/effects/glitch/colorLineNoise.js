/**
 * Color Line Noise Glitch Effect
 * Mathematical formula: f + α(y)η
 * Line-wise corruption with colored horizontal streaks
 */

export function colorLineNoise(p) {
  p.loadPixels();
  
  for (let y = 0; y < p.height; y++) {
    // Some rows get heavy corruption, others none
    if (p.random() < 0.15) { // 15% of rows affected
      const noiseR = p.random(100, 255);
      const noiseG = p.random(0, 100);
      const noiseB = p.random(100, 255);
      const alpha = p.random(150, 220);
      
      for (let x = 0; x < p.width; x++) {
        const index = (x + y * p.width) * 4;
        
        // Blend with existing content
        const blend = 0.7;
        p.pixels[index] = p.pixels[index] * (1 - blend) + noiseR * blend;
        p.pixels[index + 1] = p.pixels[index + 1] * (1 - blend) + noiseG * blend;
        p.pixels[index + 2] = p.pixels[index + 2] * (1 - blend) + noiseB * blend;
        p.pixels[index + 3] = alpha;
      }
    }
  }
  
  p.updatePixels();
}

