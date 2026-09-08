<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { IonIcon, IonPage } from '@ionic/vue'
import {
  flameOutline,
  documentTextOutline,
  chatboxOutline,
  restaurantOutline,
} from 'ionicons/icons'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CutButton from '../components/CutButton.vue'
import FlagMark from '../components/FlagMark.vue'
import Chars from '../components/home/Chars.vue'
import Words from '../components/home/Words.vue'
import SparkCanvas from '../components/programs/SparkCanvas.vue'

gsap.registerPlugin(ScrollTrigger)

/* ---------- data ---------- */

const FORMATO = [
  {
    icon: flameOutline,
    titulo: 'EL FUEGO',
    desc: 'Siempre real, siempre en el centro.',
  },
  {
    icon: documentTextOutline,
    titulo: 'LA HISTORIA',
    desc: 'Un hombre comparte su historia, sin guion.',
  },
  {
    icon: chatboxOutline,
    titulo: 'EL CÍRCULO',
    desc: 'Conversación honesta, sin juicio.',
  },
  {
    icon: restaurantOutline,
    titulo: 'LA MESA',
    desc: 'Comida sencilla compartida al final.',
  },
]

const SEDES = [
  {
    ciudad: 'CIUDAD DE GUATEMALA',
    zona: 'Zona 15 — Vista Hermosa',
    fecha: 'SÁB 08 NOV · 18:00',
    anfitrion: 'Rodrigo V.',
  },
  {
    ciudad: 'ANTIGUA GUATEMALA',
    zona: 'Finca El Pilar',
    fecha: 'SÁB 15 NOV · 17:30',
    anfitrion: 'Marco A.',
  },
  {
    ciudad: 'QUETZALTENANGO',
    zona: 'Cerro El Baúl',
    fecha: 'SÁB 22 NOV · 18:00',
    anfitrion: 'Josué R.',
  },
  {
    ciudad: 'COBÁN',
    zona: 'Finca Santa Margarita',
    fecha: 'SÁB 29 NOV · 17:00',
    anfitrion: 'Diego S.',
  },
]

/* ---------- página ---------- */

const root = ref<HTMLElement | null>(null)
const ctaBtnRef = ref<HTMLElement | null>(null)
const ctaLit = ref(false)
let ctx: gsap.Context | null = null
let ctaIo: IntersectionObserver | null = null

const onImgLoad = () => ScrollTrigger.refresh()
const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

onMounted(() => {
  // Las chispas del CTA final "prenden" cuando el botón entra al viewport
  const btn = ctaBtnRef.value
  if (btn) {
    ctaIo = new IntersectionObserver(
      ([entry]) => {
        ctaLit.value = entry.isIntersecting
      },
      { threshold: 0.4 }
    )
    ctaIo.observe(btn)
  }

  ctx = gsap.context(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    /* ===== HERO: secuencia de carga ===== */
    const intro = gsap.timeline({ delay: 0.55, defaults: { ease: 'power4.out' } })
    intro
      .from('.hero-flag', { y: -160, rotation: 4, duration: 0.5 })
      .from('.hero-overline-inner', { xPercent: -105, duration: 0.4 }, '-=0.15')
      .from(
        '.hero-headline .char',
        { yPercent: 110, rotateX: 40, opacity: 0, duration: 1, stagger: 0.03 },
        '-=0.1'
      )
      // el glow del fuego "prende"
      .fromTo(
        '.hero-glow',
        { opacity: 0 },
        { opacity: 0.25, duration: 1.2, ease: 'power2.inOut' },
        '-=0.7'
      )
      .from('.hero-sub, .hero-ctas, .hero-meta', { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.6')

    /* ===== HERO: parallax de scroll ===== */
    gsap.to('.hero-bg-img', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 0.6 },
    })
    gsap.to('.hero-headline', {
      y: -50,
      ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: '70% top', scrub: 0.6 },
    })

    /* ===== ¿QUÉ ES BONFIRE? ===== */
    gsap.from('.formato-h2 .word', {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.05,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#formato', start: 'top 78%' },
    })
    gsap.from('.formato-body .reveal-line > span', {
      yPercent: 110,
      duration: 0.9,
      stagger: 0.14,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.formato-body', start: 'top 78%' },
    })
    gsap.from('.formato-card', {
      x: 60,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.formato-card', start: 'top 80%' },
    })
    gsap.from('.formato-row', {
      x: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.formato-card', start: 'top 72%' },
    })
    gsap.from('.formato-icon', {
      scale: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'back.out(1.7)',
      scrollTrigger: { trigger: '.formato-card', start: 'top 72%' },
    })

    /* ===== QUOTE INTERLUDIO: scrub con pin corto ===== */
    const quoteTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.quote-section',
        start: 'top top',
        end: '+=80%',
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
      },
    })
    quoteTl.from('.quote-line .word', {
      y: 30,
      opacity: 0,
      stagger: 0.06,
      ease: 'power2.out',
    })
    gsap.from('.quote-attr', {
      opacity: 0,
      y: 16,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.quote-section', start: 'top 40%' },
    })

    /* ===== SEDES: filas con clip-reveal ===== */
    gsap.from('.sedes-header > *', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#sedes', start: 'top 80%' },
    })
    gsap.from('.sede-row', {
      clipPath: 'inset(0 100% 0 0)',
      duration: 1,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.sedes-list', start: 'top 80%' },
    })

    /* ===== ANFITRIONA UNA FOGATA: tarjetas desde lados opuestos ===== */
    gsap.from('.host-card-left', {
      x: -60,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.host-section', start: 'top 78%' },
    })
    gsap.from('.host-card-right', {
      x: 60,
      opacity: 0,
      duration: 0.9,
      delay: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.host-section', start: 'top 78%' },
    })

    /* ===== CTA FINAL ===== */
    gsap.from('.cta-headline .word', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.cta-section', start: 'top 75%' },
    })
    gsap.from('.cta-buttons', {
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.cta-section', start: 'top 65%' },
    })
  }, root.value as Element)
})

