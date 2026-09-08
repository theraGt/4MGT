<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { IonIcon, IonPage } from '@ionic/vue'
import {
  chatbubbleOutline,
  locationSharp,
  logoFacebook,
  logoInstagram,
  logoYoutube,
} from 'ionicons/icons'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CutButton from '../components/CutButton.vue'
import Chars from '../components/home/Chars.vue'
import Words from '../components/home/Words.vue'
import ContactForm from '../components/contacto/ContactForm.vue'
import FaqAccordion from '../components/contacto/FaqAccordion.vue'

gsap.registerPlugin(ScrollTrigger)

const SOCIALES = [
  { label: 'Instagram', href: 'https://instagram.com', icon: logoInstagram },
  { label: 'Facebook', href: 'https://facebook.com', icon: logoFacebook },
  { label: 'YouTube', href: 'https://youtube.com', icon: logoYoutube },
]

/* ---------- animación ---------- */

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* ===== HERO: secuencia de carga ===== */
    gsap.fromTo(
      '.ct-flag-path',
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }
    )
    gsap.to('.ct-hero-flag', {
      yPercent: 16,
      ease: 'none',
      scrollTrigger: { trigger: '.ct-hero', start: 'top top', end: 'bottom top', scrub: true },
    })
    gsap.fromTo(
      '.ct-hero-flagmark',
      { y: -70, opacity: 0, rotate: -6 },
      { y: 0, opacity: 1, rotate: 0, duration: 0.7, ease: 'back.out(2.2)', delay: 0.15 }
    )
    gsap.fromTo(
      '.ct-hero .char',
      { yPercent: 110 },
      { yPercent: 0, duration: 0.9, stagger: 0.05, ease: 'power3.out', delay: 0.2 }
    )
    gsap.fromTo(
      '.ct-hero-sub',
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.7 }
    )

    /* ===== FORMULARIO + DATOS ===== */
    gsap.fromTo(
      '.ct-form-wrap',
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ct-main', start: 'top 78%' },
      }
    )
    gsap.fromTo(
      '.ct-field',
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ct-main', start: 'top 72%' },
      }
    )
    gsap.fromTo(
      '.ct-dato',
      { x: 60, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ct-main', start: 'top 70%' },
      }
    )

    /* ===== MAPA: pin que cae con rebote ===== */
    const mapTl = gsap.timeline({
      scrollTrigger: { trigger: '.ct-map', start: 'top 75%' },
    })
    mapTl
      .fromTo(
        '.ct-map-pin',
        { y: -220, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.8)' }
      )
      .fromTo(
        '.ct-map-chip',
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
        '+=0.3'
      )

    /* ===== FAQ ===== */
    gsap.fromTo(
      '.ct-faq-item',
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ct-faq-list', start: 'top 82%' },
      }
    )

    /* ===== CTA FINAL ===== */
    const ctaTl = gsap.timeline({
      scrollTrigger: { trigger: '.ct-cta', start: 'top 78%' },
    })
    ctaTl
      .fromTo('.ct-cta .word', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power3.out' })
      .fromTo('.ct-cta-sub', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.35')
      .fromTo('.ct-cta-btns > *', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, '-=0.2')
  }, root.value as Element)
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <ion-page>
    <div ref="root">
      <!-- ============ HERO COMPACTO ============ -->
      <section class="ct-hero relative -mt-20 flex min-h-[50dvh] items-end overflow-hidden pt-20">
        <!-- Bandera outline gigante que se dibuja -->
        <svg
          viewBox="0 0 400 520"
          class="ct-hero-flag pointer-events-none absolute -left-10 top-1/2 h-[130%] -translate-y-1/2 opacity-[0.07] md:left-8"
          aria-hidden="true"
        >
          <path
            class="ct-flag-path"
            d="M20 20 H380 V352.9 L324.3 500 H20 Z"
            stroke="#CD171E"
            stroke-width="2"
            fill="none"
            pathLength="1"
            stroke-dasharray="1"
          />
        </svg>
        <div class="grain-overlay absolute inset-0 opacity-60" aria-hidden="true" />

        <div class="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-16 md:px-12">
          <span class="ct-hero-flagmark mb-8 inline-block h-[62px] w-12 bg-brand-red clip-cut" aria-hidden="true" />
          <p class="overline mb-4 text-brand-red">CONTACTO</p>
          <h1 class="display-xl text-white" style="font-size: clamp(3.5rem, 12vw, 10rem)">
            <span class="block overflow-hidden pb-2">
              <Chars text="HABLEMOS." />
            </span>
          </h1>
          <p class="ct-hero-sub mt-6 max-w-xl text-lg leading-relaxed text-white/85">
            ¿Preguntas sobre el XCC, ARISE o BONFIRE? ¿Quieres traer 4M a tu ciudad? Escríbenos.
          </p>
        </div>
      </section>

      <!-- ============ FORMULARIO + DATOS ============ -->
      <section class="ct-main py-24">
        <div class="mx-auto grid max-w-[1440px] grid-cols-1 gap-14 px-6 md:grid-cols-12 md:gap-8 md:px-12">
          <!-- Formulario -->
          <div class="ct-form-wrap md:col-span-7">
            <ContactForm />
          </div>

          <!-- Datos de contacto -->
          <aside class="md:col-span-5 lg:col-span-4 lg:col-start-9">
            <div class="flex flex-col gap-10 md:sticky md:top-32">
              <div class="ct-dato">
                <h3 class="h3-display text-white">4M GUATEMALA</h3>
                <p class="mt-3 flex items-center gap-2 text-white/70">
                  <ion-icon :icon="locationSharp" class="text-brand-red" aria-hidden="true" />
                  Ciudad de Guatemala, Guatemala
                </p>
              </div>

              <div class="ct-dato">
                <p class="overline mb-2 text-brand-muted">EMAIL</p>
                <a
                  href="mailto:hola@4mgt.org"
                  class="group relative inline-block font-display text-xl font-bold text-white transition-colors hover:text-brand-red"
                >
                  hola@4mgt.org
                  <span
                    class="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-brand-red transition-transform duration-300 group-hover:scale-x-100"
                    aria-hidden="true"
                  />
                </a>
              </div>

              <div class="ct-dato">
                <p class="overline mb-2 text-brand-muted">TELÉFONO</p>
                <a href="tel:+50200000000" class="font-display text-xl font-bold text-white transition-colors hover:text-brand-red">
                  +502 0000 0000
                </a>
              </div>

              <div class="ct-dato">
                <p class="overline mb-4 text-brand-muted">WHATSAPP</p>
                <CutButton href="https://wa.me/50200000000" variant="ghost" class="!px-6 !py-3.5 text-xs">
                  <ion-icon :icon="chatbubbleOutline" aria-hidden="true" />
                  ESCRÍBENOS POR WHATSAPP
                </CutButton>
              </div>

              <div class="ct-dato">
                <p class="overline mb-2 text-brand-muted">HORARIO</p>
                <p class="text-white/85">Lun–Vie · 9:00–18:00</p>
              </div>

              <div class="ct-dato">
                <p class="overline mb-4 text-brand-muted">SÍGUENOS</p>
                <div class="flex gap-3">
                  <a
                    v-for="s in SOCIALES"
                    :key="s.label"
                    :href="s.href"
                    target="_blank"
                    rel="noreferrer"
                    :aria-label="s.label"
                    class="flex h-11 w-11 items-center justify-center rounded-full border border-brand-line text-white/70 transition-all duration-300 hover:-translate-y-[3px] hover:border-brand-red hover:text-brand-red"
                  >
                    <ion-icon :icon="s.icon" class="text-lg" />
                  </a>
                </div>
              </div>

              <p class="ct-dato text-[0.8125rem] text-brand-muted">
                ¿Ya eres parte del movimiento?
                <router-link to="/login" class="text-brand-red transition-colors hover:text-white">
                  Identifícate →
                </router-link>
              </p>
            </div>
          </aside>
        </div>
      </section>

      <!-- ============ MAPA ESTILIZADO ============ -->
      <section class="ct-map ct-dots-bg relative h-[360px] overflow-hidden border-y border-brand-line bg-brand-charcoal-900">
        <!-- Mapa mundi tenue centrado en Centroamérica (punto GT de world-map.svg queda en el centro) -->
        <img
          src="/world-map.svg"
          alt=""
          aria-hidden="true"
          class="absolute opacity-40"
          style="
            width: 1900px;
            height: 950px;
            max-width: none;
            left: calc(50% - 473px);
            top: calc(50% - 392px);
          "
          loading="lazy"
        />
        <!-- Viñeta para integrar bordes -->
        <div
          class="absolute inset-0"
          style="background: radial-gradient(ellipse at center, transparent 30%, #121212 95%)"
          aria-hidden="true"
        />

        <!-- Pin Guatemala -->
        <div class="ct-map-pin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform">
          <span class="ct-ping absolute -inset-4 rounded-full border border-brand-red" aria-hidden="true" />
          <span class="relative block h-3 w-3 rounded-full bg-brand-red shadow-[0_0_18px_rgba(205,23,30,1)]" />
        </div>
        <div class="ct-map-chip absolute left-1/2 top-1/2 ml-5 -translate-y-1/2 whitespace-nowrap bg-brand-red px-4 py-2 clip-cut">
          <span class="overline text-[0.65rem] text-white">4MGT HQ — CIUDAD DE GUATEMALA</span>
        </div>
      </section>

      <!-- ============ FAQ ============ -->
      <section id="faq" class="py-24 md:py-36">
        <div class="mx-auto max-w-[800px] px-6">
          <div class="mb-14 text-center">
            <p class="overline mb-4 text-brand-red">DUDAS</p>
            <h2 class="h2-display text-white">PREGUNTAS FRECUENTES.</h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      <!-- ============ CTA FINAL ============ -->
      <section class="ct-cta py-28 text-center">
        <div class="mx-auto max-w-[1440px] px-6 md:px-12">
          <h2 class="display-l text-white">
            <span class="block overflow-hidden pb-2">
              <Words text="¿PREFIERES EL FUEGO DIRECTO?" />
            </span>
          </h2>
          <p class="ct-cta-sub mt-6 text-lg leading-relaxed text-white/85">
            Ven a la próxima fogata y conócenos en persona.
          </p>
          <div class="ct-cta-btns mt-10 flex flex-wrap items-center justify-center gap-5">
            <CutButton to="/bonfire" variant="ghost">VER BONFIRE</CutButton>
            <CutButton to="/xcc" variant="primary">VIVE EL XCC</CutButton>
          </div>
        </div>
      </section>
    </div>
  </ion-page>
</template>

<style scoped>
/* Anillo expansivo del pin */
@keyframes ctPing {
  0% {
    transform: scale(0.5);
    opacity: 0.9;
  }
  80%,
  100% {
    transform: scale(3);
    opacity: 0;
  }
}
.ct-ping {
  animation: ctPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
.ct-dots-bg {
  background-image: radial-gradient(circle, #3a3a3a 1.4px, transparent 1.4px);
  background-size: 14px 14px;
}
@media (prefers-reduced-motion: reduce) {
  .ct-ping {
    animation: none;
    opacity: 0;
  }
}
</style>
