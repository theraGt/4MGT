<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar.vue'
import { NAV_HEIGHT } from './components/nav-links'
import Footer from './components/Footer.vue'
import Cursor from './components/Cursor.vue'
import PageTransition from './components/PageTransition.vue'

gsap.registerPlugin(ScrollTrigger)

/**
 * Layout global. El Navbar es FIXED (transparente → blur tras scroll),
 * por eso el content slot agrega el offset superior (NAV_HEIGHT).
 * Los heroes full-bleed optan por salir dentro de la página (-mt-20),
 * las páginas NO compensan la altura del nav por su cuenta.
 *
 * SCROLL: Opción B — scroll de window normal. Las vistas NO usan
 * ion-content (ver ARCHITECTURE.md).
 */
const route = useRoute()

let lenis: Lenis | null = null
const raf = (time: number) => lenis?.raf(time * 1000)

onMounted(() => {
  // Lenis smooth scroll global (lerp 0.09) sincronizado con ScrollTrigger
  lenis = new Lenis({ lerp: 0.09 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
})

onUnmounted(() => {
  gsap.ticker.remove(raf)
  lenis?.destroy()
  lenis = null
})

// Scroll al inicio en cada navegación + refresh de triggers
watch(
  () => route.path,
  () => {
    window.scrollTo(0, 0)
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }
)
</script>

<template>
  <ion-app>
    <div class="min-h-[100dvh] bg-brand-charcoal-900 text-white flex flex-col">
      <Cursor />
      <PageTransition />
      <Navbar v-if="route.path !== '/login'" />
      <main
        class="flex-1"
        :style="route.path === '/login' ? {} : { paddingTop: NAV_HEIGHT + 'px' }"
      >
        <!-- animated=false: la transición la hace PageTransition (barrido rojo) -->
        <ion-router-outlet :animated="false" />
      </main>
      <Footer v-if="route.path !== '/login'" />
      <!-- Grano fílmico global -->
      <div
        aria-hidden="true"
        class="grain-overlay pointer-events-none fixed inset-0 z-[90] opacity-[0.05]"
      />
    </div>
  </ion-app>
</template>
