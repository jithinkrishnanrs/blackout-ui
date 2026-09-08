# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] — 2026-09-07

### Added

- Homepage/demo overhaul: Blackout now starts **off** by default on the
  demo site, with a large "Turn On Blackout" CTA as the primary
  interaction. The site's live playground, configuration reference, API
  reference, framework examples, accessibility notes, edge-case table, and
  FAQ are all generated from — and kept honest against — the actual public
  API in `src/core/types.ts`.
- `scripts/prepare-demo.mjs` now also emits `demo/vendor/meta.json`
  containing the real, freshly-measured gzip size of each build output and
  the current package version, so the homepage never displays a stale or
  hand-typed number.
- Project links (README, `package.json`, `LICENSE`, `CONTRIBUTING.md`,
  `SECURITY.md`, demo site) now point at the public repository:
  [github.com/jithinkrishnanrs/blackout-ui](https://github.com/jithinkrishnanrs/blackout-ui).
- CI/npm/license badges added to the README.

### Changed

- No changes to the public API or core library behavior in this release —
  see [0.1.0](#010--2026-09-06) for the full API surface, which is
  unchanged.

## [0.1.0] — 2026-09-06

### Added

- Initial release: `Blackout` singleton with `init`, `configure`, `enable`,
  `disable`, `toggle`, `destroy`, `isEnabled`, `isInitialized`,
  `setPosition`, `setRadius`, `setSoftness`, `setDarkness`, `getOptions`,
  `on`/`off` event API.
- `createBlackout()` for independent, non-singleton instances.
- Configurable `radius`, `softness`, `darkness`, `intensity`, `shape`
  (`circle`/`ellipse`), `touch`, `touchBehavior`, `onPointerLeave`,
  `initialPosition`, `cursor.hide`, `accessibility.respectReducedMotion`,
  `zIndex`.
- ESM, CommonJS, and IIFE/CDN builds, with full TypeScript declarations.
- Zero runtime dependencies; core build ~3.5 KB gzipped.
- SSR-safe imports (Next.js, Nuxt, SvelteKit, Astro).
- Unit test suite (Vitest) and browser test suite (Playwright).
- Demo site, and examples for vanilla JS, React, Next.js, Vue, and Svelte.
