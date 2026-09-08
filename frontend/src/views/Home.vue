<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import { IonPage } from '@ionic/vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CutButton from '../components/CutButton.vue'
import Marquee from '../components/Marquee.vue'
import Chars from '../components/home/Chars.vue'
import Words from '../components/home/Words.vue'
import PillarCard from '../components/home/PillarCard.vue'
import type { EmberSpeedRef } from '../components/EmberField.vue'

const EmberField = defineAsyncComponent(() => import('../components/EmberField.vue'))

gsap.registerPlugin(ScrollTrigger)

/* ---------- data ---------- */

const QUESTIONS: Array<{ parts: Array<{ t: string; red?: boolean }> }> = [
  { parts: [{ t: '¿POR QUÉ ESTÁS ' }, { t: 'AQUÍ?', red: true }] },
  { parts: [{ t: '¿QUÉ ' }, { t: 'QUIERES?', red: true }] },
  { parts: [{ t: '¿PARA QUÉ ' }, { t: 'VIVES?', red: true }] },
]

const PILLARS = [
  {
    n: '01',
    title: 'CUERPO',
    img: '/pillars-body.jpg',
    text: 'Restablece tus prioridades. Tu cuerpo es el primer campo de batalla: esfuerzo físico real, en terreno real.',
  },
  {
    n: '02',
    title: 'MENTE',
    img: '/pillars-mind.jpg',
    text: 'Fortalece tus relaciones. Silencio, perspectiva y preguntas honestas lejos del ruido.',
  },
  {
    n: '03',
    title: 'ESPÍRITU',
    img: '/pillars-spirit.jpg',
    text: 'Profundiza en tu fe. Hermandad, fuego y un propósito más grande que tú.',
  },
]

const PROGRAMAS = [
  {
    n: '01',
    title: 'XCC',
    sub: 'XTREME CHARACTER CHALLENGE',
    desc: '72 horas en la naturaleza. Enfrenta las preguntas más importantes de la vida, experimenta la hermandad de una manera poderosa y regresa a casa listo para fortalecer las relaciones con las personas que amas.',
    meta: '72 HORAS · SOLO HOMBRES',
    to: '/xcc',
    img: '/xcc-hero.jpg',
  },
  {
    n: '02',
    title: 'ARISE',
    sub: '',
    desc: 'El despertar. Un encuentro para encender el corazón del hombre y levantarse con propósito.',
    meta: '1 DÍA · TODOS',
    to: '/arise',
    img: '/arise-hero.jpg',
  },
  {
    n: '03',
    title: 'BONFIRE',
    sub: '',
    desc: 'La fogata nunca se apaga. Reuniones locales de hermandad, historias y fuego real.',
    meta: 'MENSUAL · COMUNIDAD',
    to: '/bonfire',
    img: '/bonfire-hero.jpg',
  },
]

const STATS = [
  { value: 16, suffix: '+', label: 'AÑOS DE MOVIMIENTO · DESDE 2008', format: false },
  { value: 20, suffix: '+', label: 'PAÍSES CON PRESENCIA 4M', format: false },
  { value: 5000, suffix: '+', label: 'HOMBRES FORJADOS EN EL XCC', format: true },
  { value: 72, suffix: '', label: 'HORAS QUE LO CAMBIAN TODO', format: false },
]

/* ---------- lógica ---------- */

const root = ref<HTMLElement | null>(null)
const heroSpeed: EmberSpeedRef = { value: 0 }
const ctaSpeed: EmberSpeedRef = { value: 0 }

