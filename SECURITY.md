# Security Policy

## Reporting a vulnerability

Please report security issues privately via GitHub's "Report a vulnerability"
feature on the [blackout-ui repository](https://github.com/jithinkrishnanrs/blackout-ui/security/advisories/new),
or by opening a private conversation with the maintainer
([@jithinkrishnanrs](https://github.com/jithinkrishnanrs)). Do not open a
public issue for a suspected vulnerability.

Include a description of the issue, steps to reproduce, and the affected
version if known. We aim to acknowledge reports within a few business days.

## Scope and guarantees

Blackout UI is a client-side, purely visual/interaction library. By design:

- It makes **no network requests** at runtime.
- It has **zero runtime dependencies**.
- It does not use `eval`, `new Function`, or dynamic script injection.
- The only DOM mutation it performs is adding/removing its own overlay
  `<div>` and a single static `<style>` element — it never uses `innerHTML`
  with dynamic or user-supplied content.
- It does not read, store, or transmit pointer coordinates anywhere outside
  the current page's runtime memory.

## Content Security Policy (CSP)

The library injects one `<style>` element containing static, package-authored
CSS (not derived from user input) to scope its overlay styles. Under a strict
CSP that blocks inline `<style>` elements (e.g. a `style-src` without
`'unsafe-inline'` or a nonce), this injection will be blocked by the browser.
If you need to support such a CSP, use the `blackout-ui/css` export as a
static stylesheet instead:

```html
<link rel="stylesheet" href="node_modules/blackout-ui/dist/blackout.css" />
```

and note that a future version may make runtime style injection fully
opt-out for this reason.

## Supported versions

Only the latest published minor version receives security fixes.
