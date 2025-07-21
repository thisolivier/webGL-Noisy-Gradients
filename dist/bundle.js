var SprayGraphics = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // javascript/main.js
  var main_exports = {};
  __export(main_exports, {
    setupCanvases: () => setupCanvases
  });

  // shaders/vertex.glsl
  var vertex_default = "#version 300 es\nin vec2 a_position;\nvoid main() {\n  gl_Position = vec4(a_position, 0.0, 1.0);\n}";

  // shaders/fragment.glsl
  var fragment_default = "#version 300 es\nprecision highp float;\n\n// INPUTS\n\n// general\nuniform vec2  u_resolution;\nuniform float u_sigma;\nuniform sampler2D u_noise1;\nuniform sampler2D u_noise2;\n// for gradient configuations\nuniform int    u_numGradients;\nuniform vec2   u_centers[16];\nuniform float  u_radii[16];\nuniform vec3   u_colours[16];\n\n// OUTPUT\nout vec4 fragColor;\n\n// CONSTANTS\nconst float POINT_SIZE = 2.0;\nconst float NOISE_TILE = 512.0;\nconst float FADE_CUTOFF   = 3.5;\n\nvoid main() {\n  vec2 uv     = gl_FragCoord.xy;\n  vec2 normUV = uv / u_resolution;\n\n  vec2 cell    = floor(uv / POINT_SIZE) * POINT_SIZE + 0.5 * POINT_SIZE;\n  vec2 noiseUV = cell / NOISE_TILE;\n  float n1 = texture(u_noise1, noiseUV).r;\n  float n2 = texture(u_noise2, noiseUV).r;\n\n  vec3 col = vec3(1.0);\n\n  for (int i = 0; i < 16; i++) {\n    if (i >= u_numGradients) break;\n\n    vec2 c = u_centers[i];\n    float r = u_radii[i];\n    vec3 colour = u_colours[i];\n\n    // 1) Work out distances between the fragment and gradient center\n    vec2 delta = uv - c;\n    float dist2 = dot(delta, delta); // pixel\xB2 space so no quare root needed\n    float fadeCutoff2 = FADE_CUTOFF * FADE_CUTOFF * r * r;\n\n    if (dist2 >= fadeCutoff2) continue;\n\n    float prob = exp(-dist2 / (2.0 * r * r));\n\n    // 4) dot-layer tests & colour multiply\n    if (n1 < prob) col *= colour;\n    if (n2 < prob) col *= colour;\n  }\n\n  fragColor = vec4(col, 1.0);\n}";

  // javascript/utilities.js
  function normaliser8Bit(array8bit) {
    return array8bit.map((val) => (val / 255).toFixed(4));
  }
  function compileShader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }
  function createProgram(gl, vsSrc, fsSrc) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return null;
    }
    return prog;
  }
  function initFullScreenQuad(gl) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,
      -1,
      1,
      -1,
      -1,
      1,
      1,
      1,
      -1,
      1,
      1,
      -1
    ]), gl.STATIC_DRAW);
    return buf;
  }
  function loadTextureAsync(gl, src, unit) {
    return new Promise((resolve) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array([128]));
      const img = new Image();
      img.src = src;
      img.onload = () => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        resolve();
      };
    });
  }

  // javascript/gradients.js
  var gradients = [
    {
      xNorm: 0.9,
      yNorm: -0.1,
      speed: 1,
      radius: 0.2,
      colour: [238, 130, 255]
      // pink
    },
    {
      xNorm: 0.4,
      yNorm: 0.15,
      speed: 0.3,
      radius: 0.3,
      colour: [255, 228, 0]
      // yellow
    },
    {
      xNorm: 0.01,
      yNorm: 0.7,
      speed: 0.3,
      radius: 0.2,
      colour: [244, 176, 255]
      // pink
    },
    {
      xNorm: 0.2,
      yNorm: 1.3,
      speed: 0.6,
      radius: 0.2,
      colour: [255, 249, 77]
      // yellow
    },
    {
      xNorm: 0.8,
      yNorm: 0.7,
      speed: 0.4,
      radius: 0.1,
      colour: [171, 254, 255]
      // light blue
    }
    // up to 16 entries
  ];

  // javascript/runShaderOnCanvas.js
  async function runShaderOnCanvas(canvasName) {
    const canvas = document.getElementById(canvasName);
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      alert("WebGL2 required");
      return;
    }
    const vsSrc = vertex_default;
    const fsSrc = fragment_default;
    const prog = createProgram(gl, vsSrc, fsSrc);
    gl.useProgram(prog);
    const posLoc = gl.getAttribLocation(prog, "a_position");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uSig = gl.getUniformLocation(prog, "u_sigma");
    const uN1 = gl.getUniformLocation(prog, "u_noise1");
    const uN2 = gl.getUniformLocation(prog, "u_noise2");
    const uNumGrad = gl.getUniformLocation(prog, "u_numGradients");
    const uCArray = gl.getUniformLocation(prog, "u_centers");
    const uRArray = gl.getUniformLocation(prog, "u_radii");
    const uColourArray = gl.getUniformLocation(prog, "u_colours");
    initFullScreenQuad(gl);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    await Promise.all([
      loadTextureAsync(gl, "../images/bn_4.png", 0),
      loadTextureAsync(gl, "../images/bn_5.png", 1)
    ]);
    gl.uniform1i(uN1, 0);
    gl.uniform1i(uN2, 1);
    function resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function draw() {
      resize();
      const scrollY = window.scrollY || window.pageYOffset;
      const bodyHeight = document.body.scrollHeight;
      const viewHeight = window.innerHeight;
      const scrollRange = bodyHeight - viewHeight;
      const centres = [];
      const radii = [];
      const colours = [];
      for (let g of gradients) {
        const x = canvas.width * g.xNorm;
        const y = g.yNorm * canvas.width * -1 + canvas.height + scrollY * g.speed;
        centres.push(x, y);
        radii.push(g.radius * canvas.width);
        colours.push(...normaliser8Bit(g.colour));
      }
      gl.uniform1i(uNumGrad, gradients.length);
      gl.uniform2fv(uCArray, centres);
      gl.uniform1fv(uRArray, radii);
      gl.uniform3fv(uColourArray, colours);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uSig, Math.min(canvas.width, canvas.height) * 0.25);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    window.addEventListener("scroll", draw);
    window.addEventListener("resize", draw);
    draw();
  }

  // javascript/main.js
  async function setupCanvases() {
    const spec = [
      {
        id: "glcanvas",
        style: {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          display: "block",
          zIndex: "1",
          opacity: "0.7",
          filter: "blur(3px)"
        }
      },
      {
        id: "glcanvasBlurred",
        style: {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          display: "block",
          zIndex: "2",
          filter: "blur(1px)",
          mixBlendMode: "soft-light",
          opacity: "1"
        }
      }
    ];
    for (const cfg of spec) {
      let c = document.getElementById(cfg.id);
      if (!c) {
        c = document.createElement("canvas");
        c.id = cfg.id;
        Object.assign(c.style, cfg.style);
        document.body.appendChild(c);
      }
    }
    await Promise.all([
      runShaderOnCanvas("glcanvas"),
      runShaderOnCanvas("glcanvasBlurred")
    ]);
  }
  return __toCommonJS(main_exports);
})();
//# sourceMappingURL=bundle.js.map
