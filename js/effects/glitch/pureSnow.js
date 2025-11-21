/**
 * Pure Snow Glitch Effect
 * Mathematical formula: f = η(x,y,t)
 * Generates time-dependent white noise (TV static)
 * Optimized with lower-resolution noise + grain overlay
 */

export function pureSnow(p) {
  p.loadPixels();
  
  const pixels = p.pixels;
  const width = p.width;
  const height = p.height;
  const noiseTime = p.frameCount * 0.1;
  
  // Generate noise at lower resolution for performance
  const noiseStep = 4; // Calculate noise every 4 pixels
  const noiseScale = 0.02;
  
  let index = 0;
  
  for (let y = 0; y < height; y++) {
    const noiseY = y * noiseScale;
    
    // Check if this is a noise calculation row
    const isNoiseRow = (y % noiseStep) === 0;
    let lastNoise = 0;
    
    for (let x = 0; x < width; x++) {
      let gray;
      
      if (isNoiseRow && (x % noiseStep) === 0) {
        // Calculate noise at grid points
        gray = (p.noise(x * noiseScale, noiseY, noiseTime) * 255) | 0;
        lastNoise = gray;
      } else {
        // Use last calculated noise + random variation for grain
        // This creates organic variation without expensive noise calls
        gray = (lastNoise + p.random(-30, 30)) | 0;
        if (gray < 0) gray = 0;
        if (gray > 255) gray = 255;
      }
      
      pixels[index++] = gray;  // R
      pixels[index++] = gray;  // G
      pixels[index++] = gray;  // B
      pixels[index++] = 255;   // Alpha
    }
  }
  
  p.updatePixels();
}

