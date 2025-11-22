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
  
  // Base displacement (VHS tracking error)
  float displacement = 0.0;
  if (uDisplacementIntensity > 0.01) {
    float displacementChance = random(vec2(floor(uTime * 3.0), floor(uv.y * 20.0)));
    if (displacementChance > 0.92) {
      displacement = (random(vec2(uTime, uv.y)) - 0.5) * uDisplacementIntensity * 0.1;
    }
  }
  vec2 uvDisplaced = uv;
  uvDisplaced.x += displacement;
  
  // Chromatic aberration (RGB separation)
  float chromaOffset = uChromaticAberration * uIntensity * 0.02;
  float r = texture2D(uTexture, uvDisplaced + vec2(chromaOffset, 0.0)).r;
  float g = texture2D(uTexture, uvDisplaced).g;
  float b = texture2D(uTexture, uvDisplaced - vec2(chromaOffset, 0.0)).b;
  
  // Color shift (hue distortion)
  vec3 color = vec3(r, g, b);
  if (uColorShiftIntensity > 0.01) {
    float colorShift = random(vec2(floor(uTime * 2.0))) * uColorShiftIntensity;
    color.r += colorShift * 0.5;
    color.b -= colorShift * 0.3;
  }
  
  // Scan lines (horizontal interference)
  float scanLine = 0.0;
  if (uScanLineIntensity > 0.01) {
    scanLine = sin(uv.y * 800.0 + uTime * 0.05) * uScanLineIntensity;
    color += scanLine;
  }
  
  // Noise (signal degradation)
  if (uNoiseIntensity > 0.01) {
    float noise = (random(vec2(uv * 100.0 + uTime * 0.1)) - 0.5) * uNoiseIntensity;
    color += noise;
  }
  
  // Brightness flicker (signal instability)
  float flicker = 1.0 - (random(vec2(uTime * 0.001)) * uIntensity * 0.2);
  color *= flicker;
  
  // Get alpha from original texture
  float alpha = texture2D(uTexture, uvDisplaced).a;
  
  gl_FragColor = vec4(color, alpha);
}

