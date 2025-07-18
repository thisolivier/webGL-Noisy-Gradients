# Infinite-Scroll Spray-Paint Gradients

A beautiful, fully configurable, WebGL-powered “spray-paint” gradient system that runs behind your page. Each centre is rendered as two stacked dot-layers for rich colour saturation.

---

## Getting Started

1. Clone this repo 👥
2. Navigate to the repo directory with your shell 🐚
3. Run `python -m http.server 8080` 🏃
4. Visit `localhost:8080` in your web browser 🎉

You can then have a look at `gradients.js` and reconfigure the blobs as you like. Currently page height you can scroll is set using the height CSS property in `index.html`.

## Configuration

You configure your sprays of colour in `gradients.js`. The vertical positioning, and width of the blob, is proprtional to the page width. I hope to implement looping soon, but for now, on a long page, you'll need to make a long list of gradients.

You can change the border effect replacing the mask.png file (white is transparent). Also, playing about with `const float POINT_SIZE` in `fragment.glsl` can be entertaining.

## Features

- **Dual-layer dot rendering**  
  Gradients are rendered as a spray of dots, giving the effect a physicality. Each centre produces two independent samples of noise → two “dot-layers” stacked multiplicatively for deeper, more saturated hues.

- **Parallax masking** (optional)  
  Sample a third texture as an alpha-mask in the fragment shader, with its own `maskScale` & `maskOffset` controlled by scroll to create smooth, blurred mask shapes.

- **Up to 16 configurable centres**  
  Each centre has its own:
  - **`xNorm`**: horizontal position (0…1 of canvas width)
  - **`yNorm`**: spawn offset (0…∞, in multiples of viewport height)
  - **`speed`**: scroll-multiplier (how fast it moves relative to page scroll)
  - **`radius`**: circle size (0…1 of canvas width)
  - **`color`**: RGB array

- **Normalization & resize stability**  
  All positions and sizes live in normalized space relative to the page width. This makes things stable when the window resizes, and ensure your proportions/design stays pretty on mobile and desktop.

- **Excellent looping (coming soon)**  
  - A centre is **removed** once its screen-space Y drifts more than **3× its radius** above the viewport.  
  - It is **re-spawned** when its Y moves more than **3× its radius** below the viewport.  
  - Re-spawns are triggered by bumping `yNorm += 1.0`, preserving colour, speed and radius.

## Project Structure

The repository contains a few small files that cooperate to display the moving
gradients:

- **`index.html`** – minimal page markup and CSS. It loads
  `javascript/main.js` which in turn starts the effect.
- **`javascript/main.js`** – waits for the document to load and then calls
  `initBackgroundGradients()`.
- **`javascript/initBackgroundGradients.js`** – creates the canvas elements used
  for rendering (if they do not already exist) and launches the shaders on each
  canvas via `runShaderOnCanvas()`.
- **`javascript/runShaderOnCanvas.js`** – core WebGL logic. It loads the shader
  code from the `shaders/` folder, sets up textures from `images/`, reads the
  gradient definitions from `gradients.js`, and schedules redraws on scroll or
  resize.
- **`javascript/gradients.js`** – holds the array of gradient centres and their
  colours, radii and movement speeds.
- **`javascript/shaders.js`** – small helper for fetching the GLSL source
  strings for the shaders.
- **`javascript/utilities.js`** – assorted WebGL helpers such as shader
  compilation, program creation, full screen quad setup and texture loading.
- **`shaders/vertex.glsl`** and **`shaders/fragment.glsl`** – the GLSL programs
  executed on the GPU to draw the spray‑paint effect.
- **`images/`** – contains the noise textures used by the shaders.

Together these files create the scrolling spray‑paint gradients by configuring
the shaders with data from `gradients.js` and redrawing the canvases as the
page scrolls.
