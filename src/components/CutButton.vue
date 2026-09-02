<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'ghost' | 'arrow'

const props = withDefaults(
  defineProps<{
    to?: string
    href?: string
    variant?: Variant
    type?: 'button' | 'submit'
  }>(),
  { variant: 'primary', type: 'button' }
)

const emit = defineEmits<{ click: [] }>()

const base =
  'inline-flex items-center justify-center gap-3 font-display font-bold uppercase tracking-[0.15em] text-sm transition-all duration-300 select-none'

const variants: Record<Variant, string> = {
  // Primary: fondo rojo, corte --cut, hover levanta con glow de brasa y corte que se profundiza
  primary:
    'bg-brand-red text-white px-8 py-4 clip-cut hover:-translate-y-0.5 hover:ember-glow hover:[clip-path:var(--cut-deep)]',
  // Ghost: borde line, hover borde rojo + texto rojo
  ghost:
    'border border-brand-line text-white px-8 py-4 hover:border-brand-red hover:text-brand-red bg-transparent',
  // Link-flecha: texto + flecha que se desplaza 6px en hover
  arrow: 'text-white p-0 group hover:text-brand-red',
}

const cls = computed(() => `${base} ${variants[props.variant]}`)
</script>

<template>
  <router-link v-if="to" :to="to" :class="cls" @click="emit('click')">
    <template v-if="variant === 'arrow'">
      <span><slot /></span>
      <span
        aria-hidden="true"
        class="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
        >→</span
      >
    </template>
    <slot v-else />
  </router-link>
  <a v-else-if="href" :href="href" :class="cls" @click="emit('click')">
    <template v-if="variant === 'arrow'">
      <span><slot /></span>
      <span
        aria-hidden="true"
        class="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
        >→</span
      >
    </template>
    <slot v-else />
  </a>
  <button v-else :type="type" :class="cls" @click="emit('click')">
    <template v-if="variant === 'arrow'">
      <span><slot /></span>
      <span
        aria-hidden="true"
        class="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
        >→</span
      >
    </template>
    <slot v-else />
  </button>
</template>
