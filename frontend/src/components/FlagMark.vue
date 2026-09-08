<script setup lang="ts">
import { computed, useAttrs } from 'vue'

/**
 * Mini bandera roja 4M con la esquina inferior derecha cortada (--cut).
 * Marca de presencia del Brand Bible: marcadores, bullets, nodos de divisores.
 * Equivalente al `className` del React: si se pasa `class`, REEMPLAZA el
 * tamaño por defecto (h-4 w-3), igual que hacía cn()/twMerge.
 */
defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{ withFour?: boolean }>(), { withFour: false })

const attrs = useAttrs()
const sizeCls = computed(() => (attrs.class ? String(attrs.class) : 'h-4 w-3'))
</script>

<template>
  <span
    aria-hidden="true"
    :class="['inline-flex shrink-0 items-center justify-center bg-brand-red clip-cut', sizeCls]"
  >
    <span
      v-if="withFour"
      class="font-display font-black text-white text-[0.55em] leading-none select-none"
    >
      4
    </span>
  </span>
</template>
