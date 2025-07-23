// All Colours should be input in HSL format
// Array of gradient blobs for the desktop breakpoint
export const gradientsDesktop = [
  {
    xNorm: 0.9,
    yNorm: -0.1,
    speed: 1,
    radius: 0.2,
    colour: [247, 101, 206], // pink
  }, 
  {
    xNorm: 0.4,
    yNorm: 0.15,
    speed: 0.3,
    radius: 0.3,
    colour: [255, 224, 20], // yellow
  }, 
  {
    xNorm: 0.01,
    yNorm: 0.7,
    speed: 0.3,
    radius: 0.2,
    colour: [244, 176, 255], // pink
  }, 
  {
    xNorm: 0.8,
    yNorm: 0.7,
    speed: 0.4,
    radius: 0.15,
    colour: [171, 254, 255] // light blue
  },  
  {
    xNorm: 0.9,
    yNorm: 1.6,
    speed: 1,
    radius: 0.3,
    colour: [240, 150, 255], // pink
  },
  {
    xNorm: 0.4,
    yNorm: 1.5,
    speed: 0.6,
    radius: 0.3,
    colour: [255, 249, 77], // yellow
  },   
  {
    xNorm: 0.8,
    yNorm: 1.7,
    speed: 0.4,
    radius: 0.25,
    colour: [171, 254, 255] // light blue
  },
  // up to 16 entries
].map(obj => ({...obj, phase: Math.random() * Math.PI * 2}));

const gradientsMobile = [
  {
    xNorm: 0.3,
    yNorm: 0.15,
    speed: 0.3,
    radius: 0.5,
    colour: [255, 224, 20], // yellow
  }, 
  {
    xNorm: 0.9,
    yNorm: 1,
    speed: 0.8,
    radius: 0.3,
    colour: [244, 176, 255], // pink
  }, 
  {
    xNorm: 0.2,
    yNorm: 1.5,
    speed: 0.4,
    radius: 0.4,
    colour: [171, 254, 255] // light blue
  },  
  {
    xNorm: 0.6,
    yNorm: 2.5,
    speed: 0.6,
    radius: 0.6,
    colour: [255, 249, 77], // yellow
  }, 
  {
    xNorm: 0.2,
    yNorm: 3.6,
    speed: 1,
    radius: 0.3,
    colour: [240, 150, 255], // pink
  },
  {
    xNorm: 0.8,
    yNorm: 2.7,
    speed: 0.4,
    radius: 0.25,
    colour: [171, 254, 255] // light blue
  },
  {
    xNorm: 0.3,
    yNorm: 2.85,
    speed: 0.3,
    radius: 0.5,
    colour: [255, 224, 20], // yellow
  }, 
  {
    xNorm: 0.9,
    yNorm: 3.7,
    speed: 0.8,
    radius: 0.3,
    colour: [244, 176, 255], // pink
  }, 
  {
    xNorm: 0.2,
    yNorm: 4.3,
    speed: 0.4,
    radius: 0.4,
    colour: [171, 254, 255] // light blue
  },  
  {
    xNorm: 0.6,
    yNorm: 5.2,
    speed: 0.6,
    radius: 0.6,
    colour: [255, 249, 77], // yellow
  }
  // up to 16 entries
].map(obj => ({...obj, phase: Math.random() * Math.PI * 2}));

console.log(gradientsDesktop)

/**
 * Return the gradient array appropriate for the given width.
 * Defaults to `window.innerWidth` when no argument is supplied.
 */
export function getGradientsForWidth(width = window.innerWidth) {
  if (width >= 1001) return gradientsDesktop;
  if (width >= 651) return gradientsDesktop;
  return gradientsMobile;
}
