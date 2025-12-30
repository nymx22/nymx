/**
 * Smear (bottom-left) Glitch Effect
 * Mathematical formula: f(x, y - d(x))
 * Vertical timebase error creating motion blur displacement
 */

export function smear(p, noiseSize = 1) {
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
    // Generate base gradient pattern
    const width = p.width;
    const height = p.height;
    const noiseTime = p.frameCount * 0.01;
    const noiseSizeInt = Math.floor(noiseSize);
    
    // Use block-based pattern generation if noiseSize > 1
    if (noiseSizeInt > 1) {
      for (let y = 0; y < height; y += noiseSizeInt) {
        for (let x = 0; x < width; x += noiseSizeInt) {
          const noiseY = y * 0.01;
          const noiseX = x * 0.01;
          const noise = p.noise(noiseX, noiseY, noiseTime) * 255;
          const r = (noise * 0.8) | 0;
          const g = (noise * 0.6) | 0;
          const b = noise | 0;
          
          // Fill block with same color
          for (let blockY = 0; blockY < noiseSizeInt && (y + blockY) < height; blockY++) {
            for (let blockX = 0; blockX < noiseSizeInt && (x + blockX) < width; blockX++) {
              const px = x + blockX;
              const py = y + blockY;
              const index = (px + py * width) * 4;
              pixels[index] = r;
              pixels[index + 1] = g;
              pixels[index + 2] = b;
              pixels[index + 3] = 255;
            }
          }
        }
      }
    } else {
      // Original pixel-by-pixel generation
      let index = 0;
      for (let y = 0; y < height; y++) {
        const noiseY = y * 0.01;
        for (let x = 0; x < width; x++) {
          const noise = p.noise(x * 0.01, noiseY, noiseTime) * 255;
          pixels[index++] = (noise * 0.8) | 0;
          pixels[index++] = (noise * 0.6) | 0;
          pixels[index++] = noise | 0;
          pixels[index++] = 255;
        }
      }
    }
    p.updatePixels();
    p.loadPixels();
  }
  
  // Use Uint8ClampedArray for faster copy
  const tempPixels = new Uint8ClampedArray(pixels);
  const width = p.width;
  const height = p.height;
  const frameOffset = p.frameCount * 0.03;
  const heightMinus1 = height - 1;
  const noiseSizeInt = Math.floor(noiseSize);
  
  // Pre-calculate displacement scale factor
  const displacementScale = 25 / width;
  
  // Process in blocks if noiseSize > 1
  if (noiseSizeInt > 1) {
    for (let blockX = 0; blockX < width; blockX += noiseSizeInt) {
      // Calculate displacement for this block column
      let displacement = Math.floor((width - blockX) * displacementScale);
      displacement += Math.floor(Math.sin(blockX * 0.05 + frameOffset) * 5);
      
      for (let blockY = 0; blockY < height; blockY += noiseSizeInt) {
        // Apply same displacement to all pixels in this block
        for (let x = blockX; x < blockX + noiseSizeInt && x < width; x++) {
          const x4 = x * 4;
          for (let y = blockY; y < blockY + noiseSizeInt && y < height; y++) {
            // Source y positions for RGB channels (chromatic aberration)
            let sourceYR = y - displacement;
            if (sourceYR < 0) sourceYR = 0;
            else if (sourceYR > heightMinus1) sourceYR = heightMinus1;
            
            let sourceYG = y - displacement + 2;
            if (sourceYG < 0) sourceYG = 0;
            else if (sourceYG > heightMinus1) sourceYG = heightMinus1;
            
            let sourceYB = y - displacement + 4;
            if (sourceYB < 0) sourceYB = 0;
            else if (sourceYB > heightMinus1) sourceYB = heightMinus1;
            
            const targetIndex = x4 + y * width * 4;
            
            // Separate RGB channels with different displacements
            pixels[targetIndex] = tempPixels[x4 + sourceYR * width * 4];
            pixels[targetIndex + 1] = tempPixels[x4 + sourceYG * width * 4 + 1];
            pixels[targetIndex + 2] = tempPixels[x4 + sourceYB * width * 4 + 2];
            pixels[targetIndex + 3] = 255;
          }
        }
      }
    }
  } else {
    // Original pixel-by-pixel processing
    for (let x = 0; x < width; x++) {
      // Displacement increases toward left (x=0)
      let displacement = Math.floor((width - x) * displacementScale);
      
      // Add wave motion for organic feel
      displacement += Math.floor(Math.sin(x * 0.05 + frameOffset) * 5);
      
      const x4 = x * 4;
      
      for (let y = 0; y < height; y++) {
        // Source y positions for RGB channels (chromatic aberration)
        // Manual constrain for performance
        let sourceYR = y - displacement;
        if (sourceYR < 0) sourceYR = 0;
        else if (sourceYR > heightMinus1) sourceYR = heightMinus1;
        
        let sourceYG = y - displacement + 2;
        if (sourceYG < 0) sourceYG = 0;
        else if (sourceYG > heightMinus1) sourceYG = heightMinus1;
        
        let sourceYB = y - displacement + 4;
        if (sourceYB < 0) sourceYB = 0;
        else if (sourceYB > heightMinus1) sourceYB = heightMinus1;
        
        const targetIndex = x4 + y * width * 4;
        
        // Separate RGB channels with different displacements
        pixels[targetIndex] = tempPixels[x4 + sourceYR * width * 4];
        pixels[targetIndex + 1] = tempPixels[x4 + sourceYG * width * 4 + 1];
        pixels[targetIndex + 2] = tempPixels[x4 + sourceYB * width * 4 + 2];
        pixels[targetIndex + 3] = 255;
      }
    }
  }
  
  p.updatePixels();
}

