// Copies the real build output into tests/e2e/fixture/vendor so the E2E
// fixture imports the actual built library — never a re-implementation or
// a mock. Mirrors scripts/prepare-demo.mjs, which does the same thing for
// the public demo site. Kept separate from that script (rather than
// shared) because the fixture and the demo are allowed to diverge in what
// they copy/require without coupling to each other.
import { cpSync, existsSync, mkdirSync } from 'node:fs';

const FIXTURE_DIR = 'tests/e2e/fixture';

if (!existsSync('dist/index.js')) {
  console.error('[e2e-fixture] dist/ is missing — run "npm run build" first.');
  process.exit(1);
}

mkdirSync(`${FIXTURE_DIR}/vendor`, { recursive: true });
cpSync('dist/index.js', `${FIXTURE_DIR}/vendor/blackout-ui.js`);

console.log(`[e2e-fixture] copied dist/index.js -> ${FIXTURE_DIR}/vendor/blackout-ui.js`);
