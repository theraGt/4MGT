<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'

/**
 * Cursor personalizado: punto rojo 8px + anillo blanco 36px (mix-blend-difference).
 * Escala x2.2 y muestra label sobre elementos con [data-cursor-label].
 * Desactivado en dispositivos touch.
 */
const enabled = ref(false)
const label = ref<string | null>(null)
const dotRef = ref<HTMLDivElement | null>(null)
const ringRef = ref<HTMLDivElement | null>(null)

let move: ((e: MouseEvent) => void) | null = null
let over: ((e: MouseEvent) => void) | null = null

onMounted(() => {
  if (window.matchMedia('(pointer: coarse)').matches) return
  enabled.value = true

  const dot = dotRef.value
  const ring = ringRef.value
  if (!dot || !ring) return

  // xPercent/yPercent hacen el centrado (-50%); quickTo anima x/y en px sin pisarlo
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 })
  // Punto: sigue directo; anillo: spring suave (equiv. stiffness 260 / damping 26)
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' })
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' })
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' })
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })

  move = (e: MouseEvent) => {
    dotX(e.clientX)
    dotY(e.clientY)
    ringX(e.clientX)
    ringY(e.clientY)
  }
  over = (e: MouseEvent) => {
    const t = (e.target as HTMLElement | null)?.closest?.('[data-cursor-label]')
    label.value = t ? t.getAttribute('data-cursor-label') : null
  }
  window.addEventListener('mousemove', move, { passive: true })
  window.addEventListener('mouseover', over, { passive: true })
})

// Escala del anillo con GSAP (no CSS transition: el transform lo escribe GSAP cada frame)
watch(label, (v) => {
  const ring = ringRef.value
  if (!ring) return
  gsap.to(ring, { scale: v ? 2.2 : 1, duration: 0.35, ease: 'back.out(2)' })
})

onUnmounted(() => {
  if (move) window.removeEventListener('mousemove', move)
  if (over) window.removeEventListener('mouseover', over)
})
</script>

<template>
  <template v-if="enabled">
    <!-- Punto rojo -->
    <div
      ref="dotRef"
      aria-hidden="true"
      class="fixed top-0 left-0 z-[100] pointer-events-none h-2 w-2 rounded-full bg-brand-red"
    />
    <!-- Anillo con blend difference -->
    <div
      ref="ringRef"
      aria-hidden="true"
      class="fixed top-0 left-0 z-[100] pointer-events-none flex items-center justify-center h-9 w-9 rounded-full border border-white mix-blend-difference"
    >
      <span
        v-if="label"
        class="font-display text-[4px] font-bold uppercase tracking-[0.2em] text-white"
      >
        {{ label }}
      </span>
    </div>
  </template>
</template>
