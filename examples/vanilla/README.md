# Vanilla JS example

```bash
npm install blackout-ui
```

Then open `index.html` with any static file server (it imports `blackout-ui` as
a bare specifier, so it needs either an import map or a bundler in a real
project — this example assumes a bundler resolves the `blackout-ui` import).

For a zero-build version, use the CDN build directly:

```html
<script src="https://unpkg.com/blackout-ui"></script>
<script>
  BlackoutUI.init();
</script>
```
