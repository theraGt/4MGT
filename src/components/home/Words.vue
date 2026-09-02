<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ text: string }>()
const words = computed(() => props.text.split(' '))
</script>

<template>
  <span>
    <span
      v-for="(w, i) in words"
      :key="i"
      class="word inline-block will-change-transform"
      >{{ w }}{{ i < words.length - 1 ? ' ' : '' }}</span
    >
  </span>
</template>
