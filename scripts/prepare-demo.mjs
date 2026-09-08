// Copies the real build output into demo/vendor so the demo page imports
// the actual published package, never a hand-duplicated copy of it. Also
// records the *actual* gzipped size of that build output, and the current
// package version, so the homepage can display real, current values
// instead of hand-typed numbers that drift on the next release.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

if (!existsSync('dist/index.js')) {
  console.error('[demo] dist/ is missing — run "npm run build" first.');
  process.exit(1);
}

mkdirSync('demo/vendor', { recursive: true });
cpSync('dist/index.js', 'demo/vendor/blackout-ui.js');
cpSync('dist/blackout.css', 'demo/vendor/blackout.css');

function gzipKb(path) {
  const bytes = gzipSync(readFileSync(path)).length;
  return Math.round((bytes / 1024) * 100) / 100;
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

const meta = {
  version: pkg.version,
  bundleSizes: {
    esm: gzipKb('dist/index.js'),
    cjs: gzipKb('dist/index.cjs'),
    cdnGlobal: gzipKb('dist/blackout-ui.global.js'),
  },
  generatedAt: new Date().toISOString(),
};

writeFileSync('demo/vendor/meta.json', JSON.stringify(meta, null, 2));

console.log('[demo] copied dist/ -> demo/vendor/');
console.log(`[demo] package version: ${meta.version}`);
console.log(
  `[demo] bundle sizes (gzip): esm ${meta.bundleSizes.esm}KB, cjs ${meta.bundleSizes.cjs}KB, cdn ${meta.bundleSizes.cdnGlobal}KB`
);

