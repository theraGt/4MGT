<script setup lang="ts">
import { reactive, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { chevronDownOutline } from 'ionicons/icons'
import CutButton from '../CutButton.vue'

/* ---------- tipos y validación ---------- */

interface FormState {
  nombre: string
  email: string
  telefono: string
  interes: string
  mensaje: string
}

type Errors = Partial<Record<keyof FormState, string>>

const INITIAL: FormState = { nombre: '', email: '', telefono: '', interes: '', mensaje: '' }

const INTERESES = ['XCC', 'ARISE', 'BONFIRE', 'SER ANFITRIÓN', 'OTRO']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(values: FormState): Errors {
  const errors: Errors = {}
  if (values.nombre.trim().length < 2) errors.nombre = 'Ingresa tu nombre completo.'
  if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Ingresa un correo válido (ej. nombre@correo.com).'
  if (values.telefono.trim() && !/^[+()\-\s\d]{7,18}$/.test(values.telefono.trim()))
    errors.telefono = 'Ingresa un número válido o deja el campo vacío.'
  if (!values.interes) errors.interes = 'Selecciona una opción.'
  if (values.mensaje.trim().length < 10) errors.mensaje = 'Cuéntanos un poco más (mínimo 10 caracteres).'
  return errors
}

/* ---------- estilos de campo ---------- */

const fieldBase =
  'w-full bg-[#1C1C1C] border px-4 py-3.5 text-white placeholder:text-brand-muted/50 transition-all duration-200 outline-none focus:border-brand-red focus:shadow-[0_0_0_3px_rgba(205,23,30,0.2)]'

function fieldCls(hasError: boolean) {
  return `${fieldBase} ${hasError ? 'border-brand-red' : 'border-brand-line'}`
}

/* ---------- estado ---------- */

const values = reactive<FormState>({ ...INITIAL })
const errors = reactive<Errors>({})
const status = ref<'idle' | 'loading' | 'sent'>('idle')

const onInput = (name: keyof FormState) => {
  if (errors[name]) delete errors[name]
}

const onSubmit = () => {
  if (status.value !== 'idle') return
  const errs = validate(values)
  Object.keys(errors).forEach((k) => delete errors[k as keyof FormState])
  Object.assign(errors, errs)
  if (Object.keys(errs).length > 0) return
  status.value = 'loading'
  // Envío mock: 1.2s de loading → éxito
  window.setTimeout(() => (status.value = 'sent'), 1200)
}

const reset = () => {
  status.value = 'idle'
  Object.assign(values, INITIAL)
  Object.keys(errors).forEach((k) => delete errors[k as keyof FormState])
}
</script>

<template>
  <div class="ct-flip-perspective">
    <div class="ct-flip-inner relative grid" :class="{ 'ct-flipped': status === 'sent' }">
      <!-- ===== Cara frontal: formulario ===== -->
      <form
        novalidate
        class="col-start-1 row-start-1 border border-brand-line bg-brand-charcoal p-6 clip-cut-lg ct-backface sm:p-10"
        @submit.prevent="onSubmit"
      >
        <h3 class="h3-display mb-10 text-white">ENVÍANOS UN MENSAJE</h3>

        <div class="flex flex-col gap-6">
          <div class="ct-field">
            <label for="nombre" class="overline mb-2 block text-[0.65rem] text-brand-muted">NOMBRE COMPLETO</label>
            <input
              id="nombre"
              v-model="values.nombre"
              type="text"
              autocomplete="name"
              placeholder="Tu nombre"
              :class="fieldCls(!!errors.nombre)"
              :aria-invalid="!!errors.nombre"
              @input="onInput('nombre')"
            />
            <p v-if="errors.nombre" class="mt-2 text-[0.8125rem] text-brand-red">{{ errors.nombre }}</p>
          </div>

          <div class="ct-field">
            <label for="email" class="overline mb-2 block text-[0.65rem] text-brand-muted">EMAIL</label>
            <input
              id="email"
              v-model="values.email"
              type="email"
              autocomplete="email"
              placeholder="nombre@correo.com"
              :class="fieldCls(!!errors.email)"
              :aria-invalid="!!errors.email"
              @input="onInput('email')"
            />
            <p v-if="errors.email" class="mt-2 text-[0.8125rem] text-brand-red">{{ errors.email }}</p>
          </div>

          <div class="ct-field">
            <label for="telefono" class="overline mb-2 block text-[0.65rem] text-brand-muted">
              TELÉFONO / WHATSAPP
              <span class="ml-2 text-brand-muted/50">(OPCIONAL)</span>
            </label>
            <input
              id="telefono"
              v-model="values.telefono"
              type="tel"
              autocomplete="tel"
              placeholder="+502 0000 0000"
              :class="fieldCls(!!errors.telefono)"
              :aria-invalid="!!errors.telefono"
              @input="onInput('telefono')"
            />
            <p v-if="errors.telefono" class="mt-2 text-[0.8125rem] text-brand-red">{{ errors.telefono }}</p>
          </div>

          <div class="ct-field">
            <label for="interes" class="overline mb-2 block text-[0.65rem] text-brand-muted">ME INTERESA</label>
            <div class="relative">
              <select
                id="interes"
                v-model="values.interes"
                :class="[fieldCls(!!errors.interes), 'appearance-none pr-10', !values.interes && 'text-brand-muted/50']"
                :aria-invalid="!!errors.interes"
                @change="onInput('interes')"
              >
                <option value="" disabled>Selecciona una opción…</option>
                <option v-for="o in INTERESES" :key="o" :value="o" class="bg-[#1C1C1C] text-white">
                  {{ o }}
                </option>
              </select>
              <ion-icon
                :icon="chevronDownOutline"
                class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted"
                aria-hidden="true"
              />
            </div>
            <p v-if="errors.interes" class="mt-2 text-[0.8125rem] text-brand-red">{{ errors.interes }}</p>
          </div>

          <div class="ct-field">
            <label for="mensaje" class="overline mb-2 block text-[0.65rem] text-brand-muted">MENSAJE</label>
            <textarea
              id="mensaje"
              v-model="values.mensaje"
              rows="5"
              placeholder="¿En qué te podemos ayudar?"
              :class="[fieldCls(!!errors.mensaje), 'resize-y']"
              :aria-invalid="!!errors.mensaje"
              @input="onInput('mensaje')"
            />
            <p v-if="errors.mensaje" class="mt-2 text-[0.8125rem] text-brand-red">{{ errors.mensaje }}</p>
          </div>

          <CutButton
            variant="primary"
            type="submit"
            class="w-full"
            :class="status === 'loading' ? 'pointer-events-none opacity-80' : ''"
          >
            <template v-if="status === 'loading'">
              <svg
                class="h-[18px] w-[18px] animate-spin text-brand-ember"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              ENVIANDO…
            </template>
            <template v-else>ENVIAR MENSAJE</template>
          </CutButton>
        </div>
      </form>

      <!-- ===== Cara trasera: confirmación ===== -->
      <div
        class="ct-backface ct-back col-start-1 row-start-1 flex flex-col items-center justify-center border border-brand-line bg-brand-charcoal p-10 text-center clip-cut-lg"
        aria-live="polite"
      >
        <!-- Bandera plantándose -->
        <span
          class="ct-success-flag mb-8 block h-20 w-14 origin-bottom bg-brand-red clip-cut"
          :class="{ 'ct-flag-plant': status === 'sent' }"
          aria-hidden="true"
        />
        <h3 class="h3-display text-white">
          MENSAJE <span class="text-brand-red">RECIBIDO.</span>
        </h3>
        <p class="mt-5 max-w-sm text-[1.0625rem] leading-[1.7] text-white/85">
          Un hermano del equipo te contactará en menos de 48 horas.
        </p>
        <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
          <CutButton to="/" variant="ghost">VOLVER AL INICIO</CutButton>
          <button
            type="button"
            class="text-[0.8125rem] text-brand-muted underline-offset-4 transition-colors hover:text-white hover:underline"
            @click="reset"
          >
            Enviar otro mensaje
          </button>
        </div>
        <p class="mt-8 text-[0.8125rem] text-brand-muted">
          ¿Urgente?
          <router-link to="/quienes-somos" class="text-brand-red hover:underline">
            Conoce más del movimiento
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Flip 3D (equivalente al Framer Motion rotateY 180, ease [0.16, 1, 0.3, 1], 0.9s) */
.ct-flip-perspective {
  perspective: 1200px;
}
.ct-flip-inner {
  transform-style: preserve-3d;
  transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.ct-flip-inner.ct-flipped {
  transform: rotateY(180deg);
}
.ct-backface {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.ct-back {
  transform: rotateY(180deg);
}

/* Bandera plantándose (scaleY [0, 1.12, 1] + rotate [-4, 2, 0], delay 0.35s) */
.ct-success-flag {
  transform: scaleY(0);
}
@keyframes ctFlagPlant {
  0% {
    transform: scaleY(0) rotate(-4deg);
  }
  55% {
    transform: scaleY(1.12) rotate(2deg);
  }
  100% {
    transform: scaleY(1) rotate(0deg);
  }
}
.ct-flag-plant {
  animation: ctFlagPlant 0.9s ease-out 0.35s both;
}
@media (prefers-reduced-motion: reduce) {
  .ct-flip-inner {
    transition-duration: 0.01s;
  }
  .ct-flag-plant {
    animation: none;
    transform: none;
  }
}
</style>
