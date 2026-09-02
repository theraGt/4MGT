<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { IonPage } from '@ionic/vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CutButton from '../components/CutButton.vue'
import FlagMark from '../components/FlagMark.vue'
import Chars from '../components/home/Chars.vue'
import Words from '../components/home/Words.vue'

gsap.registerPlugin(ScrollTrigger)

/* ---------- data ---------- */

const MOMENTOS = [
  {
    n: '01',
    hora: '08:00',
    titulo: 'LA LLAMADA',
    desc: 'Apertura: la pregunta que nadie te hace en la semana.',
  },
  {
    n: '02',
    hora: '10:30',
    titulo: 'HISTORIAS DE FUEGO',
    desc: 'Hombres reales contando caídas y regresos. Sin filtros.',
  },
  {
    n: '03',
    hora: '14:00',
    titulo: 'EL RETO',
    desc: 'Dinámicas físicas y de equipo que sacan lo que traes dentro.',
  },
  {
    n: '04',
    hora: '17:00',
    titulo: 'LA DECISIÓN',
    desc: 'Cierre junto al fuego: una decisión concreta para tu vida.',
  },
]

const PERFILES = [
  {
    titulo: 'EL QUE BUSCA',
    desc: 'Sientes que hay algo más, pero no sabes dónde encontrarlo.',
    icon: 'compass',
  },
  {
    titulo: 'EL QUE ESTÁ CANSADO',
    desc: 'Cumples con todo, pero por dentro vas en automático.',
    icon: 'flame',
  },
  {
    titulo: 'EL QUE QUIERE CRECER',
    desc: 'Buscas hermanos que te reten a ser mejor hombre, padre y líder.',
    icon: 'sword',
  },
]

/* ---------- página ---------- */

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

const onImgLoad = () => ScrollTrigger.refresh()
const scrollToQueEs = () =>
  document.getElementById('que-es-arise')?.scrollIntoView({ behavior: 'smooth' })

