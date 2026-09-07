<script setup>
import { onMounted, onUnmounted } from 'vue';
import Blackout from 'blackout-ui';

onMounted(() => {
  Blackout.init({ radius: 200, softness: 40 });
});

onUnmounted(() => {
  Blackout.destroy();
});
</script>

<template>
  <main>
    <h1>Blackout UI + Vue</h1>
    <button @click="Blackout.toggle()">Toggle blackout</button>
  </main>
</template>
