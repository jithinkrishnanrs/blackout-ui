import { copyFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

export default defineConfig([
  // ESM + CJS + .d.ts for bundlers / Node.
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2020',
    outExtension({ format }) {
      return { js: format === 'cjs' ? '.cjs' : '.js' };
    },
    onSuccess: async () => {
      copyFileSync('src/styles/blackout.css', 'dist/blackout.css');
    },
  },
  // Standalone IIFE build for <script> / CDN usage, exposing `window.BlackoutUI`.
  {
    entry: { 'blackout-ui': 'src/cdn.ts' },
    format: ['iife'],
    globalName: 'BlackoutUI',
    minify: true,
    sourcemap: true,
    clean: false,
    target: 'es2020',
    outExtension() {
      return { js: '.global.js' };
    },
  },
]);