let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    /* ===== HERO: secuencia de carga ===== */
    const intro = gsap.timeline({ delay: 0.55, defaults: { ease: 'power4.out' } })
    intro
      .from('.hero-flag', { y: -180, rotation: 4, duration: 0.5 })
      .from('.hero-overline-inner', { xPercent: -105, duration: 0.4 }, '-=0.15')
      .from(
        '.hero-headline .char',
        { yPercent: 110, rotateX: 40, opacity: 0, duration: 1.1, stagger: 0.025 },
        '-=0.1'
      )
      .from('.hero-sub, .hero-ctas', { y: 24, opacity: 0, duration: 0.7, stagger: 0.12 }, '-=0.6')
      .from('.hero-badge, .hero-scroll-ind', { opacity: 0, duration: 0.6 }, '-=0.3')

    /* ===== HERO: pin + scrub ===== */
    gsap
      .timeline({
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            heroSpeed.value = self.progress
          },
        },
      })
      .to('.hero-content', { y: -80, scale: 0.94, opacity: 0.15, ease: 'none' }, 0)
      .to('.hero-bg-img', { yPercent: 12, ease: 'none' }, 0)

    /* ===== INTERLUDIO: las preguntas ===== */
    gsap.utils.toArray<HTMLElement>('.question-block').forEach((q, idx) => {
      const chars = q.querySelectorAll('.char')
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: q,
          start: 'top top',
          end: '+=70%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      })
      tl.from(chars, {
        y: 30,
        opacity: 0,
        filter: 'blur(8px)',
        stagger: 0.04,
        ease: 'power2.out',
      }).from(q.querySelector('.question-flag'), { scaleY: 0, transformOrigin: 'top' }, 0)
      // La tercera pregunta se queda fija (sin dispersión)
      if (idx < QUESTIONS.length - 1) {
        tl.to(chars, { y: -40, opacity: 0, stagger: 0.02, ease: 'power2.in' }, '+=0.35')
      }
    })

    /* ===== MANIFIESTO ===== */
    gsap.from('.manifesto-line > span', {
      yPercent: 110,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#movimiento', start: 'top 75%' },
    })
    gsap.from('.pillar-block', {
      scale: 1.15,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#movimiento', start: 'top 70%' },
    })
    gsap.from('.manifesto-flag', {
      scaleY: 0,
      transformOrigin: 'top',
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#movimiento', start: 'top 75%' },
    })
    gsap.from('.manifesto-left > *', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#movimiento', start: 'top 80%' },
    })

    /* ===== PILARES ===== */
    gsap.from('.pillar-card', {
      y: 80,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.pillars-grid', start: 'top 80%' },
    })
    // parallax independiente por columna
    gsap.utils.toArray<HTMLElement>('.pillar-card').forEach((card, i) => {
      const speed = i === 1 ? -5 : 5
      gsap.to(card, {
        yPercent: speed,
        ease: 'none',
        scrollTrigger: { trigger: '.pillars-grid', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      })
    })

    /* ===== PROGRAMAS ===== */
    gsap.from('.program-row', {
      clipPath: 'inset(0 100% 0 0)',
      duration: 1,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.programs-list', start: 'top 80%' },
    })
    gsap.from('.programs-header > *', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.programs-list', start: 'top 85%' },
    })

    /* ===== STATS ===== */
    gsap.from('.stat-line', {
      scaleX: 0,
      transformOrigin: 'left',
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.stats-grid', start: 'top 75%' },
    })
    gsap.from('.stat-item', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.stats-grid', start: 'top 75%' },
    })
    gsap.utils.toArray<HTMLElement>('.stat-number').forEach((el) => {
      const target = Number(el.dataset.value ?? '0')
      const format = el.dataset.format === 'true'
      const obj = { v: 0 }
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: 'power2.out',
        snap: { v: 1 },
        scrollTrigger: { trigger: el, start: 'top 80%' },
        onUpdate: () => {
          el.textContent = format
            ? Math.round(obj.v).toLocaleString('en-US')
            : String(Math.round(obj.v))
        },
      })
    })
    gsap.to('.stats-flag-bg', {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: { trigger: '.stats-section', start: 'top bottom', end: 'bottom top', scrub: 1 },
    })

    /* ===== HISTORIA ===== */
    gsap.fromTo(
      '.story-img-wrap',
      { clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)' },
      {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: '.story-section', start: 'top 75%' },
      }
    )
    gsap.fromTo(
      '.story-img',
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: '.story-section', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      }
    )
    gsap.from('.story-text .word', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.04,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.story-section', start: 'top 75%' },
    })

    /* ===== CTA FINAL: pin + scrub ===== */
    const ctaTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.cta-section',
        start: 'top top',
        end: '+=130%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          ctaSpeed.value = self.progress
        },
      },
    })
    ctaTl
      .from('.cta-flag', { y: -140, rotation: 4, ease: 'bounce.out', duration: 0.4 }, 0)
      .fromTo('.cta-headline', { scale: 0.9 }, { scale: 1.05, ease: 'none', duration: 1 }, 0)
      .from('.cta-sub, .cta-buttons', { y: 30, opacity: 0, duration: 0.3, stagger: 0.1 }, 0.55)
  }, root.value as Element)
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
})

