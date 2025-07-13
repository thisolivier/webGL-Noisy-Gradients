// ----- Shader Sources -----
export const vertexSource = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

export const fragmentSource = `#version 300 es
precision highp float;

uniform vec2  u_resolution;
uniform vec2  u_center1;
uniform vec2  u_center2;
uniform float u_sigma;
uniform sampler2D u_noise1;
uniform sampler2D u_noise2;

// new uniforms for masking
uniform sampler2D u_mask;
uniform vec2      u_maskOffset;  // how much to scroll the mask

out vec4 fragColor;

const float POINT_SIZE = 3.0;
const float NOISE_TILE = 512.0;

void main() {
  vec2 uv       = gl_FragCoord.xy;
  vec2 normUV   = uv / u_resolution;
  vec2 maskUV   = normUV + u_maskOffset;  
  float maskVal = texture(u_mask, maskUV).r;  // assume mask stored in red

  // (1) compute probabilities exactly as before
  float r1 = distance(uv, u_center1);
  float p1 = exp(-r1*r1 / (2.0 * u_sigma * u_sigma));
  float r2 = distance(uv, u_center2);
  float p2 = exp(-r2*r2 / (2.0 * u_sigma * u_sigma));

  // (2) sample your two noise textures
  vec2 cell    = floor(uv/POINT_SIZE)*POINT_SIZE + POINT_SIZE*0.5;
  vec2 noiseUV = cell/NOISE_TILE;
  float nP = texture(u_noise1, noiseUV).r;
  float nY = texture(u_noise2, noiseUV).r;

  // (3) stack your pink & yellow layers
  vec3 pink  = vec3(0.98, 0.42, 1.0);
  vec3 yellow= vec3(1.0, 1.0, 0.0);
  vec3 col   = vec3(1.0);
  if (nP < p1) col *= pink;
  if (nY < p1) col *= pink;
  if (nY < p2) col *= yellow;
  if (nP < p2) col *= yellow;

  // (4) apply the mask: blend against white
  col = mix(vec3(1.0), col, maskVal);

  fragColor = vec4(col, 1.0);
}`;