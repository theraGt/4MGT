<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { IonPage } from '@ionic/vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CutButton from '../components/CutButton.vue'
import Chars from '../components/home/Chars.vue'
import Words from '../components/home/Words.vue'

gsap.registerPlugin(ScrollTrigger)

/* ---------- data ---------- */

const TIMELINE = [
  { year: '2008', title: 'LAS ARDENAS', text: 'Primer XCC: 80 hombres, un bosque belga, una chispa.' },
  { year: '2012', title: 'CRUZANDO FRONTERAS', text: 'El movimiento llega a nuevos países de Europa y África.' },
  { year: '2016', title: 'AMÉRICA', text: '4M desembarca en el continente. Guatemala enciende su propia bandera.' },
  { year: 'HOY', title: '20+ PAÍSES', text: 'Miles de hombres. Un mismo fuego. Una misma bandera roja.' },
]

/* Países con presencia 4M — posiciones en % sobre world-map.svg (proyección equirectangular 1600×800) */
const MAP_DOTS: Array<{ x: number; y: number; label: string }> = [
  { x: 51.5, y: 21.0, label: 'Países Bajos' },
  { x: 51.3, y: 21.9, label: 'Bélgica' },
  { x: 52.9, y: 21.6, label: 'Alemania' },
  { x: 49.4, y: 20.0, label: 'Reino Unido' },
  { x: 49.0, y: 27.7, label: 'España' },
  { x: 52.3, y: 24.0, label: 'Suiza' },
  { x: 53.6, y: 26.2, label: 'Italia' },
  { x: 56.7, y: 66.1, label: 'Sudáfrica' },
  { x: 60.5, y: 49.7, label: 'Kenia' },
  { x: 22.8, y: 28.3, label: 'EE. UU.' },
  { x: 20.6, y: 18.9, label: 'Canadá' },
  { x: 21.5, y: 36.9, label: 'México' },
  { x: 34.7, y: 55.6, label: 'Brasil' },
  { x: 30.6, y: 68.3, label: 'Chile' },
  { x: 87.2, y: 63.9, label: 'Australia' },
]
const GT_DOT = { x: 24.9, y: 41.3 }

const MAP_STATS = [
  { n: '20+', label: 'PAÍSES' },
  { n: '5', label: 'CONTINENTES' },
  { n: '1', label: 'BANDERA' },
]

const VALORES = [
  { n: 'I', title: 'HERMANDAD', text: 'Ningún hombre pelea solo. Somos una band of brothers.' },
  { n: 'II', title: 'VALENTÍA', text: 'Enfrentamos a nuestros gigantes. No los evitamos.' },
  { n: 'III', title: 'FE', text: 'Vivimos para el Rey. Nuestra brújula es más grande que nosotros.' },
  { n: 'IV', title: 'JUSTICIA', text: 'Llevamos olas de compasión a nuestras comunidades.' },
]

const LIDERES = [
  { nombre: 'Carlos Méndez', rol: 'Dirección Nacional' },
  { nombre: 'Andrés Barrios', rol: 'Coordinación XCC' },
  { nombre: 'Luis Soto', rol: 'Comunidad & Bonfire' },
]

const pingDelay = (i: number) => `${((i * 0.37) % 2).toFixed(2)}s`

