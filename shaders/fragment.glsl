#version 300 es
precision highp float;

// INPUTS

// general
uniform vec2  u_resolution;
uniform float u_sigma;
uniform sampler2D u_noise1;
uniform sampler2D u_noise2;
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
const float FADE_CUTOFF   = 3.5;

void main() {
  vec2 uv     = gl_FragCoord.xy;
  vec2 normUV = uv / u_resolution;

  vec2 cell    = floor(uv / POINT_SIZE) * POINT_SIZE + 0.5 * POINT_SIZE;
  vec2 noiseUV = cell / NOISE_TILE;
  float n1 = texture(u_noise1, noiseUV).r;
  float n2 = texture(u_noise2, noiseUV).r;

  vec3 col = vec3(1.0);

  for (int i = 0; i < 16; i++) {
    if (i >= u_numGradients) break;

    vec2 c = u_centers[i];
    float r = u_radii[i];
    vec3 colour = u_colours[i];

    // 1) Work out distances between the fragment and gradient center
    vec2 delta = uv - c;
    float dist2 = dot(delta, delta); // pixel² space so no quare root needed
    float fadeCutoff2 = FADE_CUTOFF * FADE_CUTOFF * r * r;

    if (dist2 >= fadeCutoff2) continue;

    float prob = exp(-dist2 / (2.0 * r * r));

    // 4) dot-layer tests & colour multiply
    if (n1 < prob) col *= colour;
    if (n2 < prob) col *= colour;
  }

  fragColor = vec4(col, 1.0);
}