onUnmounted(() => {
  ctaIo?.disconnect()
  ctaIo = null
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <ion-page>
    <div ref="root" class="bg-brand-charcoal-900">
      <!-- ============ SECCIÓN 1 — HERO "EL FUEGO NUNCA SE APAGA." ============ -->
      <section class="hero-section relative -mt-20 flex min-h-[85dvh] flex-col overflow-hidden">
        <!-- Fondo -->
        <div class="absolute inset-0 overflow-hidden">
          <img
            src="/bonfire-hero.jpg"
            alt="Círculo de hombres sentados en troncos alrededor de una fogata nocturna bajo el cielo estrellado"
            class="hero-bg-img h-[115%] w-full object-cover"
            @load="onImgLoad"
          />
          <div
            class="absolute inset-0"
            :style="{
              background:
                'linear-gradient(180deg, rgba(18,18,18,0.4), rgba(18,18,18,0.25) 50%, #121212 100%)',
            }"
          />
        </div>

        <!-- Glow radial naranja que crece como si el fuego prendiera -->
        <div
          aria-hidden="true"
          class="hero-glow pointer-events-none absolute inset-0 z-10 opacity-0"
          :style="{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 85%, rgba(245,130,31,0.7), rgba(232,64,47,0.25) 45%, transparent 70%)',
          }"
        />

        <!-- Chispas 2D en canvas -->
        <SparkCanvas :count="60" class="pointer-events-none absolute inset-0 z-10" />

        <!-- Contenido abajo-izquierda -->
        <div
          class="relative z-20 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-6 pb-20 pt-28 md:px-12"
        >
          <div class="hero-flag mb-8 flex h-[62px] w-12 items-center justify-center bg-brand-red clip-cut">
            <span class="font-display text-3xl font-black leading-none text-white">4</span>
          </div>
          <div class="mb-6 overflow-hidden">
            <p class="hero-overline-inner overline text-brand-red">COMUNIDAD BONFIRE</p>
          </div>
          <h1
            class="hero-headline display-xl mb-8"
            style="perspective: 900px"
            aria-label="El fuego nunca se apaga."
          >
            <span class="block overflow-hidden pb-1">
              <Chars text="EL FUEGO" class="text-white" />
            </span>
            <span class="block overflow-hidden pb-2">
              <Chars text="NUNCA SE APAGA." class="bonfire-outline" />
            </span>
          </h1>
          <p class="hero-sub mb-10 max-w-xl font-body text-lg leading-[1.7] text-white/85">
            Reuniones locales de hermandad. Historias reales, fuego real y un círculo donde
            siempre hay un lugar para ti.
          </p>
          <div class="hero-ctas flex flex-wrap items-center gap-4">
            <CutButton variant="primary" @click="scrollToId('sedes')">
              ENCUENTRA TU FOGATA
            </CutButton>
            <CutButton variant="ghost" @click="scrollToId('formato')"> ¿CÓMO FUNCIONA? </CutButton>
          </div>
          <p class="hero-meta overline mt-10 text-white/60">MENSUAL · GRATIS · EN TODA GUATEMALA</p>
        </div>
      </section>

      <!-- ============ SECCIÓN 2 — ¿QUÉ ES BONFIRE? + EL FORMATO ============ -->
      <section id="formato" class="relative py-24 md:py-36">
        <div class="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-6 md:px-12 lg:grid-cols-12">
          <div class="formato-body lg:col-span-6">
            <FlagMark class="mb-6 h-4 w-3" />
            <h2 class="formato-h2 display-l text-white">
              <Words text="LOS HOMBRES NO FUIMOS HECHOS PARA" />
              {{ ' ' }}
              <span class="flag-block">
                <Words text="ARDER" />
              </span>
              {{ ' ' }}
              <Words text="SOLOS." />
            </h2>
            <div class="mt-10">
              <div class="reveal-line overflow-hidden">
                <span class="block font-body text-lg leading-[1.7] text-white/85">
                  BONFIRE es la fogata mensual del movimiento 4M en Guatemala. Un círculo abierto
                  donde hombres de todas las edades se reúnen a contar historias, reír, escuchar y
                  recordar por qué están aquí. No necesitas haber ido a un XCC. Solo necesitas
                  llegar.
                </span>
              </div>
              <div class="reveal-line mt-6 overflow-hidden">
                <span class="block font-body text-xl leading-[1.7] text-white">
                  Trae una silla. Nosotros ponemos el fuego.
                </span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-6 lg:pl-8">
            <div class="formato-card border border-brand-line bg-brand-charcoal clip-cut p-8 md:p-10">
              <p class="overline mb-8 text-brand-red">EL FORMATO</p>
              <ul class="flex flex-col divide-y divide-brand-line">
                <li
                  v-for="f in FORMATO"
                  :key="f.titulo"
                  class="formato-row flex items-center gap-5 py-5 first:pt-0 last:pb-0"
                >
                  <span
                    class="formato-icon flex h-12 w-12 shrink-0 items-center justify-center border border-brand-line text-brand-ember"
                  >
                    <ion-icon :icon="f.icon" class="text-[22px]" />
                  </span>
                  <div>
                    <h3 class="h3-display text-base text-white">{{ f.titulo }}</h3>
                    <p class="mt-1 font-body text-sm text-brand-muted">{{ f.desc }}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ SECCIÓN 3 — QUOTE INTERLUDIO ============ -->
      <section class="quote-section flex min-h-[100dvh] items-center bg-black py-32">
        <div class="mx-auto max-w-[1200px] px-6 text-center md:px-12">
          <p
            class="quote-line display-xl text-white"
            aria-label="Una silla junto al fuego cambia más que mil consejos."
          >
            <Words text="UNA SILLA JUNTO AL" /> {{ ' ' }} <Words text="FUEGO" class="fire-word" />
            {{ ' ' }} <Words text="CAMBIA MÁS QUE MIL CONSEJOS." />
          </p>
          <p class="quote-attr overline mt-10 text-brand-muted">
            — UN HOMBRE DE BONFIRE, ANTIGUA GUATEMALA
          </p>
        </div>
      </section>

      <!-- ============ SECCIÓN 4 — FOGATAS ACTIVAS ============ -->
      <section id="sedes" class="border-t border-brand-line py-24 md:py-36">
        <div class="mx-auto max-w-[1440px] px-6 md:px-12">
          <div class="sedes-header mb-16">
            <p class="overline mb-6 text-brand-red">SEDES</p>
            <h2 class="h2-display text-white">ENCUENTRA TU FOGATA.</h2>
          </div>
          <div class="sedes-list border-t border-brand-line">
            <div
              v-for="s in SEDES"
              :key="s.ciudad"
              class="sede-row group relative grid grid-cols-1 items-center gap-4 overflow-hidden border-b border-brand-line py-8 transition-colors duration-300 hover:bg-brand-charcoal-700 md:grid-cols-12 md:gap-6 md:px-6"
            >
              <!-- glow ámbar a la izquierda en hover -->
              <span
                aria-hidden="true"
                class="pointer-events-none absolute inset-y-0 left-0 w-48 opacity-0 transition-opacity duration-500 group-hover:opacity-20"
                :style="{
                  background:
                    'radial-gradient(ellipse at 0% 50%, rgba(245,130,31,0.9), transparent 70%)',
                }"
              />
              <h3
                class="h3-display relative text-white transition-transform duration-300 group-hover:translate-x-4 md:col-span-4 md:text-2xl"
              >
                {{ s.ciudad }}
              </h3>
              <p class="relative font-body text-sm text-brand-muted md:col-span-3">{{ s.zona }}</p>
              <p
                class="relative font-display font-bold uppercase tracking-[0.1em] text-brand-ember md:col-span-2"
              >
                {{ s.fecha }}
              </p>
              <p class="relative font-body text-sm text-white/70 md:col-span-2">
                Anfitrión: {{ s.anfitrion }}
              </p>
              <div class="relative md:col-span-1 md:justify-self-end">
                <CutButton to="/contacto" variant="ghost" class="!px-5 !py-2.5 text-xs">
                  UNIRME
                </CutButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ SECCIÓN 5 — ANFITRIONA UNA FOGATA ============ -->
      <section class="host-section py-24 md:py-36">
        <div class="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-6 md:px-12 lg:grid-cols-2">
          <article
            class="host-card-left flex flex-col items-start gap-6 bg-brand-charcoal-700 clip-cut-lg p-10 transition-all duration-300 hover:-translate-y-2 hover:rotate-[0.4deg] hover:shadow-[0_12px_40px_rgba(245,130,31,0.15)] md:p-14"
          >
            <FlagMark class="h-4 w-3" />
            <h3 class="h3-display text-white">¿QUIERES ENCENDER UNA FOGATA EN TU CIUDAD?</h3>
            <p class="font-body text-base leading-[1.7] text-white/80">
              Te entrenamos y te damos todo el material. Solo necesitas un patio, leña y corazón.
            </p>
            <CutButton to="/contacto" variant="primary" class="mt-2"> SER ANFITRIÓN </CutButton>
          </article>
          <article
            class="host-card-right flex flex-col items-start gap-6 border border-brand-line bg-brand-charcoal clip-cut-lg p-10 transition-all duration-300 hover:-translate-y-2 hover:-rotate-[0.4deg] hover:shadow-[0_12px_40px_rgba(245,130,31,0.15)] md:p-14"
          >
            <FlagMark class="h-4 w-3" />
            <h3 class="h3-display text-white">¿PRIMERA VEZ?</h3>
            <p class="font-body text-base leading-[1.7] text-white/80">
              Llega solo, llega con un amigo. Nadie llega extraño dos veces.
            </p>
            <CutButton href="/contacto#faq" variant="ghost" class="mt-2">
              VER PREGUNTAS FRECUENTES
            </CutButton>
          </article>
        </div>
      </section>

      <!-- ============ SECCIÓN 6 — CTA FINAL ============ -->
      <section class="cta-section relative overflow-hidden border-t border-brand-line py-32">
        <!-- mini-canvas de chispas detrás del texto -->
        <div class="pointer-events-none absolute inset-0">
          <SparkCanvas :count="20" :intensity="ctaLit ? 2.4 : 1" class="h-full w-full" />
        </div>
        <div class="relative z-10 mx-auto flex max-w-[1440px] flex-col items-center px-6 text-center md:px-12">
          <h2 class="cta-headline display-l max-w-4xl text-white">
            <Words text="NOS VEMOS JUNTO AL FUEGO." />
          </h2>
          <div ref="ctaBtnRef" class="cta-buttons mt-12">
            <span class="bonfire-breathe-glow inline-block">
              <CutButton to="/contacto" variant="primary"> CONFIRMA TU ASISTENCIA </CutButton>
            </span>
          </div>
        </div>
      </section>
    </div>
  </ion-page>
</template>

<style>
/* Keyframes locales de la página BONFIRE (pulso de la palabra FUEGO y glow que respira) */
@keyframes bonfire-fire-pulse {
  0%,
  100% {
    text-shadow: 0 0 18px rgba(232, 64, 47, 0.35);
  }
  50% {
    text-shadow: 0 0 34px rgba(245, 130, 31, 0.65);
  }
}
.fire-word {
  color: var(--red);
  animation: bonfire-fire-pulse 2.4s ease-in-out infinite;
}
.bonfire-outline {
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.9);
  color: transparent;
}
@keyframes bonfire-breathe {
  0%,
  100% {
    box-shadow: 0 8px 32px rgba(205, 23, 30, 0.3);
  }
  50% {
    box-shadow: 0 8px 44px rgba(245, 130, 31, 0.55);
  }
}
.bonfire-breathe-glow {
  animation: bonfire-breathe 2s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .fire-word,
  .bonfire-breathe-glow {
    animation: none !important;
  }
}
</style>
