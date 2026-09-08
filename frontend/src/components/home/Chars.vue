<script setup lang="ts">
defineProps<{ text: string }>()
const render = (t: string) => t.split('').map((c) => (c === ' ' ? ' ' : c))
</script>

<template>
  <span aria-hidden="true">
    <span
      v-for="(c, i) in render(text)"
      :key="i"
      class="char inline-block will-change-transform"
      >{{ c }}</span
    >
  </span>
</template>
