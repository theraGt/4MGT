<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import FlagMark from './FlagMark.vue'

const PHRASES: Array<{ text: string; red?: boolean }> = [
  { text: 'BAND OF BROTHERS' },
  { text: 'ORDINARY PEOPLE · EXTRAORDINARY LIVES', red: true },
  { text: 'INSPIRATION. JUSTICE.' },
  { text: '72 HORAS', red: true },
  { text: '4M GUATEMALA' },
]

/**
 * Cinta infinita con frases del movimiento separadas por mini-banderas.
 * La velocidad base es 30s/loop y acelera levemente con la velocidad de scroll.
 */
const trackRef = ref<HTMLDivElement | null>(null)
let raf = 0

onMounted(() => {
  const track = trackRef.value
  if (!track) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  let x = 0
  let vel = 0
  let lastY = window.scrollY

  const step = () => {
    const y = window.scrollY
    const dy = Math.abs(y - lastY)
    lastY = y
    // lerp de vuelta a 1x
    vel += (Math.min(dy / 40, 2) - vel) * 0.06
    const half = track.scrollWidth / 2
    if (half > 0) {
      x -= (half / (30 * 60)) * (1 + vel) // 30s por loop a 60fps
      if (-x >= half) x += half
      track.style.transform = `translate3d(${x}px,0,0)`
    }
    raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
})

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <div class="overflow-hidden border-y border-brand-line py-6 bg-brand-charcoal-900">
    <div ref="trackRef" class="flex w-max gap-8 md:gap-12 will-change-transform">
      <div v-for="copy in 2" :key="copy" class="flex gap-8 md:gap-12 shrink-0" :aria-hidden="copy === 2">
        <span
          v-for="(p, i) in PHRASES"
          :key="i"
          class="flex items-center gap-8 md:gap-12 shrink-0"
        >
          <span
            :class="[
              'font-display font-expanded font-extrabold uppercase tracking-tight text-2xl md:text-4xl',
              p.red ? 'text-brand-red' : 'text-white',
            ]"
          >
            {{ p.text }}
          </span>
          <FlagMark class="h-5 w-4" />
        </span>
      </div>
    </div>
  </div>
</template>
