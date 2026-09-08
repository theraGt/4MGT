<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FlagMark from './FlagMark.vue'
import { NAV_LINKS } from './nav-links'

gsap.registerPlugin(ScrollTrigger)

const PROGRAMAS = [
  { label: 'XCC', to: '/xcc' },
  { label: 'ARISE', to: '/arise' },
  { label: 'BONFIRE', to: '/bonfire' },
  { label: 'FATHER SON', to: '/xcc' },
  { label: 'FATHER DAUGHTER', to: '/xcc' },
]

const email = ref('')
const rootRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    // Bandera outline gigante con parallax lento (equiv. framer useScroll 12%→0%)
    gsap.fromTo(
      '.footer-flag',
      { yPercent: 12 },
      {
        yPercent: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.value,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      }
    )
  }, rootRef.value as Element)
})

onUnmounted(() => ctx?.revert())

const submit = () => {
  email.value = ''
}
</script>

<template>
  <footer
    ref="rootRef"
    class="relative overflow-hidden border-t border-brand-line bg-brand-charcoal-900"
  >
    <!-- Bandera outline gigante con parallax lento -->
    <img
      src="/flag-outline.svg"
      alt=""
      aria-hidden="true"
      class="footer-flag pointer-events-none absolute -right-[6vw] top-8 h-[40dvh] opacity-60"
    />

    <div class="relative mx-auto max-w-[1440px] px-6 md:px-12 pt-20 pb-10">
      <!-- Fila 1: logo + tagline -->
      <div class="flex flex-col gap-6 border-b border-brand-line pb-12">
        <router-link to="/" class="flex items-center gap-3" aria-label="4MGT Inicio">
          <span class="flex h-12 w-[38px] items-center justify-center bg-brand-red clip-cut">
            <span class="font-display font-black text-white text-2xl leading-none">4</span>
          </span>
          <span
            class="font-display font-expanded font-black text-white text-4xl tracking-tight leading-none"
          >
            M<sup class="text-brand-red text-base font-extrabold align-super">GT</sup>
          </span>
        </router-link>
        <p
          class="font-display font-expanded font-extrabold uppercase tracking-tight text-2xl md:text-4xl"
        >
          <span class="text-white">ORDINARY PEOPLE </span>
          <span class="text-brand-red">| EXTRAORDINARY LIVES</span>
        </p>
      </div>

      <!-- Fila 2: grid 4 col -->
      <div class="grid grid-cols-2 gap-10 py-12 md:grid-cols-4">
        <div>
          <h4 class="overline text-brand-red mb-5">Explorar</h4>
          <ul class="flex flex-col gap-3">
            <li v-for="l in NAV_LINKS" :key="l.to">
              <router-link
                :to="l.to"
                class="text-sm text-white/70 transition-colors hover:text-white"
              >
                {{ l.label }}
              </router-link>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="overline text-brand-red mb-5">Programas</h4>
          <ul class="flex flex-col gap-3">
            <li v-for="l in PROGRAMAS" :key="l.label">
              <router-link
                :to="l.to"
                class="text-sm text-white/70 transition-colors hover:text-white"
              >
                {{ l.label }}
              </router-link>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="overline text-brand-red mb-5">Contacto</h4>
          <ul class="flex flex-col gap-3 text-sm text-white/70">
            <li>Guatemala, Centroamérica</li>
            <li>
              <a href="mailto:hola@4mgt.org" class="transition-colors hover:text-white">
                hola@4mgt.org
              </a>
            </li>
            <li>
              <a href="tel:+50200000000" class="transition-colors hover:text-white">
                +502 0000 0000
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="overline text-brand-red mb-5">Newsletter</h4>
          <p class="mb-4 text-sm text-white/70">
            Noticias del movimiento y próximas fechas del XCC.
          </p>
          <form class="flex" @submit.prevent="submit">
            <input
              v-model="email"
              type="email"
              required
              placeholder="tu@email.com"
              class="min-w-0 flex-1 border border-brand-line bg-transparent px-4 py-3 text-sm text-white placeholder:text-brand-muted focus:border-brand-red focus:outline-none"
            />
            <button
              type="submit"
              class="clip-cut shrink-0 bg-brand-red px-5 font-display text-xs font-bold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:ember-glow"
            >
              IR
            </button>
          </form>
        </div>
      </div>

      <!-- Fila 3: legal -->
      <div
        class="flex flex-col items-start gap-4 border-t border-brand-line pt-8 text-xs text-brand-muted md:flex-row md:items-center"
      >
        <span>© 2025 4M Guatemala</span>
        <FlagMark class="h-3 w-[9px]" />
        <span>4M es un movimiento mundial de hombres</span>
        <FlagMark class="h-3 w-[9px]" />
        <div class="flex gap-6 md:ml-auto">
          <router-link to="/contacto" class="transition-colors hover:text-white">
            Privacidad
          </router-link>
          <router-link to="/contacto" class="transition-colors hover:text-white">
            Términos
          </router-link>
          <router-link to="/login" class="transition-colors hover:text-white">
            Acceso miembros
          </router-link>
        </div>
      </div>
    </div>
  </footer>
</template>
