<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'

/**
 * Campo glass con label flotante para la tarjeta de login.
 * Label que sube y se pone rojo al enfocar/llenar, borde rojo + glow en
 * focus, pulso de error y micro-partícula de brasa al enfocar.
 * Port 1:1 del GlassField de app/src/pages/Login.tsx.
 */
const props = withDefaults(
  defineProps<{
    id: string
    label: string
    modelValue: string
    type?: string
    error?: string
    autoComplete?: string
    reduced?: boolean
  }>(),
  { type: 'text', error: undefined, autoComplete: undefined, reduced: false }
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const slots = useSlots()
const focused = ref(false)
const spark = ref(0)

const floated = computed(() => focused.value || props.modelValue.length > 0)
const hasTrailing = computed(() => Boolean(slots.trailing))

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
function onFocus() {
  focused.value = true
  if (!props.reduced) spark.value += 1
}
function onBlur() {
  focused.value = false
}
</script>

<template>
  <div>
    <div class="relative">
      <label
        :for="id"
        class="pointer-events-none absolute left-4 z-10 font-display font-semibold uppercase transition-all duration-200"
        :class="
          floated
            ? 'top-2.5 text-[0.6rem] tracking-[0.25em] text-brand-red'
            : 'top-1/2 -translate-y-1/2 text-xs tracking-[0.2em] text-white/45'
        "
      >
        {{ label }}
      </label>
      <input
        :id="id"
        :name="id"
        :type="type"
        :value="modelValue"
        :autocomplete="autoComplete"
        class="w-full border bg-[rgba(18,18,18,0.6)] px-4 pb-2.5 pt-6 text-sm text-white caret-brand-red outline-none transition-[border-color,box-shadow] duration-200"
        :class="[
          hasTrailing && 'pr-11',
          error
            ? 'login-input-error border-brand-red'
            : 'border-[rgba(255,255,255,0.14)] focus:border-brand-red focus:shadow-[0_0_0_3px_rgba(205,23,30,0.25)]',
        ]"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${id}-error` : undefined"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />
      <slot name="trailing" />
      <!-- Micro-partícula de brasa al enfocar (se recrea por :key en cada focus) -->
      <span
        v-if="spark > 0"
        :key="spark"
        aria-hidden="true"
        class="login-spark pointer-events-none absolute right-3 top-1 h-1 w-1 rounded-full bg-brand-ember shadow-[0_0_6px_rgba(232,64,47,0.9)]"
      />
    </div>
    <p v-if="error" :id="`${id}-error`" class="mt-1.5 text-xs text-brand-red" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style>
/* Micro-partícula de brasa que sale del borde del input al enfocar */
.login-spark {
  animation: login-spark-rise 0.6s ease-out forwards;
}
@keyframes login-spark-rise {
  from {
    transform: translateY(0);
    opacity: 0.9;
  }
  to {
    transform: translateY(-22px);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .login-spark {
    animation: none;
    opacity: 0;
  }
}
</style>