const scrollToMovimiento = () =>
  document.getElementById('movimiento')?.scrollIntoView({ behavior: 'smooth' })

const STORY_TEXT =
  "En 2008, una idea de Ruth Stoorvogel encendió algo en su esposo Henk. Inspirados por D'Artagnan — el cuarto mosquetero que vivía para el Rey — 80 hombres se adentraron en las Ardenas belgas. Nació 4M: vivir para el Rey y traer justicia a las comunidades. Hoy, el fuego arde en Guatemala."
</script>

<template>
  <ion-page>
    <div ref="root" class="bg-brand-charcoal-900">
      <!-- ============ SECCIÓN 1 — HERO "72 HORAS" ============ -->
      <section class="hero-section relative -mt-20 min-h-[100dvh] overflow-hidden">
        <!-- Fondo -->
        <div class="absolute inset-0 overflow-hidden">
          <img
            src="/hero-bg.jpg"
            alt="Volcán en erupción de noche con siluetas de hombres en la cresta"
            class="hero-bg-img h-[115%] w-full object-cover"
            @load="ScrollTrigger.refresh()"
          />
          <div
            class="absolute inset-0"
            :style="{
              background:
                'linear-gradient(180deg, rgba(18,18,18,0.55), rgba(18,18,18,0.2) 45%, #121212 100%)',
            }"
          />
        </div>

        <!-- Campo de brasas 3D -->
        <EmberField :count="250" :speed-ref="heroSpeed" class="absolute inset-0 z-10" />

        <!-- Badge próximo XCC -->
        <div
          class="hero-badge absolute top-28 right-6 md:right-12 z-20 hidden md:flex items-center gap-3 border border-brand-line px-4 py-3 [writing-mode:vertical-rl]"
        >
          <span class="h-2 w-2 rounded-full bg-brand-red animate-pulse-dot" />
          <span class="overline text-white/80">PRÓXIMO XCC — 14 NOV 2025</span>
        </div>

        <!-- Contenido -->
        <div
          class="hero-content relative z-20 mx-auto flex min-h-[100dvh] max-w-[1440px] flex-col justify-end px-6 pb-24 md:px-12"
        >
          <div
            class="hero-flag mb-8 ml-14 flex h-[72px] w-14 items-center justify-center bg-brand-red clip-cut"
          >
            <span class="font-display text-4xl font-black leading-none text-white">4</span>
          </div>
          <div class="overflow-hidden mb-6">
            <p class="hero-overline-inner overline text-brand-red">
              XTREME CHARACTER CHALLENGE · GUATEMALA
            </p>
          </div>
          <h1
            class="hero-headline display-xl mb-8 max-w-6xl"
            style="perspective: 800px"
            aria-label="¿Listo para 72 horas que van a cambiar tu vida?"
          >
            <span class="block overflow-hidden pb-1">
              <Chars text="¿LISTO PARA" class="text-white" />
            </span>
            <span class="block overflow-hidden pb-1">
              <Chars text="72 HORAS" class="text-brand-red" />
              <Chars text=" QUE VAN" class="text-white" />
            </span>
            <span class="block overflow-hidden pb-1">
              <Chars text="A CAMBIAR TU VIDA?" class="text-white" />
            </span>
          </h1>
          <p class="hero-sub mb-10 max-w-xl font-body text-lg leading-[1.7] text-white/85">
            Encuentra el llamado que tu corazón está buscando. Nuestras aventuras en la naturaleza
            te devuelven la atención a las cosas que más importan.
          </p>
          <div class="hero-ctas flex flex-wrap items-center gap-4">
            <CutButton to="/xcc" variant="primary">VIVE EL XCC</CutButton>
            <CutButton variant="ghost" @click="scrollToMovimiento">
              CONOCE EL MOVIMIENTO
            </CutButton>
          </div>
        </div>

        <!-- Indicador de scroll -->
        <div
          class="hero-scroll-ind absolute bottom-0 right-6 md:right-12 z-20 hidden md:flex flex-col items-center gap-4"
        >
          <span class="overline text-white/60 [writing-mode:vertical-rl]">SCROLL</span>
          <span class="relative block h-20 w-px bg-brand-line overflow-hidden">
            <span class="scroll-line-fill absolute inset-x-0 top-0 h-full origin-top bg-brand-red" />
          </span>
        </div>
      </section>

      <!-- ============ SECCIÓN 2 — INTERLUDIO "LAS PREGUNTAS" ============ -->
      <section class="bg-black">
        <div
          v-for="(q, i) in QUESTIONS"
          :key="i"
          class="question-block relative flex h-[70dvh] items-center justify-center overflow-hidden px-6"
        >
          <span
            class="question-flag absolute left-[12%] md:left-[22%] h-[22px] w-4 bg-brand-red clip-cut"
          />
          <h2
            class="question text-center font-display font-expanded font-black uppercase leading-[1.05] text-white"
            :style="{ fontSize: 'clamp(2.5rem, 7vw, 6.5rem)' }"
          >
            <Chars
              v-for="(p, j) in q.parts"
              :key="j"
              :text="p.t"
              :class="p.red ? 'text-brand-red' : undefined"
            />
          </h2>
        </div>
      </section>

      <!-- ============ SECCIÓN 3 — MANIFIESTO "EL MOVIMIENTO" ============ -->
      <section
        id="movimiento"
        class="border-t border-brand-line bg-brand-charcoal-900 py-24 md:py-36"
      >
        <div
          class="mx-auto grid max-w-[1440px] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:px-12"
        >
          <!-- Izquierda sticky -->
          <div
            class="manifesto-left md:col-span-5 md:sticky md:top-32 self-start flex flex-col gap-6"
          >
            <span class="overline text-brand-red">EL MOVIMIENTO</span>
            <h2 class="display-l text-white">
              UNA BANDA DE <span class="flag-block">HERMANOS.</span>
            </h2>
            <p class="max-w-md font-body text-lg leading-[1.7] text-white/85">
              4M es un movimiento mundial de hombres — una banda de hermanos — gente ordinaria
              viviendo vidas extraordinarias.
            </p>
            <p
              class="font-display font-expanded font-extrabold uppercase tracking-tight text-brand-red text-lg md:text-xl"
            >
              ORDINARY PEOPLE | EXTRAORDINARY LIVES
            </p>
            <CutButton to="/quienes-somos" variant="arrow" class="mt-2">
              Nuestra historia
            </CutButton>
          </div>

          <!-- Derecha: párrafo grande -->
          <div class="relative md:col-span-7 md:col-start-6">
            <span
              class="manifesto-flag absolute -left-2 top-2 hidden h-[72px] w-14 bg-brand-red clip-cut md:block"
            />
            <p class="font-display text-[1.75rem] font-bold leading-[1.35] text-white md:pl-16">
              <span class="manifesto-line block overflow-hidden pb-[0.15em]"
                ><span class="inline-block will-change-transform"
                  >Inspirando el corazón del hombre — a través de</span
                ></span
              >
              <span class="manifesto-line block overflow-hidden pb-[0.15em]"
                ><span class="inline-block will-change-transform"
                  >aventuras para el
                  <span class="pillar-block flag-block">CUERPO</span>,
                  <span class="pillar-block flag-block">MENTE</span> y
                  <span class="pillar-block flag-block">ESPÍRITU</span>.</span
                ></span
              >
              <span class="manifesto-line block overflow-hidden pb-[0.15em]"
                ><span class="inline-block will-change-transform"
                  >Diseñadas para empujarte más allá de tu zona de confort</span
                ></span
              >
              <span class="manifesto-line block overflow-hidden pb-[0.15em]"
                ><span class="inline-block will-change-transform"
                  >para enfrentar a tus gigantes, despertar tu corazón al</span
                ></span
              >
              <span class="manifesto-line block overflow-hidden pb-[0.15em]"
                ><span class="inline-block will-change-transform"
                  >propósito de Dios para tu vida y encontrar la fuerza</span
                ></span
              >
              <span class="manifesto-line block overflow-hidden pb-[0.15em]"
                ><span class="inline-block will-change-transform"
                  >que necesitas para luchar por las cosas que más importan.</span
                ></span
              >
            </p>
          </div>
        </div>
      </section>

      <!-- ============ SECCIÓN 4 — PILARES ============ -->
      <section class="bg-brand-charcoal-900 py-24 md:py-36">
        <div
          class="pillars-grid mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-6 md:grid-cols-3 md:px-12"
        >
          <PillarCard v-for="p in PILLARS" :key="p.n" v-bind="p" />
        </div>
      </section>

      <!-- ============ SECCIÓN 5 — MARQUEE ============ -->
      <Marquee />

      <!-- ============ SECCIÓN 6 — PROGRAMAS ============ -->
      <section class="programs-list bg-brand-charcoal-900 py-24 md:py-36">
        <div
          class="programs-header mx-auto mb-16 flex max-w-[1440px] flex-col gap-4 px-6 md:px-12"
        >
          <span class="overline text-brand-red">PROGRAMAS</span>
          <h2 class="display-l text-white">
            TRES CAMINOS.
            <br />
            UN MISMO <span class="text-brand-red">FUEGO.</span>
          </h2>
        </div>
        <div class="border-t border-brand-line">
          <router-link
            v-for="p in PROGRAMAS"
            :key="p.n"
            :to="p.to"
            data-cursor-label="ABRIR"
            class="program-row group relative block overflow-hidden border-b border-brand-line"
          >
            <!-- imagen revelada en hover -->
            <div
              class="absolute inset-y-0 right-0 hidden w-[55%] bg-cover bg-center opacity-0 transition-all duration-500 ease-out md:block md:[clip-path:polygon(100%_0,100%_0,100%_100%,100%_100%)] md:group-hover:opacity-100 md:group-hover:[clip-path:polygon(25%_0,100%_0,100%_100%,0_100%)]"
              :style="{ backgroundImage: `url(${p.img})` }"
            >
              <div class="absolute inset-0 bg-brand-charcoal-900/40" />
            </div>
            <div
              class="relative mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-10 transition-all duration-500 group-hover:shadow-[0_24px_60px_-20px_rgba(205,23,30,0.35)] md:min-h-[240px] md:flex-row md:items-center md:gap-10 md:px-12"
            >
              <span class="numeral text-outline !text-4xl md:!text-6xl shrink-0">{{ p.n }}</span>
              <div class="flex-1 transition-transform duration-500 md:group-hover:translate-x-6">
                <h3 class="display-l text-white">
                  {{ p.title }}{{ ' ' }}
                  <span
                    v-if="p.sub"
                    class="block font-display text-base font-semibold tracking-[0.2em] text-brand-muted md:text-lg"
                  >
                    {{ p.sub }}
                  </span>
                </h3>
                <p class="mt-3 max-w-xl font-body text-base leading-[1.7] text-white/70">
                  {{ p.desc }}
                </p>
              </div>
              <span class="overline shrink-0 text-brand-muted">{{ p.meta }}</span>
              <span
                aria-hidden="true"
                class="hidden shrink-0 font-display text-5xl font-black text-white transition-all duration-500 group-hover:rotate-45 group-hover:text-brand-red md:block"
              >
                →
              </span>
            </div>
          </router-link>
        </div>
      </section>

      <!-- ============ SECCIÓN 7 — STATS ============ -->
      <section class="stats-section relative overflow-hidden bg-brand-charcoal py-24 md:py-36">
        <img
          src="/flag-outline.svg"
          alt=""
          aria-hidden="true"
          class="stats-flag-bg pointer-events-none absolute -right-[4vw] top-1/2 h-[50dvh] -translate-y-1/2 opacity-[0.07]"
        />
        <div
          class="stats-grid relative mx-auto grid max-w-[1440px] grid-cols-2 gap-x-8 gap-y-16 px-6 md:grid-cols-4 md:px-12"
        >
          <div v-for="s in STATS" :key="s.label" class="stat-item">
            <div class="stat-line mb-6 h-0.5 w-full bg-brand-red" />
            <div class="numeral text-white">
              <span
                class="stat-number"
                :data-value="s.value"
                :data-format="s.format ? 'true' : 'false'"
                >0</span
              >
              <span class="text-brand-red">{{ s.suffix }}</span>
            </div>
            <p class="overline mt-4 !text-[0.65rem] text-brand-muted">{{ s.label }}</p>
          </div>
        </div>
      </section>

      <!-- ============ SECCIÓN 8 — HISTORIA TEASER ============ -->
      <section class="story-section bg-brand-charcoal-900 py-24 md:py-36">
        <div
          class="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 px-6 md:grid-cols-12 md:px-12"
        >
          <div class="relative md:col-span-7">
            <span
              class="absolute -top-6 left-14 z-10 flex h-[72px] w-14 items-center justify-center bg-brand-red clip-cut"
            >
              <span class="font-display text-4xl font-black leading-none text-white">4</span>
            </span>
            <div class="story-img-wrap clip-cut-lg overflow-hidden">
              <img
                src="/story-holland.jpg"
                alt="Hombre caminando en un bosque dorado con niebla en otoño"
                loading="lazy"
                class="story-img aspect-[16/10] w-full scale-110 object-cover"
              />
            </div>
          </div>
          <div class="story-text flex flex-col gap-6 md:col-span-5 md:col-start-9">
            <span class="overline text-brand-red">DESDE 2008 · HOLANDA</span>
            <h2 class="display-l text-white">TODOS PARA UNO.</h2>
            <p class="font-body text-lg leading-[1.7] text-white/85">
              <Words :text="STORY_TEXT" />
            </p>
            <CutButton to="/quienes-somos" variant="arrow" class="mt-2">
              Conoce la historia completa
            </CutButton>
          </div>
        </div>
      </section>

      <!-- ============ SECCIÓN 9 — CTA FINAL ============ -->
      <section
        class="cta-section relative flex min-h-[100dvh] items-center justify-center overflow-hidden"
      >
        <div class="absolute inset-0">
          <img
            src="/cta-bg.jpg"
            alt="Cordillera volcánica oscura con lava al atardecer"
            loading="lazy"
            class="h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-brand-charcoal-900/60" />
        </div>
        <EmberField :count="120" :speed-ref="ctaSpeed" class="absolute inset-0 z-10" />
        <div
          class="relative z-20 mx-auto flex max-w-[1440px] flex-col items-center gap-8 px-6 text-center md:px-12"
        >
          <span
            class="cta-flag flex h-[92px] w-[72px] items-center justify-center bg-brand-red clip-cut"
          >
            <span class="font-display text-5xl font-black leading-none text-white">4</span>
          </span>
          <h2 class="cta-headline display-xl text-white">
            EL <span class="text-brand-red">FUEGO</span> TE ESTÁ
            <br />
            ESPERANDO.
          </h2>
          <p class="cta-sub max-w-xl font-body text-lg leading-[1.7] text-white/85">
            Tu próximo XCC comienza con una decisión. 72 horas. Sin excusas.
          </p>
          <div class="cta-buttons flex flex-wrap items-center justify-center gap-4">
            <CutButton to="/xcc" variant="primary">INSCRÍBETE AL XCC</CutButton>
            <CutButton to="/contacto" variant="ghost">HABLA CON NOSOTROS</CutButton>
          </div>
        </div>
      </section>
    </div>
  </ion-page>
</template>
