/**
 * Chunky Purple Static Glitch Effect
 * Mathematical formula: G_σ * f, R(θ)
 * Filtered noise with chroma phase shift (VHS degradation)
 */

export function purpleStatic(p) {
  // Step 1: Generate base noise
  p.loadPixels();
  
  for (let i = 0; i < p.pixels.length; i += 4) {
    const gray = p.random(255);
    p.pixels[i] = gray;
    p.pixels[i + 1] = gray;
    p.pixels[i + 2] = gray;
    p.pixels[i + 3] = 255;
  }
  
  p.updatePixels();
  
  // Step 2: Apply Gaussian blur (creates "chunky" effect)
  p.filter(p.BLUR, 3);
  
  // Step 3: Apply purple chroma tint
  p.push();
  p.blendMode(p.MULTIPLY);
  p.fill(180, 100, 200, 150);
  p.rect(0, 0, p.width, p.height);
  p.pop();
}

