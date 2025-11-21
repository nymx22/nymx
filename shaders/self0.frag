precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uFlickerIntensity;
uniform float uGlitchIntensity;
uniform float uScanLineIntensity;
uniform float uTrackingIntensity;
uniform float uColorShiftIntensity;

// Random function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = vTexCoord;
  
  // Flip Y coordinate for p5.js
  uv.y = 1.0 - uv.y;
  
  // FLICKERING EFFECT
  float flicker = random(vec2(uTime * 0.001)) * uFlickerIntensity;
  float brightness = 1.0 - flicker * 0.3;
  
  // ANALOG GLITCH - RGB Chromatic Aberration
  float glitchOffset = random(vec2(floor(uTime * 10.0), uv.y)) * uGlitchIntensity * 0.02;
  
  // VHS TRACKING ERRORS (horizontal displacement)
  float trackingError = 0.0;
  if (random(vec2(floor(uTime * 5.0), floor(uv.y * 20.0))) > 0.95) {
    trackingError = (random(vec2(uTime, uv.y)) - 0.5) * uTrackingIntensity * 0.1;
  }
  vec2 uvTracking = uv;
  uvTracking.x += trackingError;
  
  // Separate RGB channels (analog TV effect)
  float r = texture2D(uTexture, uvTracking + vec2(glitchOffset, 0.0)).r;
  float g = texture2D(uTexture, uvTracking).g;
  float b = texture2D(uTexture, uvTracking - vec2(glitchOffset, 0.0)).b;
  
  // HORIZONTAL SCAN LINES (analog glitch)
  float scanLine = sin(uv.y * 800.0 + uTime * 0.05) * uScanLineIntensity;
  
  // COLOR BLEEDING (analog artifact)
  vec3 bleed = texture2D(uTexture, uvTracking + vec2(0.005, 0.0)).rgb * 0.3 * uGlitchIntensity;
  
  // Combine effects
  vec3 color = vec3(r, g, b);
  color += bleed;
  color += scanLine;
  color *= brightness;
  
  // Random color shift (VHS color distortion)
  float colorShift = random(vec2(floor(uTime * 2.0))) * uColorShiftIntensity;
  color.r += colorShift * 0.7;
  color.b += colorShift * 0.1;
  
  // Get alpha from original texture
  float alpha = texture2D(uTexture, uvTracking).a;
  
  gl_FragColor = vec4(color, alpha);
}

