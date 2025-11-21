precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uSmearIntensity;
uniform float uFadeProgress;
uniform float uGlitchIntensity;
uniform float uVisibility;

// Random function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = vTexCoord;
  
  // Flip Y coordinate for p5.js
  uv.y = 1.0 - uv.y;
  
  // SMEARING EFFECT
  // Sample multiple pixels horizontally and blend them
  vec3 color = vec3(0.0);
  float totalWeight = 0.0;
  
  // Number of samples for smearing
  int samples = 8;
  
  for (int i = 0; i < 8; i++) {
    // Create horizontal offset that changes over time
    float offset = (float(i) / 8.0 - 0.5) * uSmearIntensity * 0.05;
    
    // Add some randomness based on vertical position and time
    float randomOffset = (random(vec2(uv.y * 10.0, floor(uTime * 0.5))) - 0.5) * uSmearIntensity * 0.02;
    
    vec2 sampleUV = uv + vec2(offset + randomOffset, 0.0);
    
    // Weight samples (center samples have more weight)
    float weight = 1.0 - abs(float(i) / 8.0 - 0.5) * 2.0;
    weight = pow(weight, 2.0);
    
    color += texture2D(uTexture, sampleUV).rgb * weight;
    totalWeight += weight;
  }
  
  color /= totalWeight;
  
  // Get alpha from original texture
  float alpha = texture2D(uTexture, uv).a;
  
  // SIMPLE FADE-IN EFFECT
  // Just fade in the entire image
  alpha *= uFadeProgress;
  
  // GLITCH EFFECT (after typing completes)
  if (uGlitchIntensity > 0.01) {
    // RGB Chromatic Aberration
    float glitchOffset = random(vec2(floor(uTime * 10.0), uv.y)) * uGlitchIntensity * 0.08;
    
    vec2 uvGlitch = uv;
    
    // Horizontal displacement glitch
    if (random(vec2(floor(uTime * 5.0), floor(uv.y * 20.0))) > 0.9) {
      uvGlitch.x += (random(vec2(uTime, uv.y)) - 0.5) * uGlitchIntensity * 0.05;
    }
    
    // Separate RGB channels for glitch
    float rGlitch = texture2D(uTexture, uvGlitch + vec2(glitchOffset, 0.0)).r;
    float gGlitch = texture2D(uTexture, uvGlitch).g;
    float bGlitch = texture2D(uTexture, uvGlitch - vec2(glitchOffset, 0.0)).b;
    
    // Mix glitched color with original based on intensity
    vec3 glitchedColor = vec3(rGlitch, gGlitch, bGlitch);
    color = mix(color, glitchedColor, uGlitchIntensity);
    
    // Fade opacity based on glitch intensity (higher glitch = lower opacity)
    // When glitchIntensity is 1.0, alpha becomes 0 (invisible)
    // When glitchIntensity is 0.0, alpha stays at 1.0 (fully visible)
    alpha *= (1.3 - uGlitchIntensity);
    
    // Add random flicker on top
    alpha *= 1.3 - (random(vec2(uTime * 0.001)) * uGlitchIntensity * 0.2);
  }
  
  // Apply visibility (for 20-second hide/hover reveal)
  alpha *= uVisibility;
  
  gl_FragColor = vec4(color, alpha);
}

