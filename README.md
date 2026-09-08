# Blackout UI

[![CI](https://github.com/jithinkrishnanrs/blackout-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/jithinkrishnanrs/blackout-ui/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/blackout-ui.svg)](https://www.npmjs.com/package/blackout-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![bundle size](https://img.shields.io/badge/gzip-~3.5KB-brightgreen)](#performance)

A tiny, framework-agnostic library that turns any webpage into a **blackout /
flashlight interface**. It doesn't touch your page's colors, CSS, or theme —
it just drops a black layer over everything and cuts a hole around the
pointer.

**Repository:** [github.com/jithinkrishnanrs/blackout-ui](https://github.com/jithinkrishnanrs/blackout-ui)

```
Your page renders normally
        │
        ▼
 Blackout UI overlay        ← position: fixed, pointer-events: none
        │
        ├── opaque black everywhere
        └── a circular hole around the cursor, revealing your page exactly
            as it already is — light mode, dark mode, whatever it is
```

- **Zero runtime dependencies.**
- **~3.5 KB gzipped** (core ESM/CJS build).
- **Framework agnostic** — vanilla JS, React, Vue, Svelte, Next.js, Nuxt,
  SvelteKit, Astro, Angular, static HTML.
- **Doesn't touch your CSS.** No dark-mode conversion, no color inversion, no
  DOM rewriting of your content.
- **SSR-safe.** Importing the package on the server is a no-op.
- Written in TypeScript, ships full type declarations.

## Install

```bash
npm install blackout-ui
```

```ts
import Blackout from 'blackout-ui';

Blackout.init();
```

That's it — the whole viewport goes black, and the cursor becomes a
flashlight.

### CDN

```html
<script src="https://unpkg.com/blackout-ui"></script>
<script>
  BlackoutUI.init();
</script>
```

(`https://cdn.jsdelivr.net/npm/blackout-ui` works the same way.) The CDN
build is a self-contained IIFE — no bundler required.

## Quick start

```ts
import Blackout from 'blackout-ui';

Blackout.init({
  radius: 180,
  softness: 35,
  darkness: 1,
  intensity: 1,
  shape: 'circle',
  touch: true,
});

Blackout.enable();
Blackout.disable();
Blackout.toggle();

Blackout.configure({ radius: 250 });

Blackout.destroy(); // fully removes the overlay and restores the page
```

## Configuration

All options are optional; every field has a documented default.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Whether the effect is active immediately. |
| `radius` | `number` | `180` | Outer radius of the flashlight, in CSS px. |
| `softness` | `number` (0–100) | `35` | How gradually the flashlight fades to black. `0` = hard edge, `100` = fades from the center. |
| `darkness` | `number` (0–1) | `1` | Opacity of the black outside the flashlight. |
| `intensity` | `number` (0–1) | `1` | How fully the page is revealed inside the flashlight. `1` = full reveal. |
| `shape` | `"circle" \| "ellipse"` | `"circle"` | Shape of the reveal area. |
| `touch` | `boolean` | `true` | Whether touch input moves the flashlight. |
| `touchBehavior` | `"follow" \| "hide" \| "persist"` | `"follow"` | What happens to the flashlight when a touch lifts off. |
| `onPointerLeave` | `"freeze" \| "center" \| "hide"` | `"freeze"` | What happens when the pointer leaves the viewport. |
| `initialPosition` | `"center" \| { x, y }` | `"center"` | Where the flashlight sits before any pointer input. |
| `cursor.hide` | `boolean` | `false` | Hide the native cursor while enabled. Fully restored on `disable()`/`destroy()`. |
| `accessibility.respectReducedMotion` | `boolean` | `true` | Reserved for future animated transitions; pointer tracking itself is never animated. |
| `zIndex` | `number` | `2147483647` | z-index of the overlay element. |

Invalid values (out-of-range numbers, unknown strings, `NaN`) are clamped or
normalized to a safe default rather than thrown — see [Error handling](#error-handling).

## API

| Method | Description |
| --- | --- |
| `init(options?)` | Mounts the overlay. **Idempotent** — calling it again just calls `configure()` with the new options instead of creating a second overlay. |
| `configure(options)` | Updates configuration in place. No DOM is recreated. |
| `enable()` / `disable()` | Turn the effect on/off without destroying the instance. |
| `toggle()` | Flips the current enabled state. |
| `destroy()` | Fully removes the overlay, listeners, and injected styles, cancels any pending frame, and restores the cursor. Safe to call `init()` again afterward. |
| `isEnabled()` / `isInitialized()` | State getters. |
| `setPosition(x, y)` | Manually move the flashlight to a viewport coordinate. |
| `setRadius(n)` / `setSoftness(n)` / `setDarkness(n)` | Shorthand for `configure({ ... })`. |
| `getOptions()` | Returns the current fully-resolved configuration. |
| `on(event, fn)` / `off(event, fn)` | Subscribe to `"enable"`, `"disable"`, `"configure"`, `"destroy"`. |

```ts
import { createBlackout } from 'blackout-ui';

// The default export is a singleton, which covers most apps. If you need
// more than one independent instance, create your own:
const secondary = createBlackout();
secondary.init({ radius: 80 });
```

## Touch

Pointer Events unify mouse, pen, and touch input, so touch support requires
no extra listeners. Scrolling is never blocked — the library does not set
`touch-action: none` and never calls `preventDefault()`.

## Accessibility

- The overlay is `aria-hidden="true"` and contains no text or focusable
  elements — it never enters the accessibility tree and never traps focus.
- `pointer-events: none` by default, so hover states, links, buttons, form
  controls, drag-and-drop, text selection, and the browser's native context
  menu / find-in-page all keep working exactly as they would without the
  library.
- Keyboard navigation is completely unaffected.
- The library never inspects or requires `prefers-color-scheme` and never
  sets `<meta name="color-scheme">` — your page's own theme handling is
  untouched.
- `disable()` (or never calling `enable()`) always leaves the page fully
  usable; the effect never makes a page permanently inaccessible.

Because the underlying page is never modified, its own contrast and
semantics are exactly what they were before Blackout UI was added — make
sure *that* page is accessible; Blackout UI has nothing to add or take away
there.

## SSR

```ts
import Blackout from 'blackout-ui'; // safe on the server — this never throws
```

Every method checks for a browser environment and is a documented no-op on
the server. Call `init()` from a client-only lifecycle hook (`useEffect`,
`onMounted`, `onMount`, a `'use client'` component, etc.) — see
[Framework integration](#framework-integration).

## Dynamic theme switching

Blackout UI never inspects your theme. When your page switches from light to
dark mode (or back), the flashlight simply continues revealing whatever is
currently rendered — no re-detection, no re-render, no special API needed.

## Framework integration

<details>
<summary>React</summary>

```jsx
import { useEffect } from 'react';
import Blackout from 'blackout-ui';

useEffect(() => {
  Blackout.init();
  return () => Blackout.destroy();
}, []);
```

Full example: [`examples/react`](./examples/react).
</details>

<details>
<summary>Next.js</summary>

Call `init()`/`destroy()` from a `'use client'` component's `useEffect`, and
mount it in your root layout. Full example:
[`examples/nextjs`](./examples/nextjs).
</details>

<details>
<summary>Vue / Nuxt</summary>

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import Blackout from 'blackout-ui';

onMounted(() => Blackout.init());
onUnmounted(() => Blackout.destroy());
</script>
```

Full example: [`examples/vue`](./examples/vue).
</details>

<details>
<summary>Svelte / SvelteKit</summary>

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import Blackout from 'blackout-ui';

  onMount(() => Blackout.init());
  onDestroy(() => Blackout.destroy());
</script>
```

Full example: [`examples/svelte`](./examples/svelte).
</details>

<details>
<summary>Vanilla JS / static HTML</summary>

```html
<script type="module">
  import Blackout from 'blackout-ui';
  Blackout.init();
</script>
```

Full example: [`examples/vanilla`](./examples/vanilla).
</details>

## Browser support

Current Chrome, Edge, Firefox, Safari (desktop and iOS), and Android Chrome.
The library relies on the Pointer Events API, `requestAnimationFrame`, CSS
custom properties, and CSS radial gradients — all broadly supported in
evergreen browsers. No polyfills are bundled.

## Performance

- Pointer events are coalesced into at most one `requestAnimationFrame`
  callback per frame; multiple `pointermove` events between frames never
  produce more than one DOM write.
- The reveal effect is a single CSS `background` (a radial gradient) on one
  element — no canvas, no WebGL, no per-frame layout thrashing.
- No `setInterval` and no permanent animation loop: work only happens when
  the pointer actually moves.
- Listeners are passive and never call `preventDefault()`.

## Limitations

- The overlay covers the viewport, including any same-origin or
  cross-origin `<iframe>` content visually — it cannot (and does not try to)
  reach *into* a cross-origin iframe's own document.
- Blackout UI operates within a single document. It does not coordinate
  across browser tabs, windows, or top-level navigations.
- It does not attempt to outrank browser-native UI (address bar, permission
  prompts, devtools, extensions) — it only affects the page's own viewport.
- Printing is disabled for the overlay (`@media print` hides it), so printed
  output is unaffected — but this also means there's no "print the
  flashlight" mode.

## Error handling

Out-of-range or malformed options (a negative radius, `darkness: 5`,
`shape: "triangle"`, `NaN`) are clamped/normalized to the nearest valid
value rather than thrown. In non-production builds
(`process.env.NODE_ENV !== 'production'`), a `console.warn` explains what
was adjusted; these warnings are silent in production. Calling any method
before `init()` (other than `init()` itself) or after `destroy()` is a safe
no-op.

## Local development

```bash
git clone https://github.com/jithinkrishnanrs/blackout-ui.git
cd blackout-ui
npm install
npm run dev        # tsup --watch
```

```bash
npm run build       # produce dist/ (ESM, CJS, .d.ts, IIFE global build)
npm test             # vitest, single run
npm run test:watch   # vitest, watch mode
npm run test:e2e     # Playwright (requires `npx playwright install` once)
npm run typecheck
npm run lint
npm run format
npm run check        # typecheck + lint + test + build + bundle-size check
```

Run the demo locally (builds the library and serves `demo/` on a real HTTP
server, using the actual `dist/` output — not a re-implementation):

```bash
npm run demo
```

### Testing the package inside another project

From a tarball, without publishing:

```bash
npm run build
npm pack                       # produces blackout-ui-<version>.tgz
cd ../some-other-project
npm install ../blackout-ui/blackout-ui-<version>.tgz
```

Or with a local link:

```bash
npm link                       # inside blackout-ui/
cd ../some-other-project
npm link blackout-ui
```

## Publishing

```bash
npm login
npm run check                  # typecheck, lint, test, build, size budget
npm version patch|minor|major  # patch: fix, minor: feature, major: breaking
npm publish
```

Verify the published package from a clean project:

```bash
mkdir /tmp/verify && cd /tmp/verify
npm init -y
npm install blackout-ui
node -e "console.log(require('blackout-ui'))"
```

Document breaking changes in [`CHANGELOG.md`](./CHANGELOG.md) and follow
[Semantic Versioning](https://semver.org/).

## Deploying the demo

`demo/` is a static site with one build step (`npm run demo` locally copies
`dist/` into `demo/vendor/`). Any static host works:

- **Vercel / Netlify / Cloudflare Pages**: build command
  `npm run build && node scripts/prepare-demo.mjs`, output directory `demo`.
- **GitHub Pages**: run the same build command in CI, then publish the
  `demo/` directory.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Security

See [`SECURITY.md`](./SECURITY.md). Blackout UI makes no network requests,
uses no `eval`, and adds no analytics or tracking of any kind.

## License

[MIT](./LICENSE)