onMounted(() => {
  ctx = gsap.context(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    /* ===== HERO: secuencia de carga — la palabra se "levanta" ===== */
    const intro = gsap.timeline({ delay: 0.55, defaults: { ease: 'power4.out' } })
    intro
      .from('.hero-flag', { y: -160, rotation: 4, duration: 0.5 })
      .from('.hero-overline-inner', { xPercent: -105, duration: 0.4 }, '-=0.15')
      .from(
        '.hero-headline .char',
        { yPercent: 110, rotateX: 50, opacity: 0, duration: 1.1, stagger: 0.05 },
        '-=0.1'
      )
      // destello de luz cruzando el horizonte
      .fromTo(
        '.hero-flash',
        { scaleX: 0, opacity: 0.9 },
        { scaleX: 1, opacity: 0, duration: 0.9, ease: 'power3.out' },
        '-=0.25'
      )
      .from('.hero-sub, .hero-ctas, .hero-meta', { y: 24, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.5')

    /* ===== HERO: parallax de scroll ===== */
    gsap.to('.hero-bg-img', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 0.6 },
    })
    gsap.to('.hero-headline', {
      y: -50,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: '70% top', scrub: 0.6 },
    })

    /* ===== ¿QUÉ ES ARISE? ===== */
    gsap.from('.que-es-h2 .word', {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.05,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#que-es-arise', start: 'top 78%' },
    })
    gsap.from('.que-es-left .overline, .que-es-left .flagmark', {
      y: 24,
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#que-es-arise', start: 'top 80%' },
    })
    // clip-reveal por bloque de línea
    gsap.from('.reveal-line > span', {
      yPercent: 110,
      duration: 0.9,
      stagger: 0.14,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.que-es-body', start: 'top 78%' },
    })
    gsap.from('.xcc-link', {
      x: -40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.xcc-link', start: 'top 88%' },
    })

    /* ===== UN DÍA, CUATRO MOMENTOS ===== */
    gsap.from('.momentos-header > *', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.momentos-section', start: 'top 80%' },
    })
    gsap.from('.momento-card', {
      y: 60,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.momentos-grid', start: 'top 80%' },
    })
    // números: de outline a relleno blanco al 50% del viewport
    gsap.to('.momento-num', {
      color: '#ffffff',
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.momentos-grid', start: 'top 50%' },
    })

    /* ===== BANDA ROJA "INSPIRATION. JUSTICE." ===== */
    gsap.fromTo(
      '.band-inner',
      { clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)' },
      {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 0.8,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: '.band-section', start: 'top 75%' },
      }
    )
    gsap.from('.band-quote .char', {
      yPercent: 110,
      opacity: 0,
      duration: 0.8,
      stagger: 0.02,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.band-section', start: 'top 70%' },
    })
    gsap.from('.band-overline', {
      opacity: 0,
      y: 16,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.band-section', start: 'top 65%' },
    })

    /* ===== PARA QUIÉN ES ===== */
    gsap.from('.perfiles-header > *', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.perfiles-section', start: 'top 80%' },
    })
    gsap.from('.perfil-card', {
      y: 50,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.perfiles-grid', start: 'top 80%' },
    })
    // íconos que se dibujan (stroke-dashoffset)
    gsap.fromTo(
      '.icon-draw',
      { strokeDasharray: 100, strokeDashoffset: 100 },
      {
        strokeDashoffset: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: '.perfiles-grid', start: 'top 75%' },
      }
    )
    gsap.from('.perfiles-cierre', {
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.perfiles-cierre', start: 'top 90%' },
    })

    /* ===== CTA FINAL: eco del reveal del hero ===== */
    gsap.from('.cta-flag', {
      y: -140,
      rotation: 4,
      duration: 0.5,
      ease: 'bounce.out',
      scrollTrigger: { trigger: '.cta-section', start: 'top 75%' },
    })
    gsap.from('.cta-headline .char', {
      yPercent: 110,
      rotateX: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.05,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.cta-section', start: 'top 70%' },
    })
    gsap.from('.cta-sub, .cta-buttons', {
      y: 30,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.cta-section', start: 'top 62%' },
    })
  }, root.value as Element)
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <ion-page>
    <div ref="root" class="bg-brand-charcoal-900">
      <!-- ============ SECCIÓN 1 — HERO "LEVÁNTATE." ============ -->
      <section class="hero-section relative -mt-20 flex min-h-[85dvh] flex-col overflow-hidden">
        <!-- Fondo -->
        <div class="absolute inset-0 overflow-hidden">
          <img
            src="/arise-hero.jpg"
            alt="Hombre con los brazos abiertos en la cima de un volcán al amanecer"
            class="hero-bg-img h-[115%] w-full object-cover"
            @load="onImgLoad"
          />
          <div
            class="absolute inset-0"
            :style="{
              background:
                'linear-gradient(180deg, rgba(18,18,18,0.45), rgba(18,18,18,0.15) 55%, #121212 100%)',
            }"
          />
        </div>

        <!-- Rayos de sol animados (ligeros, blend screen) -->
        <div
          aria-hidden="true"
          class="absolute inset-0 overflow-hidden mix-blend-screen opacity-15 pointer-events-none"
        >
          <div
            class="arise-rays absolute -top-[40%] left-1/2 h-[160%] w-[160%] -translate-x-1/2"
            :style="{
              background:
                'conic-gradient(from 0deg at 50% 35%, transparent 0deg, rgba(255,196,107,0.5) 6deg, transparent 14deg, transparent 42deg, rgba(255,170,80,0.4) 50deg, transparent 60deg, transparent 96deg, rgba(255,196,107,0.45) 104deg, transparent 116deg, transparent 160deg, rgba(255,170,80,0.35) 168deg, transparent 178deg, transparent 360deg)',
            }"
          />
          <div
            class="arise-rays-slow absolute -top-[40%] left-1/2 h-[160%] w-[160%] -translate-x-1/2"
            :style="{
              background:
                'conic-gradient(from 30deg at 50% 35%, transparent 0deg, rgba(255,214,150,0.35) 10deg, transparent 22deg, transparent 78deg, rgba(255,196,107,0.3) 88deg, transparent 100deg, transparent 200deg, rgba(255,214,150,0.3) 212deg, transparent 226deg, transparent 360deg)',
            }"
          />
        </div>

        <!-- Destello de luz en el horizonte -->
        <div
          aria-hidden="true"
          class="hero-flash pointer-events-none absolute left-0 top-[52%] z-10 h-[3px] w-full origin-center mix-blend-screen"
          :style="{
            background:
              'linear-gradient(90deg, transparent, rgba(255,220,170,0.9) 35%, rgba(255,255,255,1) 50%, rgba(255,220,170,0.9) 65%, transparent)',
          }"
        />

        <!-- Contenido abajo-izquierda -->
        <div
          class="relative z-20 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-6 pb-20 pt-28 md:px-12"
        >
          <div class="hero-flag mb-8 flex h-[62px] w-12 items-center justify-center bg-brand-red clip-cut">
            <span class="font-display text-3xl font-black leading-none text-white">4</span>
          </div>
          <div class="mb-6 overflow-hidden">
            <p class="hero-overline-inner overline text-brand-red">PROGRAMA ARISE</p>
          </div>
          <h1
            class="hero-headline mb-8 font-display font-expanded font-black uppercase leading-[0.92] tracking-[-0.03em] text-white"
            style="font-size: clamp(4rem, 14vw, 11rem); perspective: 900px"
            aria-label="Levántate."
          >
            <span class="block overflow-hidden pb-2">
              <Chars text="LEVÁNTATE." />
            </span>
          </h1>
          <p class="hero-sub mb-10 max-w-xl font-body text-lg leading-[1.7] text-white/85">
            Un día para despertar el corazón, encender el propósito y levantarte como el hombre
            que estás llamado a ser.
          </p>
          <div class="hero-ctas flex flex-wrap items-center gap-4">
            <CutButton to="/contacto" variant="primary"> ÚNETE AL PRÓXIMO ARISE </CutButton>
            <CutButton variant="ghost" @click="scrollToQueEs"> ¿QUÉ ES ARISE? </CutButton>
          </div>
          <p class="hero-meta overline mt-10 text-white/60">
            1 DÍA · ABIERTO A TODOS LOS HOMBRES · CIUDAD DE GUATEMALA
          </p>
        </div>
      </section>

      <!-- ============ SECCIÓN 2 — ¿QUÉ ES ARISE? ============ -->
      <section id="que-es-arise" class="relative py-24 md:py-36">
        <div class="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-6 md:px-12 lg:grid-cols-12">
          <div class="que-es-left lg:col-span-5">
            <div class="lg:sticky lg:top-32">
              <FlagMark class="flagmark mb-6 h-4 w-3" />
              <p class="overline mb-6 text-brand-red">EL PROGRAMA</p>
              <h2 class="que-es-h2 display-l text-white">
                <Words text="TODO HOMBRE NECESITA" />
                {{ ' ' }}
                <span class="flag-block">
                  <Words text="DESPERTAR." />
                </span>
              </h2>
            </div>
          </div>
          <div class="que-es-body lg:col-span-7 lg:pt-24">
            <div class="reveal-line overflow-hidden">
              <span class="block font-body text-xl leading-[1.7] text-white/85 md:text-2xl">
                ARISE es un encuentro de un día que reúne a hombres de todas las edades y caminos.
                A través de historias reales, retos prácticos y momentos de honestidad brutal,
                ARISE enciende las tres preguntas del corazón: ¿por qué estás aquí?, ¿qué
                quieres?, ¿para qué vives?
              </span>
            </div>
            <div class="reveal-line mt-8 overflow-hidden">
              <span class="block font-body text-xl leading-[1.7] text-white/85 md:text-2xl">
                Es el primer paso. Muchos de los hombres que hoy caminan en el XCC comenzaron en
                una silla de ARISE.
              </span>
            </div>
            <div class="xcc-link mt-12">
              <CutButton to="/xcc" variant="arrow" class="text-base">
                El siguiente paso: XCC
              </CutButton>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ SECCIÓN 3 — UN DÍA, CUATRO MOMENTOS ============ -->
      <section class="momentos-section border-t border-brand-line py-24 md:py-36">
        <div class="mx-auto max-w-[1440px] px-6 md:px-12">
          <div class="momentos-header mb-16">
            <p class="overline mb-6 text-brand-red">EL FORMATO</p>
            <h2 class="h2-display text-white">UN DÍA. CUATRO MOMENTOS.</h2>
          </div>
          <div class="momentos-grid grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <article
              v-for="m in MOMENTOS"
              :key="m.n"
              class="momento-card group relative border border-brand-line bg-brand-charcoal clip-cut p-8 pt-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <!-- borde superior rojo que se dibuja en hover -->
              <span
                aria-hidden="true"
                class="absolute left-0 top-0 h-[2px] w-full origin-left scale-x-0 bg-brand-red transition-transform duration-500 group-hover:scale-x-100"
              />
              <div class="flex items-start justify-between">
                <span class="momento-num numeral text-outline">{{ m.n }}</span>
                <span class="overline pt-3 text-brand-red">{{ m.hora }}</span>
              </div>
              <h3 class="h3-display mt-6 text-white">{{ m.titulo }}</h3>
              <p class="mt-4 font-body text-sm leading-[1.7] text-brand-muted">{{ m.desc }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- ============ SECCIÓN 4 — BANDA ROJA "INSPIRATION. JUSTICE." ============ -->
      <section class="band-section px-6 py-12 md:px-12">
        <div class="clip-cut-lg">
          <div class="band-inner relative overflow-hidden bg-brand-red py-20">
            <!-- sweep de luz blanca cada 6s -->
            <div
              aria-hidden="true"
              class="band-sweep pointer-events-none absolute inset-y-0 left-0 w-1/4 opacity-10"
              :style="{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
              }"
            />
            <div class="mx-auto max-w-[1440px] px-6 text-center md:px-12">
              <p
                class="font-display font-expanded font-black uppercase leading-[0.95] tracking-[-0.02em] text-white"
                style="font-size: clamp(2rem, 4.5vw, 3.75rem)"
              >
                <span class="band-quote block overflow-hidden pb-1">
                  <Chars text="INSPIRATION. JUSTICE." />
                </span>
              </p>
              <p class="band-overline overline mt-6 text-white/80">EL LEMA DEL MOVIMIENTO 4M</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ SECCIÓN 5 — PARA QUIÉN ES ============ -->
      <section class="perfiles-section py-24 md:py-36">
        <div class="mx-auto max-w-[1440px] px-6 md:px-12">
          <div class="perfiles-header mb-16 text-center">
            <p class="overline mb-6 text-brand-red">¿ES PARA TI?</p>
            <h2 class="h2-display text-white">HECHO PARA HOMBRES COMO TÚ.</h2>
          </div>
          <div class="perfiles-grid grid grid-cols-1 gap-6 md:grid-cols-3">
            <article
              v-for="p in PERFILES"
              :key="p.titulo"
              class="perfil-card group bg-brand-charcoal-700 clip-cut p-10 transition-transform duration-300 hover:-translate-y-1 hover:rotate-[0.5deg]"
            >
              <div class="text-brand-red transition-transform duration-300 group-hover:rotate-[8deg]">
                <!-- Brújula -->
                <svg
                  v-if="p.icon === 'compass'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-10 w-10"
                >
                  <circle cx="12" cy="12" r="9" pathLength="100" class="icon-draw" />
                  <path d="M15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5Z" pathLength="100" class="icon-draw" />
                </svg>
                <!-- Llama -->
                <svg
                  v-else-if="p.icon === 'flame'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-10 w-10"
                >
                  <path
                    d="M12 3C12 3 6 9 6 14a6 6 0 0 0 12 0c0-2-1-3.5-2-5-.5 1.2-1.2 2-2 2.5C14 9.5 13 6 12 3Z"
                    pathLength="100"
                    class="icon-draw"
                  />
                  <path
                    d="M12 21a3 3 0 0 1-3-3c0-1.5 1-2.5 3-4 2 1.5 3 2.5 3 4a3 3 0 0 1-3 3Z"
                    pathLength="100"
                    class="icon-draw"
                  />
                </svg>
                <!-- Espada -->
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-10 w-10"
                >
                  <path d="M4 20 14.5 9.5M14.5 9.5 13 4l7 7-5.5 1.5M14.5 9.5 13 11" pathLength="100" class="icon-draw" />
                  <path d="M6.5 14.5 9.5 17.5M4 20l1.5-3L8 18.5 4 20Z" pathLength="100" class="icon-draw" />
                </svg>
              </div>
              <h3 class="h3-display mt-8 text-white">{{ p.titulo }}</h3>
              <p class="mt-4 font-body text-sm leading-[1.7] text-white/75">{{ p.desc }}</p>
            </article>
          </div>
          <div class="perfiles-cierre mt-14 text-center">
            <CutButton to="/contacto" variant="arrow" class="text-base">
              Escríbenos y te contamos
            </CutButton>
          </div>
        </div>
      </section>

      <!-- ============ SECCIÓN 6 — CTA FINAL "DESPIERTA." ============ -->
      <section class="cta-section border-t border-brand-line py-36">
        <div class="mx-auto flex max-w-[1440px] flex-col items-center px-6 text-center md:px-12">
          <div class="cta-flag mb-10 flex h-[62px] w-12 items-center justify-center bg-brand-red clip-cut">
            <span class="font-display text-3xl font-black leading-none text-white">4</span>
          </div>
          <h2 class="cta-headline display-l text-white" style="perspective: 900px" aria-label="Despierta.">
            <span class="block overflow-hidden pb-2">
              <Chars text="DESPIERTA." />
            </span>
          </h2>
          <p class="cta-sub mt-8 max-w-lg font-body text-lg leading-[1.7] text-white/85">
            El próximo ARISE está cerca. Tu lugar te está esperando.
          </p>
          <div class="mt-12">
            <span class="arise-breathe-glow inline-block">
              <CutButton to="/contacto" variant="primary"> QUIERO MI LUGAR </CutButton>
            </span>
          </div>
        </div>
      </section>
    </div>
  </ion-page>
</template>

<style>
/* Keyframes locales de la página ARISE (rayos de sol, sweep de banda, glow que respira) */
@keyframes arise-rays-spin {
  to {
    transform: rotate(360deg);
  }
}
.arise-rays {
  animation: arise-rays-spin 90s linear infinite;
  transform-origin: 50% 35%;
}
.arise-rays-slow {
  animation: arise-rays-spin 140s linear infinite reverse;
  transform-origin: 50% 35%;
}
@keyframes arise-band-sweep {
  0% {
    transform: translateX(-160%) skewX(-18deg);
  }
  55%,
  100% {
    transform: translateX(320%) skewX(-18deg);
  }
}
.band-sweep {
  animation: arise-band-sweep 6s ease-in-out infinite;
}
@keyframes arise-breathe {
  0%,
  100% {
    box-shadow: 0 8px 32px rgba(205, 23, 30, 0.3);
  }
  50% {
    box-shadow: 0 8px 44px rgba(205, 23, 30, 0.6);
  }
}
.arise-breathe-glow {
  animation: arise-breathe 2s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .arise-rays,
  .arise-rays-slow,
  .band-sweep,
  .arise-breathe-glow {
    animation: none !important;
  }
}
</style>
