<script>
  import { onMount, onDestroy } from 'svelte';
  import Blackout from 'blackout-ui';

  onMount(() => {
    Blackout.init({ radius: 200, softness: 40 });
  });

  onDestroy(() => {
    Blackout.destroy();
  });
</script>

<main>
  <h1>Blackout UI + Svelte</h1>
  <button on:click={() => Blackout.toggle()}>Toggle blackout</button>
</main>
