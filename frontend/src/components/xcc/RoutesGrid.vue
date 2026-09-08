<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { star, starOutline } from 'ionicons/icons'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CutButton from '../CutButton.vue'

gsap.registerPlugin(ScrollTrigger)

interface RouteDef {
  chip: string
  terrain: string
  img: string
  accent: string
  difficulty: number // de 4
  desc: string
  meta: string
}

const ROUTES: RouteDef[] = [
  {
    chip: 'RUTA AZUL',
    terrain: 'RÍO',
    img: '/route-blue.jpg',
    accent: '#004892',
    difficulty: 2,
    desc: 'Cruces de río de montaña, agua fría y trabajo en equipo puro.',
    meta: '32 KM · 850 M DESNIVEL',
  },
  {
    chip: 'RUTA VERDE',
    terrain: 'BOSQUE',
    img: '/route-green.jpg',
    accent: '#007941',
    difficulty: 3,
    desc: 'Bosque nuboso denso, senderos de niebla y silencio total.',
    meta: '38 KM · 1,200 M DESNIVEL',
  },
  {
    chip: 'RUTA AMARILLA',
    terrain: 'PÁRAMO',
    img: '/route-yellow.jpg',
    accent: '#DCA90D',
    difficulty: 3,
    desc: 'Páramo dorado abierto al viento, cielo inmenso y paso constante.',
    meta: '41 KM · 1,050 M DESNIVEL',
  },
  {
    chip: 'RUTA NARANJA',
    terrain: 'VOLCÁN',
    img: '/route-orange.jpg',
    accent: '#F5821E',
    difficulty: 4,
    desc: 'Ascenso rocoso con cuerdas sobre piedra volcánica. La prueba mayor.',
    meta: '29 KM · 1,600 M DESNIVEL',
  },
]

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.from('.routes-header > *', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: root.value, start: 'top 80%' },
    })
    gsap.from('.route-card', {
      y: 90,
      rotation: 2,
      opacity: 0,
      duration: 1,
      stagger: 0.12,
      ease: 'power3.out',
      // limpia el transform inline para que el tilt de hover (Tailwind) funcione
      clearProps: 'transform',
      scrollTrigger: { trigger: '.routes-grid', start: 'top 80%' },
    })
  }, root.value as Element)
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <section ref="root" id="rutas" class="scroll-mt-20 py-24 md:py-36">
    <div class="mx-auto max-w-[1440px] px-6 md:px-12">
      <div class="routes-header mb-14">
        <p class="overline mb-5 text-brand-red">ELIGE TU TERRENO</p>
        <h2 class="h2-display max-w-3xl text-white">CUATRO RUTAS. UNA DECISIÓN.</h2>
      </div>

      <div class="routes-grid grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="r in ROUTES"
          :key="r.chip"
          class="route-card group relative flex flex-col bg-brand-charcoal-700 clip-cut-lg transition-transform duration-500 will-change-transform hover:[transform:perspective(900px)_rotateX(2.5deg)_rotateY(-3deg)]"
        >
          <!-- Imagen + bandera + chip -->
          <div class="relative overflow-hidden">
            <img
              :src="r.img"
              :alt="`${r.chip} — ${r.terrain}`"
              loading="lazy"
              class="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-brand-charcoal-700 via-transparent to-transparent"
            />
            <!-- Bandera roja top-left, indentada su propio ancho -->
            <span
              aria-hidden="true"
              class="absolute left-3 top-0 flex h-8 w-6 items-center justify-center bg-brand-red clip-cut"
            >
              <span class="font-display text-xs font-black text-white">4</span>
            </span>
            <!-- Chip de ruta con color de acento -->
            <span
              class="absolute bottom-3 left-3 inline-flex items-center gap-2 border px-3 py-1.5 font-display text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white backdrop-blur-sm"
              :style="{ borderColor: r.accent, backgroundColor: 'rgba(18,18,18,0.55)' }"
            >
              <span
                aria-hidden="true"
                class="h-1.5 w-1.5 rounded-full animate-pulse-dot"
                :style="{ backgroundColor: r.accent }"
              />
              {{ r.chip }}
            </span>
          </div>

          <!-- Cuerpo -->
          <div class="flex flex-1 flex-col p-6">
            <div class="mb-3 flex items-center justify-between gap-3">
              <h3 class="h3-display text-white">{{ r.terrain }}</h3>
              <span
                class="flex items-center gap-0.5"
                :aria-label="`Dificultad ${r.difficulty} de 4`"
              >
                <ion-icon
                  v-for="i in 4"
                  :key="i"
                  :icon="i <= r.difficulty ? star : starOutline"
                  class="text-[13px]"
                  :class="i <= r.difficulty ? 'text-brand-flame' : 'text-brand-line'"
                />
              </span>
            </div>
            <p class="mb-5 text-sm leading-relaxed text-white/70">{{ r.desc }}</p>
            <p
              class="mb-6 font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted"
            >
              {{ r.meta }}
            </p>
            <div class="mt-auto">
              <CutButton variant="arrow" to="/contacto" class="text-xs">Ver detalle</CutButton>
            </div>
          </div>

          <!-- Barra inferior del color de ruta que se dibuja en hover -->
          <span
            aria-hidden="true"
            class="absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
            :style="{ backgroundColor: r.accent }"
          />
        </article>
      </div>
    </div>
  </section>
</template>
