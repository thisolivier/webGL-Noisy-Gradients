export const gradients = [
  {
    xNorm: 0.60,
    yNorm: -0.5,
    speed: 0.1,
    radius: 0.2,
    colour: [1.0, 1.0, 0.0], // yellow
    blendMode: "colDodge", // colour dodge
  }, 
  {
    xNorm: 0.2,
    yNorm: 0,
    speed: 0.3,
    radius: 0.1,
    colour: [0.624, 0.220, 1.0], // pink in GLSL Vec3 format
    blendMode: "colDodge", // colour dodge
  },

  {
    xNorm: 0.8,
    yNorm: 0.2,
    speed: 0.3,
    radius: 0.1,
    colour: [0.788, 1.0, 0.992], // light blue
    blendMode: "colDodge", // linear dodge
  }
  // up to 16 entries
];