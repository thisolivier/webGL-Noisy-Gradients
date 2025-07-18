import { context } from 'esbuild';
import { readFileSync } from 'fs';

const glslPlugin = {
  name: 'glsl',
  setup(build) {
    build.onLoad({ filter: /\.glsl$/ }, args => ({
      contents: readFileSync(args.path, 'utf8'),
      loader: 'text'
    }));
  }
};

const ctx = await context({
  entryPoints: ['javascript/main.js'],
  bundle: true,
  globalName: 'SprayGraphics',
  sourcemap: true,
  plugins: [glslPlugin],
  loader: {
    '.png': 'dataurl'
  },
  outfile: 'dist/bundle.js'
});

await ctx.watch();
const { host, port } = await ctx.serve({ servedir: '.', port: 8080 });
console.log(`Dev server running at http://${host}:${port}`);

