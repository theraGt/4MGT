<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import { menuOutline, closeOutline } from 'ionicons/icons'
import CutButton from './CutButton.vue'
import { NAV_LINKS } from './nav-links'

const scrolled = ref(false)
const open = ref(false)
const route = useRoute()

const isActive = (to: string) =>
  to === '/' ? route.path === '/' : route.path.startsWith(to)

const onScroll = () => {
  scrolled.value = window.scrollY > 40
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

watch(
  () => route.path,
  () => {
    open.value = false
  }
)

watch(open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <header
    :class="[
      'fixed top-0 inset-x-0 z-50 h-20 transition-all duration-300',
      scrolled
        ? 'bg-[rgba(18,18,18,0.85)] backdrop-blur-md border-b border-brand-line'
        : 'bg-transparent border-b border-transparent',
    ]"
  >
    <div class="mx-auto max-w-[1440px] h-full px-6 md:px-12 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-3 shrink-0" aria-label="4MGT Inicio">
        <span class="flex h-9 w-7 items-center justify-center bg-brand-red clip-cut">
          <span class="font-display font-black text-white text-lg leading-none">4</span>
        </span>
        <span
          class="font-display font-expanded font-black text-white text-2xl tracking-tight leading-none"
        >
          M<sup class="text-brand-red text-xs font-extrabold align-super">GT</sup>
        </span>
      </router-link>

      <!-- Links desktop -->
      <nav class="hidden lg:flex items-center gap-8">
        <router-link
          v-for="l in NAV_LINKS"
          :key="l.to"
          :to="l.to"
          class="relative group flex flex-col items-center"
        >
          <span
            :class="[
              'absolute -top-2.5 h-[7px] w-[6px] bg-brand-red clip-cut transition-opacity duration-200',
              isActive(l.to) ? 'opacity-100' : 'opacity-0',
            ]"
            aria-hidden="true"
          />
          <span
            :class="[
              'relative font-display font-semibold text-[0.8rem] uppercase tracking-[0.2em] transition-colors duration-200 pt-1',
              isActive(l.to) ? 'text-white' : 'text-white/70 group-hover:text-white',
            ]"
          >
            {{ l.label }}
            <span
              class="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-brand-red transition-transform duration-300 group-hover:scale-x-100"
              aria-hidden="true"
            />
          </span>
        </router-link>
      </nav>

      <div class="flex items-center gap-4">
        <CutButton to="/login" variant="primary" class="hidden lg:inline-flex !px-6 !py-3 text-xs">
          IDENTIFICARSE
        </CutButton>
        <button class="lg:hidden text-white p-2" aria-label="Abrir menú" @click="open = true">
          <ion-icon :icon="menuOutline" class="text-[26px] align-middle" />
        </button>
      </div>
    </div>
  </header>

  <!-- Menú mobile fullscreen -->
  <Transition name="mobile-menu">
    <div
      v-if="open"
      class="fixed inset-0 z-[80] bg-brand-charcoal-900 flex flex-col"
    >
      <img
        src="/flag-outline.svg"
        alt=""
        aria-hidden="true"
        class="absolute -right-16 top-1/2 -translate-y-1/2 h-[80dvh] opacity-20 pointer-events-none"
      />
      <div class="flex items-center justify-between h-20 px-6">
        <span class="flex h-9 w-7 items-center justify-center bg-brand-red clip-cut">
          <span class="font-display font-black text-white text-lg leading-none">4</span>
        </span>
        <button class="text-white p-2" aria-label="Cerrar menú" @click="open = false">
          <ion-icon :icon="closeOutline" class="text-[28px] align-middle" />
        </button>
      </div>
      <nav class="flex flex-1 flex-col justify-center gap-2 px-8">
        <div
          v-for="(l, i) in NAV_LINKS"
          :key="l.to"
          class="mobile-menu-item"
          :style="{ transitionDelay: `${0.07 * i}s` }"
        >
          <router-link
            :to="l.to"
            :class="[
              'font-display font-expanded font-black uppercase leading-none text-5xl py-2 block',
              isActive(l.to) ? 'text-brand-red' : 'text-white',
            ]"
          >
            {{ l.label }}
          </router-link>
        </div>
        <div
          class="mobile-menu-item pt-8"
          :style="{ transitionDelay: `${0.07 * NAV_LINKS.length}s` }"
        >
          <CutButton to="/login" variant="primary">IDENTIFICARSE</CutButton>
        </div>
      </nav>
    </div>
  </Transition>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.3s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}
/* Links gigantes: staggered al abrir (equiv. framer-motion delay 0.07s/item) */
.mobile-menu-enter-active .mobile-menu-item {
  transition:
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.mobile-menu-enter-from .mobile-menu-item {
  transform: translateY(60px);
  opacity: 0;
}
.mobile-menu-leave-active .mobile-menu-item {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.mobile-menu-leave-to .mobile-menu-item {
  transform: translateY(40px);
  opacity: 0;
}
</style>
