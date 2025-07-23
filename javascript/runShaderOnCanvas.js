import vertexSource from "../shaders/vertex.glsl";
import fragmentSource from "../shaders/fragment.glsl";

import noise4Url from "../images/bn_4.png";
import noise5Url from "../images/bn_5.png";

import {
  normaliser8Bit,
  createProgram,
  initFullScreenQuad,
  loadTextureAsync
} from "./utilities.js";

import { gradientsDesktop } from "./gradients.js";

export async function runShaderOnCanvas(canvasName) {
  const canvas = document.getElementById(canvasName);
  const gl = canvas.getContext('webgl2');
  if (!gl) { alert('WebGL2 required'); return; }

  // compile and link the program. When bundled, vertexSource and
  // fragmentSource are inlined; otherwise fall back to fetching them.
  const vsSrc = vertexSource;
  const fsSrc = fragmentSource;
  const prog = createProgram(gl, vsSrc, fsSrc);
  gl.useProgram(prog);

  // general attributed and locations
  const posLoc  = gl.getAttribLocation(prog, 'a_position');
  const uRes    = gl.getUniformLocation(prog, 'u_resolution');
  const uSig    = gl.getUniformLocation(prog, 'u_sigma');
  const uN1     = gl.getUniformLocation(prog, 'u_noise1');
  const uN2     = gl.getUniformLocation(prog, 'u_noise2');
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
    loadTextureAsync(gl, noise4Url, 0),
    loadTextureAsync(gl, noise5Url, 1),
  ]);
  // tell the shader which unit each sampler uses
  gl.uniform1i(uN1, 0);
  gl.uniform1i(uN2, 1);

  // resize & draw whenever needed
  function resize() {
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function draw() {
    resize();

    const t = performance.now() * 0.001; // seconds
    const scrollY = window.scrollY || window.pageYOffset;

    // ── DATA-DRIVEN GRADIENTS SETUP ──
    // Pick the gradient set based on current window width
    const gradients = gradientsDesktop;
    // 1) Gather into flat arrays:
    const centres = [];
    const radii   = [];
    const colours = [];
    // Note: yNorm and radius are also scaled using canvas.width
    // so that all positioning is relative to screen width for consistency.
    // This creates a square-based coordinate system even in tall viewports.
    for (let i = 0; i < gradients.length; i++) {
      const g = gradients[i];
      const baseX = canvas.width * g.xNorm;
      const amp   = g.radius * canvas.width * 0.2;
      const x = baseX + Math.sin(t + g.phase[i]) * amp;
      // screen-space Y
      const y = (g.yNorm * canvas.width * -1) + canvas.height + scrollY * g.speed;
      centres.push(x, y);
      radii.push(g.radius * canvas.width);
      colours.push(...(normaliser8Bit(g.colour)));
    }
    // 2) update gradient inputs
    gl.uniform1i(uNumGrad, gradients.length);
    gl.uniform2fv(uCArray, centres);
    gl.uniform1fv(uRArray, radii);
    gl.uniform3fv(uColourArray, colours);

    // update uniforms
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uSig, Math.min(canvas.width, canvas.height) * 0.25);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  window.addEventListener('resize', draw);

  function animate() {
    draw();
    requestAnimationFrame(animate);
  }

  animate();
}
