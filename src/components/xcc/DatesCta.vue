<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CutButton from '../CutButton.vue'
import Words from '../home/Words.vue'

gsap.registerPlugin(ScrollTrigger)

interface EventRow {
  fecha: string
  ruta: string
  accent: string
  lugar: string
  estado: 'ULTIMOS' | 'ABIERTO'
}

const EVENTS: EventRow[] = [
  {
    fecha: '14–17 NOV 2025',
    ruta: 'NARANJA — VOLCÁN',
    accent: '#F5821E',
    lugar: 'Volcán Acatenango, GT',
    estado: 'ULTIMOS',
  },
  {
    fecha: '20–23 FEB 2026',
    ruta: 'VERDE — BOSQUE',
    accent: '#007941',
    lugar: 'Sierra de las Minas, GT',
    estado: 'ABIERTO',
  },
  {
    fecha: '15–18 MAY 2026',
    ruta: 'AZUL — RÍO',
    accent: '#004892',
    lugar: 'Río Cahabón, Alta Verapaz',
    estado: 'ABIERTO',
  },
]

const HEADERS = ['FECHA', 'RUTA', 'LUGAR', 'ESTADO', '']

const headerCol = (i: number) =>
  i === 0
    ? 'col-span-2'
    : i === 1
      ? 'col-span-3'
      : i === 2
        ? 'col-span-3'
        : i === 3
          ? 'col-span-2'
          : 'col-span-2 text-right'

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* Header */
    gsap.from('.dates-header > *', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.dates-table', start: 'top 85%' },
    })

    /* Filas desde la izquierda */
    gsap.from('.dates-row', {
      x: -40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.dates-table', start: 'top 80%' },
    })

    /* CTA final: word-split */
    gsap.from('.xcc-cta .word', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.06,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.xcc-cta', start: 'top 80%' },
    })

    /* El botón "se enciende": glow rojo aparece con scrub */
    gsap.fromTo(
      '.xcc-cta-btn',
      { boxShadow: '0 0 0 rgba(205,23,30,0)' },
      {
        boxShadow: '0 8px 48px rgba(205,23,30,0.65)',
        ease: 'none',
        scrollTrigger: {
          trigger: '.xcc-cta',
          start: 'top 75%',
          end: 'top 35%',
          scrub: 0.5,
        },
      }
    )
  }, root.value as Element)
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <section ref="root" class="bg-brand-charcoal py-24 md:py-36">
    <div class="mx-auto max-w-[1440px] px-6 md:px-12">
      <div class="dates-header mb-12">
        <p class="overline mb-5 text-brand-red">PRÓXIMAS FECHAS</p>
        <h2 class="h2-display text-white">EL TERRENO YA ESTÁ MARCADO.</h2>
      </div>

      <!-- Tabla editorial de eventos -->
      <div class="dates-table border-t border-brand-line">
        <!-- Header de columnas (desktop) -->
        <div class="hidden grid-cols-12 gap-4 border-b border-brand-line py-4 lg:grid">
          <span
            v-for="(h, i) in HEADERS"
            :key="h || 'accion'"
            class="overline text-brand-muted"
            :class="headerCol(i)"
          >
            {{ h }}
          </span>
        </div>

        <div
          v-for="e in EVENTS"
          :key="e.fecha"
          class="dates-row grid grid-cols-1 items-center gap-4 border-b border-brand-line px-2 py-6 transition-colors duration-300 hover:bg-brand-charcoal-700 md:px-4 lg:grid-cols-12 lg:gap-4"
        >
          <p
            class="col-span-2 font-display font-expanded text-lg font-extrabold uppercase tracking-tight text-white"
          >
            {{ e.fecha }}
          </p>
          <p class="col-span-3 flex items-center gap-3">
            <span
              aria-hidden="true"
              class="h-2 w-2 shrink-0 rounded-full"
              :style="{ backgroundColor: e.accent }"
            />
            <span class="font-display text-sm font-bold uppercase tracking-[0.18em] text-white">
              {{ e.ruta }}
            </span>
          </p>
          <p class="col-span-3 text-sm text-white/70">{{ e.lugar }}</p>
          <p class="col-span-2">
            <span
              v-if="e.estado === 'ULTIMOS'"
              class="inline-flex animate-pulse items-center gap-2 bg-brand-red px-3 py-1.5 font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white clip-cut"
            >
              ÚLTIMOS LUGARES
            </span>
            <span
              v-else
              class="inline-flex items-center gap-2 border px-3 py-1.5 font-display text-[0.65rem] font-bold uppercase tracking-[0.2em]"
              :style="{ borderColor: e.accent, color: e.accent }"
            >
              ABIERTO
            </span>
          </p>
          <p class="col-span-2 lg:text-right">
            <CutButton
              v-if="e.estado === 'ULTIMOS'"
              to="/contacto"
              variant="primary"
              class="!px-5 !py-2.5 text-xs"
            >
              INSCRIBIRME
            </CutButton>
            <CutButton v-else to="/contacto" variant="ghost" class="!px-5 !py-2.5 text-xs">
              APARTAR
            </CutButton>
          </p>
        </div>
      </div>

      <!-- CTA final -->
      <div class="xcc-cta mt-24 text-center md:mt-32">
        <h2 class="display-l mx-auto max-w-5xl text-white">
          <Words text="TU SILLA JUNTO AL FUEGO ESTÁ VACÍA." />
        </h2>
        <div class="mt-10 inline-block">
          <CutButton to="/contacto" variant="primary" class="xcc-cta-btn">COMIENZA AHORA</CutButton>
        </div>
      </div>
    </div>
  </section>
</template>
