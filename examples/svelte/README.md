# Svelte / SvelteKit example

```bash
npm install blackout-ui
```

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import Blackout from 'blackout-ui';

  onMount(() => Blackout.init());
  onDestroy(() => Blackout.destroy());
</script>
```

In SvelteKit, `onMount` only ever runs in the browser, so this is safe in a
page that's also server-rendered. If you call `Blackout` methods from
top-level script instead of `onMount`, guard with
`import { browser } from '$app/environment'`.
