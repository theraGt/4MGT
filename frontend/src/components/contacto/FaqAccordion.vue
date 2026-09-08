<script setup lang="ts">
import { ref } from 'vue'

const FAQ = [
  {
    q: '¿Necesito estar en forma para el XCC?',
    a: 'No necesitas ser atleta. Necesitas disposición. Hay cuatro rutas con distintos niveles de exigencia y te ayudamos a elegir la tuya.',
  },
  {
    q: '¿Tengo que ser cristiano para participar?',
    a: '4M es un movimiento de fe abierto a todo hombre que busca propósito. Nadie te va a presionar; todos te van a escuchar.',
  },
  {
    q: '¿Qué incluye la inscripción?',
    a: 'Equipo de campamento, alimentación, guías, seguro y transporte interno durante el evento.',
  },
  {
    q: '¿Puedo ir con mi hijo / mi papá?',
    a: 'Sí. Tenemos expediciones Father Son y Father Daughter diseñadas exactamente para eso.',
  },
  {
    q: '¿Cómo enciendo un BONFIRE en mi ciudad?',
    a: "Escríbenos por este formulario con la opción 'Ser Anfitrión' y te entrenamos con todo el material.",
  },
]

/* Solo un item abierto a la vez (null = todos cerrados; empieza con el primero abierto) */
const open = ref<number | null>(0)

const toggle = (i: number) => {
  open.value = open.value === i ? null : i
}

/* ---- Animación de altura (equivalente al spring de Framer Motion: stiffness 200, damping 26) ---- */
const EASE = 'cubic-bezier(0.25, 1, 0.35, 1)'
const DURATION = '0.45s'

const onBeforeEnter = (el: Element) => {
  const e = el as HTMLElement
  e.style.height = '0'
  e.style.opacity = '0'
  e.style.transition = `height ${DURATION} ${EASE}, opacity ${DURATION} ${EASE}`
}
const onEnter = (el: Element, done: () => void) => {
  const e = el as HTMLElement
  // forzar reflow para que la transición arranque desde height 0
  void e.offsetHeight
  e.style.height = `${e.scrollHeight}px`
  e.style.opacity = '1'
  const onEnd = (ev: TransitionEvent) => {
    if (ev.propertyName !== 'height') return
    e.removeEventListener('transitionend', onEnd)
    done()
  }
  e.addEventListener('transitionend', onEnd)
}
const onAfterEnter = (el: Element) => {
  const e = el as HTMLElement
  e.style.height = ''
  e.style.transition = ''
  e.style.opacity = ''
}
const onBeforeLeave = (el: Element) => {
  const e = el as HTMLElement
  e.style.height = `${e.scrollHeight}px`
  e.style.opacity = '1'
  e.style.transition = `height ${DURATION} ${EASE}, opacity ${DURATION} ${EASE}`
}
const onLeave = (el: Element, done: () => void) => {
  const e = el as HTMLElement
  void e.offsetHeight
  e.style.height = '0'
  e.style.opacity = '0'
  const onEnd = (ev: TransitionEvent) => {
    if (ev.propertyName !== 'height') return
    e.removeEventListener('transitionend', onEnd)
    done()
  }
  e.addEventListener('transitionend', onEnd)
}
const onAfterLeave = (el: Element) => {
  const e = el as HTMLElement
  e.style.height = ''
  e.style.transition = ''
  e.style.opacity = ''
}
</script>

<template>
  <div class="ct-faq-list">
    <div v-for="(item, i) in FAQ" :key="item.q" class="ct-faq-item border-b border-brand-line">
      <button
        type="button"
        :aria-expanded="open === i"
        :aria-controls="`faq-panel-${i}`"
        class="group flex w-full items-center justify-between gap-6 py-6 text-left"
        @click="toggle(i)"
      >
        <span
          class="font-display text-xl font-bold uppercase tracking-tight transition-colors duration-200"
          :class="open === i ? 'text-white' : 'text-white/85 group-hover:text-white'"
        >
          {{ item.q }}
        </span>
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center border transition-all duration-300"
          :class="
            open === i
              ? 'rotate-45 border-brand-red text-brand-red'
              : 'border-brand-line text-brand-red group-hover:border-brand-red'
          "
          aria-hidden="true"
        >
          <svg
            class="h-[18px] w-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </span>
      </button>
      <Transition
        :css="false"
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @before-leave="onBeforeLeave"
        @leave="onLeave"
        @after-leave="onAfterLeave"
      >
        <div v-if="open === i" :id="`faq-panel-${i}`" class="overflow-hidden">
          <p class="pb-7 pr-14 leading-[1.7] text-brand-muted">{{ item.a }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>
