// ----- Shader Sources -----
export const vertexSource = `MOVED TO SHADERS FILE`;

export const fragmentSource = `MOVED TO SHADERS FILE`;

export async function loadShaderSource(path) {
  const res = await fetch(path);
  return await res.text();
}