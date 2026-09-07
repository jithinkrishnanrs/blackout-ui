# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] — Unreleased

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
