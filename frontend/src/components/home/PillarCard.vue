<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'

defineProps<{
  n: string
  title: string
  img: string
  text: string
}>()

const cardRef = ref<HTMLDivElement | null>(null)

// Tilt 3D sutil (±4°) siguiendo el cursor
const onMove = (e: MouseEvent) => {
  const el = cardRef.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width - 0.5
  const py = (e.clientY - r.top) / r.height - 0.5
  gsap.to(el, { rotateY: px * 8, rotateX: -py * 8, duration: 0.5, ease: 'power2.out' })
}
const onLeave = () => {
  if (cardRef.value) {
    gsap.to(cardRef.value, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' })
  }
}
</script>

<template>
  <div style="perspective: 1000px">
    <div
      ref="cardRef"
      data-cursor-label="VER"
      class="pillar-card group relative overflow-hidden clip-cut-lg bg-brand-charcoal-700 will-change-transform"
      style="transform-style: preserve-3d"
      @mousemove="onMove"
      @mouseleave="onLeave"
    >
      <div class="relative aspect-[3/4] overflow-hidden">
        <img
          :src="img"
          :alt="title"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-brand-charcoal-900 via-brand-charcoal-900/30 to-transparent transition-opacity duration-500 group-hover:opacity-70"
        />
      </div>
      <span
        class="numeral text-outline absolute right-6 top-6 transition-all duration-500 group-hover:text-brand-red group-hover:[-webkit-text-stroke:0px]"
      >
        {{ n }}
      </span>
      <div class="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-8">
        <h3 class="display-l !text-[clamp(2rem,3.5vw,3.5rem)] text-white">{{ title }}</h3>
        <p
          class="translate-y-4 font-body text-base leading-[1.7] text-white/80 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
        >
          {{ text }}
        </p>
      </div>
    </div>
  </div>
</template>
