<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { checkmark, close } from 'ionicons/icons'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const NO_HAY = ['Sin señal', 'Sin reloj', 'Sin comodidades', 'Sin máscaras']
const SI_HAY = ['Silencio', 'Esfuerzo real', 'Hermandad', 'Verdad']

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* Headline: reveal de líneas enmascaradas */
    gsap.from('.quees-line > span', {
      yPercent: 110,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: root.value, start: 'top 75%' },
    })
    gsap.from('.quees-body > *', {
      y: 32,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: root.value, start: 'top 70%' },
    })

    /* Bloques de listas desde lados opuestos */
    gsap.from('.quees-no', {
      x: -40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.quees-lists', start: 'top 80%' },
    })
    gsap.from('.quees-si', {
      x: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.quees-lists', start: 'top 80%' },
    })
    gsap.from('.quees-item', {
      y: 18,
      opacity: 0,
      duration: 0.5,
      stagger: 0.07,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.quees-lists', start: 'top 75%' },
    })
    gsap.from('.quees-icon', {
      scale: 0,
      duration: 0.5,
      stagger: 0.07,
      ease: 'back.out(2.2)',
      scrollTrigger: { trigger: '.quees-lists', start: 'top 75%' },
    })
  }, root.value as Element)
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <section ref="root" class="py-24 md:py-36">
    <div
      class="mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-6 md:px-12 lg:grid-cols-12 lg:gap-10"
    >
      <!-- Izquierda: headline + body -->
      <div class="lg:col-span-6">
        <p class="overline mb-6 text-brand-muted">¿QUÉ ES EL XCC?</p>
        <h2 class="h2-display text-white">
          <span class="quees-line block overflow-hidden">
            <span class="block">NO ES UN RETIRO.</span>
          </span>
          <span class="quees-line block overflow-hidden">
            <span class="block">ES UN</span>
          </span>
          <span class="quees-line mt-2 block overflow-hidden pb-1">
            <span class="flag-block">ENFRENTAMIENTO.</span>
          </span>
        </h2>
        <div class="quees-body mt-8 max-w-xl space-y-5 text-base leading-[1.7] text-white/85 md:text-lg">
          <p>
            El XCC es una aventura de 72 horas en la naturaleza, diseñada para empujarte más
            allá de tu zona de confort. Sin teléfonos. Sin distracciones. Solo tú, tu equipo,
            el terreno y las preguntas que llevas años evitando.
          </p>
          <p>
            Caminarás, escalarás, acamparás y te sentarás junto al fuego con otros hombres que
            buscan lo mismo: volver a casa siendo mejores hijos, esposos, padres y líderes.
          </p>
        </div>
      </div>

      <!-- Derecha: LO QUE NO HAY / LO QUE SÍ HAY -->
      <div class="quees-lists flex flex-col gap-6 lg:col-span-6 lg:col-start-7">
        <div class="quees-no border border-brand-line p-8">
          <h3 class="overline mb-6 text-brand-red">LO QUE NO HAY</h3>
          <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <li v-for="item in NO_HAY" :key="item" class="quees-item flex items-center gap-3">
              <span
                class="quees-icon flex h-7 w-7 shrink-0 items-center justify-center border border-brand-red/40"
              >
                <ion-icon :icon="close" class="text-brand-red text-sm" />
              </span>
              <span
                class="font-display text-sm font-semibold uppercase tracking-[0.12em] text-brand-muted"
              >
                {{ item }}
              </span>
            </li>
          </ul>
        </div>
        <div class="quees-si border border-brand-line p-8">
          <h3 class="overline mb-6 text-white">LO QUE SÍ HAY</h3>
          <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <li v-for="item in SI_HAY" :key="item" class="quees-item flex items-center gap-3">
              <span
                class="quees-icon flex h-7 w-7 shrink-0 items-center justify-center border border-white/30"
              >
                <ion-icon :icon="checkmark" class="text-sm text-white" />
              </span>
              <span
                class="font-display text-sm font-semibold uppercase tracking-[0.12em] text-white"
              >
                {{ item }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
