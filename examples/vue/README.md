# Vue example

```bash
npm install blackout-ui
```

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import Blackout from 'blackout-ui';

onMounted(() => Blackout.init());
onUnmounted(() => Blackout.destroy());
</script>
```

Works identically in Nuxt — just make sure `onMounted` (not top-level script)
is where `init()` is called, since Nuxt components render on the server first.