/* ---------- animación ---------- */

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* ===== HERO: secuencia de carga ===== */
    gsap.fromTo(
      '.qs-hero-img',
      { scale: 1.1 },
      { scale: 1, duration: 1.2, ease: 'power2.out' }
    )
    gsap.fromTo(
      '.qs-hero-flag',
      { y: -70, opacity: 0, rotate: -6 },
      { y: 0, opacity: 1, rotate: 0, duration: 0.7, ease: 'back.out(2.2)', delay: 0.15 }
    )
    gsap.fromTo(
      '.qs-hero .char',
      { yPercent: 110 },
      { yPercent: 0, duration: 0.9, stagger: 0.03, ease: 'power3.out', delay: 0.25 }
    )
    gsap.fromTo(
      '.qs-hero-sub',
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.9 }
    )
    // Parallax del hero
    gsap.to('.qs-hero-img', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '.qs-hero', start: 'top top', end: 'bottom top', scrub: true },
    })

    /* ===== ORIGEN ===== */
    gsap.fromTo(
      '.qs-henk-img',
      { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' },
      {
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%)',
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: '.qs-origen', start: 'top 70%' },
      }
    )
    gsap.fromTo(
      '.qs-henk-img img',
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: '.qs-origen', start: 'top bottom', end: 'bottom top', scrub: true },
      }
    )
    gsap.fromTo(
      '.qs-origen-copy .rvl',
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.qs-origen-copy', start: 'top 78%' },
      }
    )
    // Pull-quote: barra roja crece primero, luego entra el texto
    const quoteTl = gsap.timeline({
      scrollTrigger: { trigger: '.qs-quote', start: 'top 80%' },
    })
    quoteTl
      .fromTo('.qs-quote-bar', { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power2.out', transformOrigin: 'top' })
      .fromTo('.qs-quote-text', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.1')

    /* ===== TIMELINE (pin con scrub en desktop / vertical en móvil) ===== */
    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.qs-timeline-d',
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: 0.6,
        },
      })
      tl.fromTo('.qs-tl-line-red', { scaleX: 0 }, { scaleX: 1, duration: 3, ease: 'none' }, 0)
      TIMELINE.forEach((_, i) => {
        const at = i * 0.72 + 0.05
        tl.fromTo(
          `.qs-tl-node-${i}`,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.3, ease: 'back.out(2.5)', transformOrigin: 'bottom' },
          at
        )
        tl.fromTo(
          `.qs-tl-item-${i}`,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' },
          at + 0.08
        )
        tl.to(
          `.qs-tl-year-${i}`,
          { textShadow: '0 0 24px rgba(205,23,30,0.85)', duration: 0.25 },
          at + 0.1
        )
      })
    })

    mm.add('(max-width: 767px)', () => {
      gsap.fromTo(
        '.qs-tl-m-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: { trigger: '.qs-timeline-m', start: 'top 70%', end: 'bottom 60%', scrub: true },
        }
      )
      TIMELINE.forEach((_, i) => {
        const itemTl = gsap.timeline({
          scrollTrigger: { trigger: `.qs-tlm-item-${i}`, start: 'top 82%' },
        })
        itemTl
          .fromTo(
            `.qs-tlm-node-${i}`,
            { scaleY: 0 },
            { scaleY: 1, duration: 0.45, ease: 'back.out(2.5)', transformOrigin: 'bottom' }
          )
          .fromTo(
            `.qs-tlm-item-${i}`,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
            '-=0.15'
          )
      })
    })

    /* ===== MAPA MUNDIAL ===== */
    gsap.fromTo(
      '.qs-map',
      { opacity: 0, scale: 0.96 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.qs-presencia', start: 'top 75%' },
      }
    )
    gsap.to('.qs-map', {
      y: 20,
      ease: 'none',
      scrollTrigger: { trigger: '.qs-presencia', start: 'top bottom', end: 'bottom top', scrub: true },
    })
    gsap.fromTo(
      '.qs-dot',
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(3)',
        stagger: { each: 0.09, from: 'random' },
        scrollTrigger: { trigger: '.qs-presencia', start: 'top 70%' },
      }
    )
    gsap.fromTo(
      '.qs-dot-gt',
      { scale: 0 },
      {
        scale: 1,
        duration: 0.6,
        ease: 'back.out(2)',
        delay: 1.4,
        scrollTrigger: { trigger: '.qs-presencia', start: 'top 70%' },
      }
    )
    gsap.fromTo(
      '.qs-map-stats > *',
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.qs-map-stats', start: 'top 88%' },
      }
    )

    /* ===== VALORES ===== */
    gsap.fromTo(
      '.qs-valor',
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.qs-valores-grid', start: 'top 80%' },
      }
    )
    gsap.fromTo(
      '.qs-valor-num',
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0% 0 0 0)',
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.qs-valores-grid', start: 'top 80%' },
      }
    )

    /* ===== 4M EN GUATEMALA ===== */
    gsap.fromTo(
      '.qs-gt-copy .word',
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.02,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.qs-gt', start: 'top 75%' },
      }
    )
    gsap.fromTo(
      '.qs-gt-card',
      { x: 60, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.qs-gt', start: 'top 70%' },
      }
    )
    gsap.fromTo(
      '.qs-gt-row',
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.qs-gt-card', start: 'top 80%' },
      }
    )
    gsap.fromTo(
      '.qs-gt-avatar',
      { scale: 0 },
      {
        scale: 1,
        duration: 0.55,
        stagger: 0.12,
        ease: 'back.out(2.5)',
        scrollTrigger: { trigger: '.qs-gt-card', start: 'top 80%' },
      }
    )

    /* ===== CTA FINAL ===== */
    gsap.to('.qs-cta-flag', {
      yPercent: -14,
      ease: 'none',
      scrollTrigger: { trigger: '.qs-cta', start: 'top bottom', end: 'bottom top', scrub: true },
    })
    const ctaTl = gsap.timeline({
      scrollTrigger: { trigger: '.qs-cta', start: 'top 75%' },
    })
    ctaTl
      .fromTo('.qs-cta .word', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power3.out' })
      .fromTo('.qs-cta-btns > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, '-=0.3')
  }, root.value as Element)
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <ion-page>
    <div ref="root">
      <!-- ============ HERO INTERIOR ============ -->
      <section class="qs-hero relative -mt-20 flex min-h-[70dvh] items-end overflow-hidden">
        <div class="qs-hero-img absolute inset-0 will-change-transform">
          <img
            src="/story-holland.jpg"
            alt="Las Ardenas en otoño, origen del movimiento 4M"
            class="h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-black/65" />
          <div class="grain-overlay absolute inset-0 opacity-60" />
        </div>

        <div class="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-20 pt-32 md:px-12">
          <span class="qs-hero-flag mb-8 inline-block h-[62px] w-12 bg-brand-red clip-cut" aria-hidden="true" />
          <p class="overline mb-4 text-brand-red">QUIÉNES SOMOS</p>
          <h1 class="display-xl text-white">
            <span class="block overflow-hidden pb-1">
              <Chars text="UN MOVIMIENTO" />
            </span>
            <span class="block overflow-hidden pb-2">
              <span class="text-outline"><Chars text="MUNDIAL DE HOMBRES." /></span>
            </span>
          </h1>
          <p class="qs-hero-sub mt-6 max-w-xl text-lg leading-relaxed text-white/85">
            Una banda de hermanos. Gente ordinaria viviendo vidas extraordinarias.
          </p>
        </div>
      </section>

      <!-- ============ EL ORIGEN ============ -->
      <section class="qs-origen py-24 md:py-36">
        <div class="mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-6 md:grid-cols-12 md:gap-8 md:px-12">
          <!-- Retrato sticky -->
          <div class="md:col-span-6">
            <div class="md:sticky md:top-32">
              <div class="relative">
                <span
                  class="absolute left-8 top-0 z-10 h-14 w-10 -translate-y-4 bg-brand-red clip-cut"
                  aria-hidden="true"
                />
                <div class="qs-henk-img overflow-hidden">
                  <img
                    src="/story-henk.jpg"
                    alt="Henk Stoorvogel, fundador de The 4th Musketeer"
                    class="aspect-[9/11] w-full scale-[1.18] object-cover will-change-transform"
                    loading="lazy"
                  />
                </div>
              </div>
              <p class="overline mt-6 text-brand-muted">HENK STOORVOGEL — FUNDADOR</p>
            </div>
          </div>

          <!-- Narrativa -->
          <div class="qs-origen-copy md:col-span-6 lg:col-span-5 lg:col-start-8">
            <p class="rvl overline mb-4 text-brand-red">EL ORIGEN</p>
            <h2 class="rvl h2-display mb-10 text-white">
              TODO EMPEZÓ CON UNA PREGUNTA DE UNA ESPOSA.
            </h2>
            <p class="rvl mb-6 text-[1.0625rem] leading-[1.7] text-white/85">
              En 2008, Ruth Stoorvogel le planteó una idea a su esposo Henk: los hombres
              necesitaban un espacio para reencontrarse con lo esencial. Henk, inspirado por
              D'Artagnan — el cuarto mosquetero, el que vivía para el Rey — reunió a 80 hombres
              en las Ardenas belgas ese otoño.
            </p>
            <p class="rvl mb-10 text-[1.0625rem] leading-[1.7] text-white/85">
              Tres días de naturaleza, silencio y preguntas honestas después, esos hombres
              regresaron distintos. Había nacido The 4th Musketeer: vivir para el Rey — Jesús —
              y traer justicia a las comunidades del mundo.
            </p>
            <blockquote class="qs-quote flex items-stretch gap-6">
              <span class="qs-quote-bar w-1 shrink-0 bg-brand-red" aria-hidden="true" />
              <p class="qs-quote-text font-display font-expanded text-2xl font-extrabold uppercase leading-tight text-white md:text-3xl">
                "Uno por todos.
                <br />
                <span class="text-brand-red">Todos por el Rey."</span>
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <!-- ============ TIMELINE — DESKTOP (pinneado) ============ -->
      <section class="qs-timeline-d relative hidden min-h-[100dvh] items-center overflow-hidden md:flex">
        <div class="mx-auto w-full max-w-[1440px] px-12">
          <p class="overline mb-4 text-brand-red">LA HISTORIA</p>
          <h2 class="h2-display mb-24 text-white">DE UN BOSQUE BELGA AL MUNDO.</h2>

          <div class="relative">
            <!-- Línea base + progreso rojo -->
            <div class="absolute left-0 right-0 top-0 h-px bg-brand-line" aria-hidden="true" />
            <div
              class="qs-tl-line-red absolute left-0 right-0 top-0 h-px origin-left bg-brand-red will-change-transform"
              aria-hidden="true"
            />

            <div class="grid grid-cols-4 gap-8">
              <div v-for="(m, i) in TIMELINE" :key="m.year" class="relative pt-0">
                <!-- Nodo: mini-bandera plantada sobre la línea -->
                <div class="absolute -top-8 left-0 flex flex-col items-start">
                  <span
                    :class="`qs-tl-node-${i}`"
                    class="block h-8 w-6 bg-brand-red clip-cut will-change-transform"
                    aria-hidden="true"
                  />
                </div>
                <div :class="`qs-tl-item-${i}`" class="pt-10 will-change-transform">
                  <p
                    :class="`qs-tl-year-${i}`"
                    class="font-display font-expanded text-[2.5rem] font-black leading-none text-brand-red"
                  >
                    {{ m.year }}
                  </p>
                  <h3 class="h3-display mt-4 text-white">{{ m.title }}</h3>
                  <p class="mt-3 text-[0.8125rem] leading-relaxed text-brand-muted">{{ m.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ TIMELINE — MÓVIL (vertical) ============ -->
      <section class="qs-timeline-m relative px-6 py-24 md:hidden">
        <p class="overline mb-4 text-brand-red">LA HISTORIA</p>
        <h2 class="h2-display mb-14 text-white">DE UN BOSQUE BELGA AL MUNDO.</h2>

        <div class="relative pl-12">
          <div class="absolute bottom-2 left-3 top-2 w-px bg-brand-line" aria-hidden="true" />
          <div
            class="qs-tl-m-fill absolute bottom-2 left-3 top-2 w-px origin-top bg-brand-red will-change-transform"
            aria-hidden="true"
          />
          <div class="flex flex-col gap-14">
            <div v-for="(m, i) in TIMELINE" :key="m.year" :class="`qs-tlm-item-${i}`" class="relative">
              <span
                :class="`qs-tlm-node-${i}`"
                class="absolute -left-12 top-1 ml-[3px] block h-7 w-5 bg-brand-red clip-cut will-change-transform"
                aria-hidden="true"
              />
              <p class="font-display font-expanded text-[2.5rem] font-black leading-none text-brand-red">
                {{ m.year }}
              </p>
              <h3 class="h3-display mt-3 text-white">{{ m.title }}</h3>
              <p class="mt-2 text-[0.8125rem] leading-relaxed text-brand-muted">{{ m.text }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ PRESENCIA MUNDIAL ============ -->
      <section class="qs-presencia overflow-hidden bg-brand-charcoal py-24 md:py-36">
        <div class="mx-auto max-w-[1440px] px-6 md:px-12">
          <div class="mb-16 text-center">
            <p class="overline mb-4 text-brand-red">PRESENCIA</p>
            <h2 class="h2-display text-white">UNA BANDERA EN CADA CONTINENTE.</h2>
          </div>

          <div class="qs-map relative mx-auto max-w-5xl will-change-transform">
            <img
              src="/world-map.svg"
              alt="Mapa mundial con presencia del movimiento 4M"
              class="w-full"
              loading="lazy"
            />
            <!-- Puntos pulsantes -->
            <span
              v-for="(d, i) in MAP_DOTS"
              :key="d.label"
              class="qs-dot absolute -translate-x-1/2 -translate-y-1/2"
              :style="{ left: `${d.x}%`, top: `${d.y}%` }"
              :title="d.label"
            >
              <span
                class="qs-ping absolute -inset-1.5 rounded-full bg-brand-red"
                :style="{ animationDelay: pingDelay(i) }"
                aria-hidden="true"
              />
              <span class="relative block h-1.5 w-1.5 rounded-full bg-brand-red shadow-[0_0_10px_rgba(205,23,30,0.9)]" />
            </span>
            <!-- Guatemala destacada -->
            <span
              class="qs-dot-gt absolute -translate-x-1/2 -translate-y-1/2 will-change-transform"
              :style="{ left: `${GT_DOT.x}%`, top: `${GT_DOT.y}%` }"
            >
              <span
                class="qs-ping absolute -inset-3 rounded-full border border-brand-red"
                style="animation-duration: 2s"
                aria-hidden="true"
              />
              <span class="relative block h-2.5 w-2.5 rounded-full bg-brand-red shadow-[0_0_16px_rgba(205,23,30,1)]" />
              <span class="overline absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-brand-red">
                4MGT
              </span>
            </span>
          </div>

          <div class="qs-map-stats mt-14 flex flex-wrap items-start justify-center gap-12 md:gap-20">
            <div v-for="s in MAP_STATS" :key="s.label" class="text-center">
              <p class="font-display font-expanded text-4xl font-black leading-none text-white md:text-5xl">
                {{ s.n }}
              </p>
              <p class="overline mt-3 text-brand-muted">{{ s.label }}</p>
            </div>
          </div>
          <p class="overline mt-10 text-center text-[0.65rem] text-brand-muted/70">
            PUNTOS ROJOS: PAÍSES CON MOVIMIENTO 4M ACTIVO.
          </p>
        </div>
      </section>

      <!-- ============ VALORES ============ -->
      <section class="py-24 md:py-36">
        <div class="mx-auto max-w-[1440px] px-6 md:px-12">
          <div class="mb-16">
            <p class="overline mb-4 text-brand-red">LO QUE CREEMOS</p>
            <h2 class="h2-display text-white">NUESTROS VALORES.</h2>
          </div>

          <div class="qs-valores-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article
              v-for="v in VALORES"
              :key="v.title"
              class="qs-valor group relative border border-brand-line bg-brand-charcoal-900 p-8 clip-cut transition-transform duration-300 will-change-transform hover:-translate-y-1.5"
            >
              <!-- Esquina roja que se enciende en hover -->
              <span
                class="absolute right-0 top-0 h-8 w-8 bg-brand-red opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style="clip-path: polygon(100% 0, 0 0, 100% 100%)"
                aria-hidden="true"
              />
              <p class="qs-valor-num overline text-brand-muted transition-colors duration-300 group-hover:text-brand-red">
                {{ v.n }}
              </p>
              <h3 class="h3-display mt-8 text-white">{{ v.title }}</h3>
              <p class="mt-4 text-[0.9375rem] leading-relaxed text-white/70">{{ v.text }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- ============ 4M EN GUATEMALA ============ -->
      <section class="qs-gt bg-brand-charcoal py-24 md:py-36">
        <div class="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-14 px-6 md:grid-cols-2 md:px-12">
          <div class="qs-gt-copy">
            <p class="overline mb-4 text-brand-red">4MGT</p>
            <h2 class="display-l mb-8 text-white">
              <Words text="EL FUEGO ARDE EN GUATEMALA." />
            </h2>
            <p class="mb-10 max-w-lg text-[1.0625rem] leading-[1.7] text-white/85">
              <Words text="Desde los volcanes de Antigua hasta la selva de Petén, hombres guatemaltecos están respondiendo al llamado. 4M Guatemala lleva el XCC, ARISE y BONFIRE a cada rincón del país — y apenas comenzamos." />
            </p>
            <CutButton to="/contacto" variant="arrow" class="text-base">
              Únete al movimiento
            </CutButton>
          </div>

          <div class="qs-gt-card border border-brand-line bg-brand-charcoal-700 p-8 clip-cut-lg md:p-10">
            <p class="overline mb-8 text-brand-muted">EQUIPO 4M GUATEMALA</p>
            <div class="flex flex-col divide-y divide-brand-line">
              <div v-for="l in LIDERES" :key="l.nombre" class="qs-gt-row flex items-center gap-5 py-5 first:pt-0 last:pb-0">
                <span class="qs-gt-avatar flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-red font-display text-lg font-black text-white">
                  {{ l.nombre.charAt(0) }}
                </span>
                <div>
                  <p class="font-display font-bold uppercase tracking-wide text-white">{{ l.nombre }}</p>
                  <p class="mt-1 text-[0.8125rem] text-brand-muted">{{ l.rol }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ CTA FINAL ============ -->
      <section class="qs-cta relative overflow-hidden py-36">
        <img
          src="/flag-outline.svg"
          alt=""
          aria-hidden="true"
          class="qs-cta-flag pointer-events-none absolute left-1/2 top-1/2 h-[130%] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        />
        <div class="relative mx-auto max-w-[1440px] px-6 text-center md:px-12">
          <h2 class="display-l text-white">
            <span class="block overflow-hidden pb-1">
              <Words text="LA HISTORIA CONTINÚA." />
            </span>
            <span class="block overflow-hidden pb-2 text-brand-red">
              <Words text="ESCRÍBELA CON NOSOTROS." />
            </span>
          </h2>
          <div class="qs-cta-btns mt-12 flex flex-wrap items-center justify-center gap-5">
            <CutButton to="/contacto" variant="primary">
              ÚNETE AL MOVIMIENTO
            </CutButton>
            <CutButton to="/xcc" variant="ghost">
              VIVE EL XCC
            </CutButton>
          </div>
        </div>
      </section>
    </div>
  </ion-page>
</template>

<style scoped>
/* Ping de puntos del mapa */
@keyframes qsPing {
  0% {
    transform: scale(0.5);
    opacity: 0.9;
  }
  80%,
  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}
.qs-ping {
  animation: qsPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .qs-ping {
    animation: none;
    opacity: 0;
  }
}
</style>
