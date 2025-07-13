import { 
  loadShaderSource
} from "./shaders.js";

import { 
  createProgram, 
  initFullScreenQuad, 
  loadTextureAsync 
} from "./utilities.js";

import { gradients } from "./gradients.js";

// ----- Main -----
export default async function main() {
  const canvas = document.getElementById('glcanvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) { alert('WebGL2 required'); return; }

  // compile and link the program
  const vertexSource = await loadShaderSource('/shaders/vertex.glsl')
  const fragmentSource = await loadShaderSource('/shaders/fragment.glsl')
  const prog = createProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(prog);

  // general attributed and locations
  const posLoc  = gl.getAttribLocation(prog, 'a_position');
  const uRes    = gl.getUniformLocation(prog, 'u_resolution');
  const uSig    = gl.getUniformLocation(prog, 'u_sigma');
  const uN1     = gl.getUniformLocation(prog, 'u_noise1');
  const uN2     = gl.getUniformLocation(prog, 'u_noise2');
  // related to mask
  const uMaskLoc     = gl.getUniformLocation(prog, 'u_mask');
  const uMaskStretch = gl.getUniformLocation(prog, 'u_maskStretch')
  const uMaskOfs     = gl.getUniformLocation(prog, 'u_maskOffset');
  // related to gradients
  const uNumGrad     = gl.getUniformLocation(prog, 'u_numGradients');
  const uCArray      = gl.getUniformLocation(prog, 'u_centers');
  const uRArray      = gl.getUniformLocation(prog, 'u_radii');
  const uColourArray = gl.getUniformLocation(prog, 'u_colours');

  // set up quad buffer
  initFullScreenQuad(gl);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  // load both noise textures
  await Promise.all([
    loadTextureAsync(gl, 'bn_4.png', 0),
    loadTextureAsync(gl, 'bn_5.png', 1),
    loadTextureAsync(gl, 'mask.png', 2),
  ]);
  // tell the shader which unit each sampler uses
  gl.uniform1i(uN1, 0);
  gl.uniform1i(uN2, 1);
  gl.uniform1i(uMaskLoc, 2);

  // resize & draw whenever needed
  function resize() {
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function draw() {
    resize();

    const scrollY = window.scrollY || window.pageYOffset;
    const bodyHeight  = document.body.scrollHeight;
    const viewHeight  = window.innerHeight;
    const scrollRange = bodyHeight - viewHeight;
    // Mask computation
    const maskSpeed = 0.5; 
    // denom = bottom of mask hits bottom of view at full scroll
    const denom = viewHeight + scrollRange * maskSpeed;
    // how much to squash/stretch the mask vertically
    const maskStretch  = viewHeight / denom;
    const offset = (scrollY * maskSpeed) / denom; // Change to (scrollRange - scrollY) to flip mask direction

    // ── DATA-DRIVEN GRADIENTS SETUP ──
    // 1) Gather into flat arrays:
    const centres = [];
    const radii   = [];
    const colours = [];
    for (let g of gradients) {
      // screen-space X
      const x = canvas.width * g.xNorm;
      // screen-space Y
      const y = (g.yNorm * canvas.width * -1) + scrollY * g.speed;
      centres.push(x, y);
      radii.push(g.radius * canvas.width);
      colours.push(...g.colour);
    }
    // 2) update gradient inputs
    gl.uniform1i(uNumGrad, gradients.length);
    gl.uniform2fv(uCArray, centres);
    gl.uniform1fv(uRArray, radii);
    gl.uniform3fv(uColourArray, colours);

    // update uniforms
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMaskOfs, 0, scrollY);
    gl.uniform1f(uSig, Math.min(canvas.width, canvas.height) * 0.25);
    gl.uniform1f(uMaskStretch,  maskStretch);
    gl.uniform1f(uMaskOfs, offset);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  window.addEventListener('scroll', draw);
  window.addEventListener('resize', draw);
  draw();
}
main();