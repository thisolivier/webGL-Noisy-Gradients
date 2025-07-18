import { build } from 'esbuild';
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

build({
  entryPoints: ['javascript/main.js'],
  bundle: true,
  minify: false,
  globalName: 'SprayGraphics',
  plugins: [glslPlugin],
  outfile: 'dist/bundle.min.js',
}).catch(() => process.exit(1));
