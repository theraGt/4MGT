<script setup lang="ts">
import { IonPage } from '@ionic/vue'
import XccHero from '../components/xcc/XccHero.vue'
import QueEs from '../components/xcc/QueEs.vue'
import RoutesGrid from '../components/xcc/RoutesGrid.vue'
import Timeline72 from '../components/xcc/Timeline72.vue'
import XccMarquee from '../components/xcc/XccMarquee.vue'
import Testimonials from '../components/xcc/Testimonials.vue'
import DatesCta from '../components/xcc/DatesCta.vue'

/**
 * XCC — Xtreme Character Challenge (/xcc)
 * La página más oscura y gritty del sitio: hero 90dvh, 4 rutas con
 * colores oficiales, timeline pinneado HORA 00→72, testimonios y fechas.
 */
</script>

<template>
  <ion-page>
    <div class="bg-brand-charcoal-900">
      <XccHero />
      <QueEs />
      <RoutesGrid />
      <Timeline72 />
      <XccMarquee />
      <Testimonials />
      <DatesCta />
    </div>
  </ion-page>
</template>
