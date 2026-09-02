<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CutButton from '../CutButton.vue'
import Chars from '../home/Chars.vue'
import MistField from './MistField.vue'

gsap.registerPlugin(ScrollTrigger)

const STATS: Array<{ value: string; label: string; red: boolean }> = [
  { value: '72', label: 'HRS', red: true },
  { value: '4', label: 'RUTAS', red: true },
  { value: '100%', label: 'NATURALEZA', red: true },
  { value: 'SOLO', label: 'HOMBRES', red: false },
]

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* ===== Carga: lente + char-split + barra de datos ===== */
    const intro = gsap.timeline({ delay: 0.45, defaults: { ease: 'power4.out' } })
    intro
      .from('.xcc-hero-bg-img', { scale: 1.15, duration: 1.4, ease: 'power2.out' }, 0)
      .from('.xcc-hero-flag', { y: -120, rotation: 4, duration: 0.5 }, 0.1)
      .from('.xcc-hero-overline-inner', { xPercent: -105, duration: 0.4 }, '-=0.15')
      .from(
        '.xcc-hero-headline .char',
        { yPercent: 110, rotateX: 40, opacity: 0, duration: 1.1, stagger: 0.03 },
        '-=0.1'
      )
      .from('.xcc-hero-sub, .xcc-hero-ctas', { y: 24, opacity: 0, duration: 0.7, stagger: 0.12 }, '-=0.6')
      .from('.xcc-stat-div', { scaleY: 0, transformOrigin: 'top', duration: 0.5, stagger: 0.08 }, '-=0.4')
      .from('.xcc-stat-item', { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, '<')

    /* ===== Scroll: parallax de fondo + salida del headline ===== */
    gsap
      .timeline({
        scrollTrigger: {
          trigger: root.value,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })
      .to('.xcc-hero-bg-img', { yPercent: 15, ease: 'none' }, 0)
      .to('.xcc-hero-content', { y: -60, opacity: 0, ease: 'none' }, 0)
  }, root.value as Element)
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
})

const scrollToRoutes = () => {
  document.getElementById('rutas')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section
    ref="root"
    class="relative -mt-20 flex min-h-[90dvh] flex-col justify-end overflow-hidden"
  >
    <!-- Fondo + overlay + niebla -->
    <div class="absolute inset-0">
      <img
        src="/xcc-hero.jpg"
        alt="Línea de hombres caminando por una cresta de montaña entre nubes al amanecer"
        class="xcc-hero-bg-img h-full w-full object-cover will-change-transform"
        @load="ScrollTrigger.refresh()"
      />
      <div
        class="absolute inset-0"
        :style="{
          background:
            'linear-gradient(180deg, rgba(18,18,18,0.5), rgba(18,18,18,0.35) 50%, #121212 100%)',
        }"
      />
      <div class="absolute inset-0 opacity-70">
        <MistField />
      </div>
    </div>

    <!-- Contenido abajo-izquierda -->
    <div
      class="xcc-hero-content relative mx-auto w-full max-w-[1440px] px-6 pt-40 pb-12 md:px-12 md:pb-16"
    >
      <span
        class="xcc-hero-flag mb-6 flex h-[62px] w-12 items-center justify-center bg-brand-red clip-cut"
      >
        <span class="font-display text-2xl font-black leading-none text-white">4</span>
      </span>

      <p class="overline mb-5 overflow-hidden text-brand-red">
        <span class="xcc-hero-overline-inner inline-block">XTREME CHARACTER CHALLENGE</span>
      </p>

      <h1 class="xcc-hero-headline display-xl text-white [perspective:900px]">
        <span class="block overflow-hidden pb-1">
          <Chars text="72 HORAS." />
        </span>
        <span class="block overflow-hidden pb-1 text-transparent [-webkit-text-stroke:1.5px_#fff]">
          <Chars text="SIN EXCUSAS." />
        </span>
      </h1>

      <p class="xcc-hero-sub mt-6 max-w-xl text-base leading-[1.7] text-white/85 md:text-lg">
        Enfrenta las preguntas más importantes de la vida, experimenta la hermandad de una
        manera poderosa y regresa a casa listo para fortalecer las relaciones con las personas
        que amas.
      </p>

      <div class="xcc-hero-ctas mt-8 flex flex-wrap items-center gap-4">
        <CutButton to="/contacto" variant="primary">APARTA TU LUGAR — 14 NOV</CutButton>
        <CutButton variant="ghost" @click="scrollToRoutes">VER LAS RUTAS</CutButton>
      </div>

      <!-- Barra de datos -->
      <div class="mt-10 flex flex-wrap items-stretch border-t border-brand-line pt-6">
        <div v-for="(s, i) in STATS" :key="s.label" class="flex items-stretch">
          <span
            v-if="i > 0"
            aria-hidden="true"
            class="xcc-stat-div mx-5 w-px self-stretch bg-brand-line md:mx-7"
          />
          <p
            class="xcc-stat-item font-display font-expanded font-extrabold uppercase tracking-tight text-lg md:text-xl"
          >
            <span :class="s.red ? 'text-brand-red' : 'text-white'">{{ s.value }}</span>
            {{ ' ' }}
            <span class="text-white">{{ s.label }}</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
