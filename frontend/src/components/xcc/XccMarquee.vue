<script setup lang="ts">
import FlagMark from '../FlagMark.vue'

const PHRASES: Array<{ text: string; red?: boolean }> = [
  { text: 'SIN TELÉFONOS' },
  { text: 'SIN EXCUSAS', red: true },
  { text: '72 HORAS' },
  { text: 'SOLO HOMBRES', red: true },
]

/**
 * Mini-marquee del XCC (entre timeline y testimonios).
 * Usa la utilidad global .animate-marquee (30s loop).
 */
</script>

<template>
  <div class="overflow-hidden border-y border-brand-line bg-brand-charcoal-900 py-6">
    <div class="animate-marquee flex w-max gap-8 will-change-transform md:gap-12">
      <div v-for="copy in 2" :key="copy" class="flex shrink-0 gap-8 md:gap-12" :aria-hidden="copy === 2">
        <span
          v-for="(p, i) in PHRASES"
          :key="i"
          class="flex shrink-0 items-center gap-8 md:gap-12"
        >
          <span
            class="font-display font-expanded text-2xl font-extrabold uppercase tracking-tight md:text-4xl"
            :class="p.red ? 'text-brand-red' : 'text-white'"
          >
            {{ p.text }}
          </span>
          <FlagMark class="h-5 w-4" />
        </span>
      </div>
    </div>
  </div>
</template>
