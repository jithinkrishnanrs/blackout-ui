# Contributing

Thanks for considering a contribution to Blackout UI.

## Getting set up

```bash
git clone https://github.com/blackout-ui/blackout-ui.git
cd blackout-ui
npm install
npm run dev
```

## Before opening a PR

```bash
npm run check
```

This runs, in order: typecheck, lint, unit tests, build, and the bundle-size
budget check. All must pass.

If your change touches interaction behavior (pointer handling, overlay
mounting, accessibility), please also run:

```bash
npx playwright install   # once
npm run test:e2e
```

## Design principles to keep in mind

- **Never modify the host page's CSS, colors, or DOM content.** The overlay
  is the only thing this library adds.
- **Zero runtime dependencies.** Don't add one for something a few lines of
  code can do.
- **Keep the default overlay `pointer-events: none`.** Any feature that
  needs to intercept input must be explicitly opt-in.
- **Small, focused functions and files** over clever abstractions.
- Favor the simplest, smallest, most broadly browser-compatible
  implementation when more than one approach is reasonable.

## Commit / PR conventions

- Keep PRs focused on one change.
- Add or update tests for behavior changes.
- Update `README.md` and `CHANGELOG.md` when the public API changes.

## Reporting bugs

Please include: browser + version, a minimal reproduction (a CodeSandbox,
StackBlitz, or a few lines of HTML is ideal), and the `BlackoutOptions` you
passed to `init()`.
