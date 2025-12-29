precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uIntensity;
uniform float uScanLineIntensity;
uniform float uColorShiftIntensity;
uniform float uDisplacementIntensity;
uniform float uNoiseIntensity;
uniform float uChromaticAberration;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = vTexCoord;
  // Don't flip Y when using rect() in WEBGL
  
  // TEST: If shader is working, this should make image very bright/visible
  // Remove this test after confirming shader works
  // vec3 testColor = texture2D(uTexture, uv).rgb * 2.0;
  // gl_FragColor = vec4(testColor, 1.0);
  // return;
  
  // Base displacement (VHS tracking error) - INCREASED MULTIPLIER AND FREQUENCY
  float displacement = 0.0;
  if (uDisplacementIntensity > 0.01) {
    float displacementChance = random(vec2(floor(uTime * 3.0), floor(uv.y * 20.0)));
    if (displacementChance > 0.85) {  // Changed from 0.92 to 0.85 for more frequent glitches
      displacement = (random(vec2(uTime, uv.y)) - 0.5) * uDisplacementIntensity * 0.5;  // Increased from 0.2 to 0.5
    }
  }
  vec2 uvDisplaced = uv;
  uvDisplaced.x += displacement;
  
  // Chromatic aberration (RGB separation) - INCREASED MULTIPLIER
  float chromaOffset = uChromaticAberration * uIntensity * 0.15;
  float r = texture2D(uTexture, uvDisplaced + vec2(chromaOffset, 0.0)).r;
  float g = texture2D(uTexture, uvDisplaced).g;
  float b = texture2D(uTexture, uvDisplaced - vec2(chromaOffset, 0.0)).b;
  
  // Color shift (hue distortion) - INCREASED MULTIPLIER
  vec3 color = vec3(r, g, b);
  if (uColorShiftIntensity > 0.01) {
    float colorShift = random(vec2(floor(uTime * 2.0))) * uColorShiftIntensity;
    color.r += colorShift * 1.0;
    color.b -= colorShift * 0.8;
  }
  
  // Scan lines (horizontal interference) - INCREASED MULTIPLIER
  float scanLine = 0.0;
  if (uScanLineIntensity > 0.01) {
    scanLine = sin(uv.y * 800.0 + uTime * 0.1) * uScanLineIntensity * 0.8;
    color += scanLine;
  }
  
  // Noise (signal degradation) - INCREASED MULTIPLIER
  if (uNoiseIntensity > 0.01) {
    float noise = (random(vec2(uv * 100.0 + uTime * 0.1)) - 0.5) * uNoiseIntensity * 1.0;
    color += noise;
  }
  
  // Brightness flicker (signal instability) - INCREASED MULTIPLIER
  float flicker = 1.0 - (random(vec2(uTime * 0.001)) * uIntensity * 0.3);
  color *= flicker;
  
  // Get alpha from original texture
  float alpha = texture2D(uTexture, uvDisplaced).a;
  
  gl_FragColor = vec4(color, alpha);
}

