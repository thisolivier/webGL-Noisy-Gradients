import { runShaderOnCanvas } from "./runShaderOnCanvas.js";

export async function initBackgroundGradients() {
  const spec = [
    {
      id: 'glcanvas',
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        display: 'block',
        zIndex: '1',
        opacity: '0.7',
        filter: 'blur(3px)'
      }
    },
    {
      id: 'glcanvasBlurred',
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        display: 'block',
        zIndex: '2',
        filter: 'blur(1px)',
        mixBlendMode: 'soft-light',
        opacity: '1'
      }
    }
  ];

  for (const cfg of spec) {
    let c = document.getElementById(cfg.id);
    if (!c) {
      c = document.createElement('canvas');
      c.id = cfg.id;
      Object.assign(c.style, cfg.style);
      document.body.appendChild(c);
    }
  }

  await Promise.all([
    runShaderOnCanvas('glcanvas'),
    runShaderOnCanvas('glcanvasBlurred')
  ]);
}
