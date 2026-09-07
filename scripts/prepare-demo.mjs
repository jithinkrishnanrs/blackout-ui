// Copies the real build output into demo/vendor so the demo page imports
// the actual published package, never a hand-duplicated copy of it.
import { cpSync, existsSync, mkdirSync } from 'node:fs';

if (!existsSync('dist/index.js')) {
  console.error('[demo] dist/ is missing — run "npm run build" first.');
  process.exit(1);
}

mkdirSync('demo/vendor', { recursive: true });
cpSync('dist/index.js', 'demo/vendor/blackout-ui.js');
cpSync('dist/blackout.css', 'demo/vendor/blackout.css');
console.log('[demo] copied dist/ -> demo/vendor/');
