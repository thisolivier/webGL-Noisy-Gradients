#version 300 es
precision highp float;

uniform vec2       u_resolution;
uniform sampler2D  u_noise1, u_noise2, u_mask;
uniform float      u_maskOffset, u_maskStretch;

uniform int    u_numGradients;
uniform vec2   u_centers[16];
uniform float  u_radii[16];
uniform vec3   u_colours[16];
uniform int    u_blendMode[16];  // if you’re combining with your dodge/add logic

out vec4 fragColor;

const float POINT_SIZE = 1.0;
const float NOISE_TILE = 512.0;
const float FADE_START = 2.0;
const float FADE_END   = 3.5;

vec3 blendLinearDodge(vec3 D, vec3 S) {
  return min(D + S, vec3(1.0));
}
vec3 blendColorDodge(vec3 D, vec3 S) {
  if (D == vec3(0.0)) return S;
  vec3 denom = max(vec3(1e-6), vec3(1.0) - S);
  return min(D / denom, vec3(1.0));
}

void main() {
  vec2 uv     = gl_FragCoord.xy;
  vec2 normUV = uv / u_resolution;

  // scroll mask
  float v      = normUV.y * u_maskStretch + u_maskOffset;
  float maskVal= texture(u_mask, vec2(normUV.x, v)).r;

  // blue-noise lookups
  vec2 cell    = floor(uv / POINT_SIZE) * POINT_SIZE + 0.5 * POINT_SIZE;
  vec2 noiseUV = cell / NOISE_TILE;
  float n1 = texture(u_noise1, noiseUV).r;
  float n2 = texture(u_noise2, noiseUV).r;

  // start with transparent black
  vec3  colAccum = vec3(0.0);
  float alphaAccum = 0.0;

  for (int i = 0; i < 16; i++) {
    if (i >= u_numGradients) break;

    vec2  c      = u_centers[i];
    float r      = u_radii[i];
    vec3  colour = u_colours[i];
    int   mode   = u_blendMode[i];

    // distance-based fade
    float dNorm = distance(uv, c) / r;
    float fade  = 1.0 - smoothstep(FADE_START, FADE_END, dNorm);

    // gaussian dot probability
    float prob  = exp(-dNorm*dNorm / 2.0);

    // skip if neither noise hits
    bool hit = false;
    if (n1 < prob) hit = true;
    if (n2 < prob) hit = true;
    if (!hit || fade <= 0.0) continue;

    // compute source colour scaled by fade
    vec3 srcCol = colour;

    // blend onto accumulator
    if (mode == 0) {
      colAccum = blendColorDodge(colAccum, srcCol);
    } else {
      colAccum = blendColorDodge(colAccum, srcCol);
    } 

    // track maximum alpha needed
    alphaAccum = max(alphaAccum, fade);
  }

  // also mask by scroll
  alphaAccum *= maskVal;

  // output premultiplied colour & alpha
  fragColor = vec4(colAccum * alphaAccum, alphaAccum);
}
