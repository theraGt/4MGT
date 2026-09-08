<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { chevronBack, chevronForward } from 'ionicons/icons'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin)

const TESTIMONIALS = [
  {
    quote: 'Llegué buscando aventura y encontré propósito. El XCC me devolvió a mi familia.',
    name: 'Carlos M., 38',
    meta: 'XCC Volcán 2024',
  },
  {
    quote:
      'Pensé que era un campamento más. A la hora 36 estaba llorando frente al fuego con hombres que acababa de conocer.',
    name: 'Andrés G., 45',
    meta: 'XCC Bosque 2023',
  },
  {
    quote: 'Regresé a casa y abracé a mi padre por primera vez en diez años.',
    name: 'Luis P., 29',
    meta: 'XCC Río 2024',
  },
]

/**
 * Slider manual de testimonios (GSAP Draggable + Inertia con snap por slide).
 * Micro-interacción de UI; los reveals de entrada usan ScrollTrigger.
 */
const n = TESTIMONIALS.length
const root = ref<HTMLElement | null>(null)
const viewportRef = ref<HTMLDivElement | null>(null)
const trackRef = ref<HTMLDivElement | null>(null)
const index = ref(0)
const width = ref(0)

let drag: Draggable | null = null
let ctx: gsap.Context | null = null

const goTo = (i: number) => {
  index.value = Math.max(0, Math.min(n - 1, i))
  if (trackRef.value) {
    gsap.to(trackRef.value, {
      x: -index.value * width.value,
      duration: 0.7,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }
}

const measure = () => {
  if (!viewportRef.value || !trackRef.value) return
  width.value = viewportRef.value.offsetWidth
  if (drag) {
    drag.applyBounds({ minX: -(n - 1) * width.value, maxX: 0 })
  }
  gsap.set(trackRef.value, { x: -index.value * width.value })
}

onMounted(() => {
  measure()

  if (trackRef.value) {
    const [d] = Draggable.create(trackRef.value, {
      type: 'x',
      bounds: { minX: -(n - 1) * width.value, maxX: 0 },
      edgeResistance: 0.92, // ≈ dragElastic 0.08 de framer-motion
      inertia: true,
      snap: {
        x: (value: number) => Math.round(value / width.value) * width.value,
      },
      onDragEnd() {
        // endX = posición final prevista (tras inercia + snap)
        index.value = Math.max(0, Math.min(n - 1, Math.round(-this.endX / width.value)))
      },
    })
    drag = d
  }

  window.addEventListener('resize', measure)

  ctx = gsap.context(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* Slides entran con x:80, opacity 0→1 stagger; la comilla rota -10°→0 */
    gsap.utils.toArray<HTMLElement>('.t-slide').forEach((slide, i) => {
      gsap.from(slide, {
        x: 80,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: slide, start: 'top 85%', once: true },
      })
      const mark = slide.querySelector('.t-quote-mark')
      if (mark) {
        gsap.from(mark, {
          rotation: -10,
          opacity: 0,
          duration: 0.7,
          delay: 0.2 + i * 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: slide, start: 'top 85%', once: true },
        })
      }
    })
  }, root.value as Element)
})

onUnmounted(() => {
  drag?.kill()
  drag = null
  window.removeEventListener('resize', measure)
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <section ref="root" class="overflow-hidden py-24 md:py-36">
    <div class="mx-auto max-w-[1440px] px-6 md:px-12">
      <div class="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p class="overline mb-5 text-brand-red">VOCES DEL FUEGO</p>
          <h2 class="h2-display text-white">LOS QUE YA VOLVIERON.</h2>
        </div>
        <div class="hidden items-center gap-3 md:flex">
          <button
            type="button"
            :disabled="index === 0"
            aria-label="Testimonio anterior"
            class="flex h-12 w-12 items-center justify-center border border-brand-line text-white transition-colors hover:border-brand-red hover:text-brand-red disabled:opacity-30 disabled:hover:border-brand-line disabled:hover:text-white"
            @click="goTo(index - 1)"
          >
            <ion-icon :icon="chevronBack" class="text-xl" />
          </button>
          <button
            type="button"
            :disabled="index === n - 1"
            aria-label="Testimonio siguiente"
            class="flex h-12 w-12 items-center justify-center border border-brand-line text-white transition-colors hover:border-brand-red hover:text-brand-red disabled:opacity-30 disabled:hover:border-brand-line disabled:hover:text-white"
            @click="goTo(index + 1)"
          >
            <ion-icon :icon="chevronForward" class="text-xl" />
          </button>
        </div>
      </div>
    </div>

    <!-- Viewport del slider -->
    <div ref="viewportRef" class="mx-auto max-w-[1440px] px-6 md:px-12">
      <div class="cursor-grab active:cursor-grabbing" data-cursor-label="ARRASTRA">
        <div ref="trackRef" class="flex will-change-transform">
          <div
            v-for="t in TESTIMONIALS"
            :key="t.name"
            class="w-full shrink-0 pr-6 md:pr-16"
            :style="{ width: width ? `${width}px` : '100%' }"
          >
            <figure class="t-slide relative border border-brand-line bg-brand-charcoal p-8 md:p-14">
              <span
                aria-hidden="true"
                class="t-quote-mark pointer-events-none absolute -top-10 left-4 select-none font-display text-[10rem] font-black leading-none text-brand-red md:-top-14 md:left-8"
                >“</span
              >
              <blockquote
                class="relative mt-16 max-w-3xl font-display text-xl font-bold leading-snug text-white md:mt-20 md:text-[1.75rem]"
              >
                {{ t.quote }}
              </blockquote>
              <figcaption class="overline mt-8 text-brand-muted">
                {{ t.name }} · {{ t.meta }}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      <!-- Indicadores -->
      <div class="mt-8 flex items-center gap-3">
        <button
          v-for="(t, i) in TESTIMONIALS"
          :key="t.name"
          type="button"
          :aria-label="`Ir al testimonio ${i + 1}`"
          class="h-[3px] transition-all duration-300"
          :class="i === index ? 'w-12 bg-brand-red' : 'w-6 bg-brand-line hover:bg-brand-muted'"
          @click="goTo(i)"
        />
        <span
          class="ml-3 font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-muted"
        >
          {{ String(index + 1).padStart(2, '0') }} / {{ String(n).padStart(2, '0') }}
        </span>
      </div>
    </div>
  </section>
</template>
