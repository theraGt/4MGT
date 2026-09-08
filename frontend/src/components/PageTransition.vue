<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'

/**
 * Transición de página: overlay rojo con forma de bandera (--cut) que
 * barre la pantalla al navegar (0.6s, power3.inOut) — la bandera "marca presencia".
 * En la carga inicial actúa como reveal de entrada.
 */
const route = useRoute()
const overlayRef = ref<HTMLDivElement | null>(null)

function sweep() {
  const el = overlayRef.value
  if (!el) return
  gsap.fromTo(
    el,
    { x: '0%' },
    { x: '102%', duration: 0.6, ease: 'power3.inOut', overwrite: true }
  )
}

onMounted(sweep)
watch(() => route.path, sweep)
</script>

<template>
  <div
    ref="overlayRef"
    aria-hidden="true"
    class="fixed inset-0 z-[95] pointer-events-none bg-brand-red clip-cut-lg"
    style="transform: translateX(0%)"
  />
</template>
