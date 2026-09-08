<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const MOMENTS = [
  {
    h: '00',
    title: 'EL PUNTO DE PARTIDA.',
    text: 'Entregas tu teléfono. Conoces a tu equipo. La ciudad queda atrás.',
  },
  {
    h: '06',
    title: 'LA PRIMERA CUMBRE.',
    text: 'El cuerpo protesta. La mente empieza a callar.',
  },
  {
    h: '24',
    title: 'EL FUEGO.',
    text: 'Primera noche de fogata. Historias reales. Nadie actúa.',
  },
  {
    h: '36',
    title: 'LA PREGUNTA.',
    text: '¿Para qué vives? El silencio responde.',
  },
  {
    h: '60',
    title: 'HERMANOS.',
    text: 'Ya no son extraños. Son tu banda.',
  },
  {
    h: '72',
    title: 'EL REGRESO.',
    text: 'Vuelves distinto. Tu familia lo va a notar.',
  },
]

const root = ref<HTMLElement | null>(null)
const hourRef = ref<HTMLSpanElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    const mm = gsap.matchMedia()

    /* ===== Desktop: pin + scrub storytelling ===== */
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const moments = gsap.utils.toArray<HTMLElement>('.tl-moment')
      const fill = root.value?.querySelector<HTMLElement>('.tl-fill')
      const counter = hourRef.value
      const N = MOMENTS.length
      const proxy = { v: 0 }
      let lastHour = -1

      gsap.set(moments, { opacity: 0, y: 60 })
      gsap.set(moments[0], { opacity: 1, y: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.value,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      })

      moments.forEach((m, i) => {
        if (i > 0) {
          tl.fromTo(m, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' }, i)
        }
        if (i < N - 1) {
          tl.to(m, { y: -40, opacity: 0, duration: 0.45, ease: 'power2.in' }, i + 0.55)
        }
      })

      /* Línea de progreso vertical que se llena de rojo */
      if (fill) {
        tl.fromTo(fill, { scaleY: 0 }, { scaleY: 1, duration: N, transformOrigin: 'top' }, 0)
      }

      /* Contador de horas: interpola 00 → 72 con snap y pulso rojo */
      tl.to(
        proxy,
        {
          v: 72,
          duration: N,
          snap: { v: 1 },
          onUpdate: () => {
            const hour = Math.round(proxy.v)
            if (hour !== lastHour && counter) {
              lastHour = hour
              counter.textContent = String(hour).padStart(2, '0')
              gsap.fromTo(
                counter,
                { scale: 1.07 },
                { scale: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' }
              )
            }
          },
        },
        0
      )
    })

    /* ===== Móvil / reduced-motion: lista vertical con reveals estándar ===== */
    mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
      if (hourRef.value) hourRef.value.textContent = '72'
      gsap.utils.toArray<HTMLElement>('.tl-moment').forEach((m) => {
        gsap.from(m, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: m, start: 'top 85%' },
        })
      })
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      if (hourRef.value) hourRef.value.textContent = '72'
    })
  }, root.value as Element)
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <section ref="root" class="relative overflow-hidden bg-brand-charcoal-900">
    <div
      class="mx-auto flex min-h-0 w-full max-w-[1440px] flex-col px-6 py-24 md:px-12 lg:min-h-[100dvh] lg:flex-row lg:items-center lg:gap-16 lg:py-0"
    >
      <!-- Izquierda: contador gigante -->
      <div class="mb-14 lg:mb-0 lg:w-[42%] lg:shrink-0">
        <p class="overline mb-6 text-brand-muted">EL RECORRIDO</p>
        <p class="overline mb-2 text-brand-red">HORA</p>
        <p class="font-display font-expanded font-black leading-none text-brand-red">
          <span
            ref="hourRef"
            class="inline-block origin-left text-[clamp(4.5rem,10vw,8rem)] will-change-transform"
          >00</span>
        </p>
        <p
          class="mt-4 font-display text-sm font-semibold uppercase tracking-[0.25em] text-brand-muted"
        >
          DE LA HORA 00 A LA 72
        </p>
      </div>

      <!-- Derecha: momentos -->
      <div class="relative lg:h-[64dvh] lg:flex-1">
        <!-- Línea de progreso vertical -->
        <div
          aria-hidden="true"
          class="absolute left-0 top-0 hidden h-full w-px bg-brand-line lg:block"
        >
          <span class="tl-fill block h-full w-full origin-top scale-y-0 bg-brand-red" />
        </div>

        <article
          v-for="m in MOMENTS"
          :key="m.h"
          class="tl-moment border-l border-brand-line py-8 pl-8 will-change-transform lg:absolute lg:inset-0 lg:flex lg:flex-col lg:justify-center lg:border-l-0 lg:py-0 lg:pl-14"
        >
          <p class="overline mb-4 text-brand-red">HORA {{ m.h }}</p>
          <h3 class="h3-display mb-4 text-white">{{ m.title }}</h3>
          <p class="max-w-md text-base leading-[1.7] text-white/80 md:text-lg">{{ m.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
