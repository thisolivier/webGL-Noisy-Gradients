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
const float FADE_END   = 2.5;

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
  float anyFade = 0.0;

  for (int i = 0; i < 16; i++) {
    if (i >= u_numGradients) break;

    vec2 c = u_centers[i];
    float r = u_radii[i];
    vec3 colour = u_colours[i];

    // 1) normalized distance
    float dNorm = distance(uv, c) / r;

    // 2) gaussian probability
    float dist2 = dNorm * dNorm * (r * r);
    float prob  = exp(-dist2 / (2.0 * r * r));

    // 3) fade factor: 1.0 inside 2r → 0.0 at 2.5r
    float fade = 1.0 - smoothstep(FADE_START, FADE_END, dNorm);
    anyFade = max(anyFade, fade);

    // 4) dot-layer tests & colour multiply
    if (n1 < prob) col *= (colour * fade);
    if (n2 < prob) col *= (colour * fade);
  }

  col = mix(vec3(1.0), col, maskVal);
  fragColor = vec4(col, 1.0);
}