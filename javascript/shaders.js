// ----- Shader Sources -----
// When bundled with `npm run build` the GLSL files are inlined so these
// imports resolve to the shader source strings. During development the
// variables will be `undefined` and the shaders will instead be fetched
// over the network by `loadShaderSource()`.
import vertexSource from "../shaders/vertex.glsl";
import fragmentSource from "../shaders/fragment.glsl";

export { vertexSource, fragmentSource };

export async function loadShaderSource(path) {
  const res = await fetch(path);
  return await res.text();
}