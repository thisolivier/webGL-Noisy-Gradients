#version 300 es
precision highp float;

// INPUTS

// general
uniform vec2  u_resolution;
uniform float u_sigma;
uniform sampler2D u_noise1;
uniform sampler2D u_noise2;
// uniforms for masking
uniform sampler2D u_mask;
uniform float      u_maskOffset;  // how much to scroll the mask
uniform float      u_maskStretch; // how much to stretch the mask
// for gradient configuations
uniform int    u_numGradients;
uniform vec2   u_centers[16];
uniform float  u_radii[16];
uniform vec3   u_colours[16];

// OUTPUT
out vec4 fragColor;

// CONSTANTS
const float POINT_SIZE = 1.0;
const float NOISE_TILE = 512.0;
const float FADE_START = 2.0;
const float FADE_END   = 3.5;

void main() {
  vec2 uv     = gl_FragCoord.xy;
  vec2 normUV = uv / u_resolution;

  float v = normUV.y * u_maskStretch + u_maskOffset;
  vec2 maskUV = vec2(normUV.x, v);
  float maskVal = texture(u_mask, maskUV).r;

  vec2 cell    = floor(uv / POINT_SIZE) * POINT_SIZE + 0.5 * POINT_SIZE;
  vec2 noiseUV = cell / NOISE_TILE;
  float n1 = texture(u_noise1, noiseUV).r;
  float n2 = texture(u_noise2, noiseUV).r;

  vec3 col = vec3(1.0);

  // ─── Initialise ─────────────────────────────────────────
  vec3 accumColor = vec3(1.0); // Start from white
  bool dotHit = false;

  // ─── Blur kernel setup ─────────────────────────────────
  float weights[5];
  weights[0] = 0.604164; // center
  weights[1] = 0.304005;
  weights[2] = 0.393913;
  weights[3] = 0.304005;
  weights[4] = 0.393913;

  vec2 offsets[5];
  float blurScale = 2.0;
  offsets[0] = vec2(0.0);
  offsets[1] = vec2( 1.0, 0.0) * blurScale;
  offsets[2] = vec2(-1.0, 0.0) * blurScale;
  offsets[3] = vec2( 0.0, 1.0) * blurScale;
  offsets[4] = vec2( 0.0,-1.0) * blurScale;

  // ─── Per-gradient loop ─────────────────────────────────
  for (int i = 0; i < 1; i++) {
    vec2 center = u_centers[i];
    float radius = u_radii[i];
    vec3 colour = u_colours[i];

    // ─── For this fragment, loop over nearby dot cells ───
    for (int j = 0; j < 5; j++) {
      // 1) Locate the dot cell being tested
      vec2 offsetUV = uv + offsets[j] * POINT_SIZE;
      vec2 cell = floor(offsetUV / POINT_SIZE) * POINT_SIZE + 0.5 * POINT_SIZE;
      vec2 cellUV = cell / u_resolution;

      // 2) Check if the cell is inside this gradient’s circular region
      vec2 centerUV = vec2(center.x, center.y / (u_resolution.y / u_resolution.x));
      vec2 delta = cellUV - centerUV;
      float dist2 = dot(delta, delta);

      // discard dots too far from gradient
      if (dist2 > radius * radius * 6.25) continue;

      // Gaussian based on *screen-space distance*, now radius-dependent
      float prob = exp(-dist2 / (2.0 * radius * radius));

      // noise lookup
      vec2 noiseUV = cell / NOISE_TILE;
      float n1 = texture(u_noise1, noiseUV).r;
      float n2 = texture(u_noise2, noiseUV).r;

      // dot test
      if (n1 >= prob || n2 >= prob) continue;

      // apply colour
      accumColor *= mix(vec3(1.0), colour, weights[j]);
      dotHit = true;
    }
  }

  // ─── Final Output ──────────────────────────────────────
  vec3 finalColor = dotHit ? accumColor : vec3(1.0);
  finalColor = mix(vec3(1.0), finalColor, maskVal);
  fragColor = vec4(finalColor, 1.0);
}