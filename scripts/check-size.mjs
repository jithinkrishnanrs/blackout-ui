import { gzipSync } from 'node:zlib';
import { readFileSync, existsSync } from 'node:fs';

const files = ['dist/index.js', 'dist/index.cjs', 'dist/blackout-ui.global.js'];
const BUDGET_KB = 10;

let failed = false;
for (const file of files) {
  if (!existsSync(file)) {
    console.warn(`[size] skipping missing ${file} (run "npm run build" first)`);
    continue;
  }
  const raw = readFileSync(file);
  const gzipped = gzipSync(raw).length;
  const kb = (gzipped / 1024).toFixed(2);
  const status = gzipped / 1024 > BUDGET_KB ? 'OVER BUDGET' : 'ok';
  if (status === 'OVER BUDGET') failed = true;
  console.log(`[size] ${file}: ${kb} KB gzipped (${status}, budget ${BUDGET_KB} KB)`);
}

if (failed) {
  console.error(`\n[size] one or more bundles exceeded the ${BUDGET_KB} KB gzipped budget.`);
  process.exit(1);
}
