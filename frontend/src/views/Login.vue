<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import type { CSSProperties, Ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon, IonPage } from '@ionic/vue'
import { arrowBackOutline, checkmarkOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons'
import gsap from 'gsap'
import { authApi } from '../services/auth'
import { ApiError } from '../services/api'
import { setSession } from '../stores/auth'
import FlagMark from '../components/FlagMark.vue'
import GlassField from '../components/login/GlassField.vue'
import EmberBurst from '../components/login/EmberBurst.vue'

const EmberField = defineAsyncComponent(() => import('../components/EmberField.vue'))

/**
 * LOGIN — La pieza estrella: tarjeta 3D (tilt ±12° con springs, parallax
 * multicapa translateZ, glassmorphism, glare especular, sombra dinámica,
 * borde de brasa cónico) sobre fondo cinematográfico en 2 capas con
 * parallax inverso + campo de brasas 3D. Secuencia de éxito coreografiada
 * con explosión EmberBurst. Port 1:1 de app/src/pages/Login.tsx
 * (Framer Motion springs → springs manuales en rAF + GSAP).
 */

type Phase = 'idle' | 'loading' | 'charging' | 'burst' | 'success' | 'code' | 'error'

function useMedia(query: string): Ref<boolean> {
  const matches = ref(typeof window !== 'undefined' && window.matchMedia(query).matches)
  let mq: MediaQueryList | null = null
  const onChange = () => {
    matches.value = mq?.matches ?? false
  }
  onMounted(() => {
    mq = window.matchMedia(query)
    onChange()
    mq.addEventListener('change', onChange)
  })
  onUnmounted(() => mq?.removeEventListener('change', onChange))
  return matches
}

function clampUnit(v: number) {
  return Math.max(-1, Math.min(1, v))
}

const router = useRouter()
const reduced = useMedia('(prefers-reduced-motion: reduce)')
const coarse = useMedia('(pointer: coarse)')
const interactive = computed(() => !reduced.value && !coarse.value)

const webglOk = (() => {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
})()

const phase = ref<Phase>('idle')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const remember = ref(true)
const errors = ref<{ email?: string; password?: string; code?: string }>({})
const burstKey = ref(0)
const loginUserId = ref<number | null>(null)
const loginToken = ref('')
const formError = ref('')
const codeNote = ref('')
const resending = ref(false)
const verifying = ref(false)

const busy = computed(() => phase.value !== 'idle' && phase.value !== 'error')

const root = ref<HTMLElement | null>(null)
const cardEl = ref<HTMLElement | null>(null)
const choreoEl = ref<HTMLElement | null>(null)
const bgAEl = ref<HTMLElement | null>(null)
const bgAImg = ref<HTMLImageElement | null>(null)

// Cursor normalizado (-1..1) que alimenta tilt, parallax y glare
const curX = ref(0)
const curY = ref(0)

/* --- Sistema de springs manual (equiv. useSpring de Framer Motion, mass=1) --- */
interface Spring {
  v: Ref<number>
  vel: number
  target: number
  k: number // stiffness
  c: number // damping
}
const spring = (v: number, k: number, c: number): Spring => ({ v: ref(v), vel: 0, target: v, k, c })

// Tilt 3D (stiffness 150 / damping 20)
const tiltRy = spring(0, 150, 20) // rotateY = mvX * 12
const tiltRx = spring(0, 150, 20) // rotateX = -mvY * 12
// Parallax del fondo, inverso al cursor (stiffness 50 / damping 18)
const bgAx = spring(0, 50, 18)
const bgAy = spring(0, 50, 18)
const bgBx = spring(0, 50, 18)
const bgBy = spring(0, 50, 18)
// Entrada de la tarjeta: y 80, rotateX -25° (spring 90/16, delay 0.3s)
const entryY = spring(80, 90, 16)
const entryRx = spring(-25, 90, 16)
const entryO = spring(0, 90, 16)
// Bandera que cae y se planta (spring 170/15, delay 0.8s)
const flagY = spring(-48, 170, 15)
const flagRot = spring(-8, 170, 15)
const flagO = spring(0, 170, 15)
// Bandera del panel de éxito (spring 200/14)
const sFlagY = spring(-90, 200, 14)
const sFlagRot = spring(-12, 200, 14)
const sFlagS = spring(1.15, 200, 14)
const sFlagO = spring(0, 200, 14)

const springs: Spring[] = [
  tiltRy,
  tiltRx,
  bgAx,
  bgAy,
  bgBx,
  bgBy,
  entryY,
  entryRx,
  entryO,
  flagY,
  flagRot,
  flagO,
  sFlagY,
  sFlagRot,
  sFlagS,
  sFlagO,
]

// Glow rojo creciente de la fase "charging" (tween GSAP → ref)
const glowState = { v: 0 }
const glowV = ref(0)

/* --- Estilos derivados (bind reactivo por frame) --- */
const bgAStyle = computed(
  (): CSSProperties => ({
    transform: `translate3d(${bgAx.v.value}px, ${bgAy.v.value}px, 0) scale(1.06)`,
  })
)
const bgBStyle = computed(
  (): CSSProperties => ({
    transform: `translate3d(${bgBx.v.value}px, ${bgBy.v.value}px, 0) scale(1.14)`,
    filter: 'blur(14px) brightness(0.5)',
    WebkitMaskImage: 'radial-gradient(60% 60% at 50% 50%, black 25%, transparent 72%)',
    maskImage: 'radial-gradient(60% 60% at 50% 50%, black 25%, transparent 72%)',
  })
)
const entryStyle = computed(
  (): CSSProperties => ({
    transform: `translate3d(0, ${entryY.v.value}px, 0) rotateX(${entryRx.v.value}deg)`,
    opacity: entryO.v.value,
    transformStyle: 'preserve-3d',
  })
)
// Sombra dinámica opuesta al tilt + glow de carga
const cardShadow = computed(() => {
  const sx = -tiltRy.v.value * 3
  const sy = 40 + tiltRx.v.value * 2.5
  const gp = glowV.value * 90
  const ga = glowV.value * 0.5
  return `${sx}px ${sy}px 100px rgba(0,0,0,0.6), 0 0 ${gp}px rgba(205,23,30,${ga})`
})
const tiltStyle = computed(
  (): CSSProperties => ({
    transform: `rotateX(${tiltRx.v.value}deg) rotateY(${tiltRy.v.value}deg)`,
    transformStyle: 'preserve-3d',
    boxShadow: cardShadow.value,
  })
)
// Glare especular que sigue al cursor (sin spring, como en React)
const glareBg = computed(() => {
  const gx = 50 + curX.value * 32 // [-1,1] → [18,82]
  const gy = 50 + curY.value * 32
  return `radial-gradient(340px circle at ${gx}% ${gy}%, rgba(255,255,255,0.13), rgba(255,255,255,0.04) 45%, transparent 70%)`
})
const flagStyle = computed(
  (): CSSProperties => ({
    transform: `translateX(-50%) translateY(${flagY.v.value}px) translateZ(45px) rotate(${flagRot.v.value}deg)`,
    opacity: flagO.v.value,
  })
)
const sFlagStyle = computed(
  (): CSSProperties => ({
    transform: `translateY(${sFlagY.v.value}px) rotate(${sFlagRot.v.value}deg) scale(${sFlagS.v.value})`,
    opacity: sFlagO.v.value,
  })
)

/* --- Fallback CSS de brasas (sin WebGL) --- */
const cssEmbers = Array.from({ length: 12 }, (_, i) => ({
  left: `${6 + ((i * 83) % 90)}%`,
  width: `${i % 3 === 0 ? 3 : 2}px`,
  height: `${i % 3 === 0 ? 3 : 2}px`,
  background: i % 2 === 0 ? '#E8402F' : '#F5821E',
  boxShadow: '0 0 8px rgba(232,64,47,0.8)',
  animationDuration: `${7 + (i % 5)}s`,
  animationDelay: `${(i * 1.13) % 7}s`,
}))

/* --- Timers coreografiados --- */
const timers: number[] = []
const later = (fn: () => void, ms: number) => {
  timers.push(window.setTimeout(fn, ms))
}

/* --- Loop de springs (tilt, parallax, entradas, banderas) --- */
let rafId = 0
let last = 0
const t0 = performance.now()

function step(now: number) {
  rafId = requestAnimationFrame(step)
  const dt = Math.min(Math.max((now - last) / 1000, 0.001), 1 / 30)
  last = now

  // Touch: flotación automática (±2° aprox., loop de 6s)
  if (coarse.value && !reduced.value && (phase.value === 'idle' || phase.value === 'error')) {
    const s = (((now - t0) / 1000) * Math.PI * 2) / 6
    curX.value = Math.sin(s) * 0.17
    curY.value = Math.cos(s) * 0.17
  }

  // Targets derivados del cursor
  tiltRy.target = curX.value * 12
  tiltRx.target = -curY.value * 12
  bgAx.target = -curX.value * 12
  bgAy.target = -curY.value * 12
  bgBx.target = -curX.value * 24
  bgBy.target = -curY.value * 24

  for (const sp of springs) {
    const dv = sp.target - sp.v.value
    // asentado: no escribir la ref (evita renders innecesarios en idle)
    if (Math.abs(dv) < 1e-4 && Math.abs(sp.vel) < 1e-4) {
      if (sp.v.value !== sp.target) {
        sp.vel = 0
        sp.v.value = sp.target
      }
      continue
    }
    const f = sp.k * dv - sp.c * sp.vel
    sp.vel += f * dt
    sp.v.value += sp.vel * dt
  }
}

/* --- Listeners de cursor (solo pointer fino, sin reduced-motion) --- */
let removeMouse: (() => void) | null = null
watch(
  interactive,
  (on) => {
    removeMouse?.()
    removeMouse = null
    if (!on) return
    const onMove = (e: MouseEvent) => {
      if (phase.value !== 'idle' && phase.value !== 'error') return
      curX.value = clampUnit((e.clientX / window.innerWidth) * 2 - 1)
      curY.value = clampUnit((e.clientY / window.innerHeight) * 2 - 1)
    }
    const onLeave = () => {
      curX.value = 0
      curY.value = 0
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    removeMouse = () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  },
  { immediate: true }
)

/* --- Montaje: scroll lock + entrada coreografiada --- */
let prevOverflow = ''
let ctx: gsap.Context | null = null

onMounted(() => {
  // Bloquear scroll mientras la escena inmersiva está montada
  prevOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  ctx = gsap.context(() => {
    if (reduced.value) {
      // Entrada simple: solo fades, tarjeta estática
      entryY.v.value = 0
      entryY.target = 0
      entryRx.v.value = 0
      entryRx.target = 0
      entryO.v.value = 1
      entryO.target = 1
      flagY.v.value = 0
      flagY.target = 0
      flagRot.v.value = 0
      flagRot.target = 0
      flagO.v.value = 1
      flagO.target = 1
      if (bgAEl.value) gsap.fromTo(bgAEl.value, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      if (bgAImg.value) gsap.set(bgAImg.value, { filter: 'brightness(0.7) saturate(1.1)' })
      gsap.from('.login-reveal', { opacity: 0, duration: 0.4, stagger: 0.05, delay: 0.15 })
      gsap.from('.login-topbar', { opacity: 0, duration: 0.4 })
      gsap.from('.login-tagline', { opacity: 0, duration: 0.4, delay: 0.2 })
      return
    }
    // Fondo: scale 1.08→1 + brightness 0.3→0.7 (1.2s)
    if (bgAEl.value) {
      gsap.fromTo(bgAEl.value, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' })
    }
    if (bgAImg.value) {
      gsap.fromTo(
        bgAImg.value,
        { filter: 'brightness(0.3) saturate(1.1)' },
        { filter: 'brightness(0.7) saturate(1.1)', duration: 1.2, ease: 'power2.out' }
      )
    }
    // Tarjeta: spring y:80 / rotateX:-25 (delay 0.3s)
    later(() => {
      entryY.target = 0
      entryRx.target = 0
      entryO.target = 1
    }, 300)
    // La bandera cae y se planta (delay 0.8s)
    later(() => {
      flagY.target = 0
      flagRot.target = 0
      flagO.target = 1
    }, 800)
    // Campos stagger y:20 (base 0.84s, stagger 0.06s, bezier(0.16,1,0.3,1) = expo.out)
    gsap.from('.login-reveal', { y: 20, opacity: 0, duration: 0.5, delay: 0.84, stagger: 0.06, ease: 'expo.out' })
    gsap.from('.login-topbar', { opacity: 0, y: -12, duration: 0.5, delay: 0.6 })
    gsap.from('.login-tagline', { opacity: 0, duration: 0.6, delay: 1.1 })
  }, root.value as Element)

  if (!reduced.value) {
    last = performance.now()
    rafId = requestAnimationFrame(step)
  }
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  removeMouse?.()
  timers.forEach((t) => window.clearTimeout(t))
  ctx?.revert()
  ctx = null
  document.body.style.overflow = prevOverflow
})

/* --- Coreografía de error/éxito --- */
function shake(amp: number, duration: number) {
  const el = choreoEl.value
  if (!el || reduced.value) return
  ctx?.add(() => {
    gsap.to(el, { keyframes: { x: [0, -amp, amp, -amp, amp, 0] }, duration, ease: 'none' })
  })
}

async function onSubmit() {
  if (busy.value) return
  const next: { email?: string; password?: string } = {}
  if (!/\S+@\S+\.\S+/.test(email.value)) next.email = 'Ingresa un correo válido.'
  if (password.value.length < 4) next.password = 'Mínimo 4 caracteres.'
  errors.value = next
  formError.value = ''
  if (next.email || next.password) {
    phase.value = 'error' // shake horizontal ±8px, 0.4s
    shake(8, 0.4)
    later(() => {
      phase.value = 'idle'
    }, 450)
    return
  }
  // Autenticación real contra el API
  phase.value = 'loading'
  curX.value = 0 // 1) el tilt se endereza
  curY.value = 0
  try {
    const result = await authApi.login(email.value, password.value)

    if (result.requires2FA && result.userId) {
      loginUserId.value = result.userId
      loginToken.value = ''
      codeNote.value = ''
      phase.value = 'code'
      return
    }

    if (result.token && result.user) {
      setSession(result.token, result.user, remember.value)
      runSuccessChoreography()
    }
  } catch (err) {
    showAuthError(err)
  }
}

function runSuccessChoreography() {
  phase.value = 'charging' // 2) carga de energía: shake sutil + glow creciente
  ctx?.add(() => {
    gsap.to(glowState, {
      v: 1,
      duration: 0.35,
      ease: 'power2.out',
      onUpdate: () => {
        glowV.value = glowState.v
      },
    })
  })
  shake(2, 0.3)
  later(() => {
    phase.value = 'burst' // 3) explosión de brasas + scale 0.96 → 1 con flash
    burstKey.value += 1
    ctx?.add(() => {
      gsap.to(glowState, {
        v: 0.35,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => {
          glowV.value = glowState.v
        },
      })
      const el = choreoEl.value
      if (el && !reduced.value) {
        gsap.to(el, { keyframes: { scale: [1, 0.96, 1] }, duration: 0.5, ease: 'power1.inOut' })
      }
    })
    later(() => {
      phase.value = 'success' // 4) crossfade a panel de éxito + bandera plantándose
      if (reduced.value) {
        sFlagY.v.value = 0
        sFlagRot.v.value = 0
        sFlagS.v.value = 1
        sFlagO.v.value = 1
      } else {
        sFlagY.v.value = -90
        sFlagY.vel = 0
        sFlagRot.v.value = -12
        sFlagRot.vel = 0
        sFlagS.v.value = 1.15
        sFlagS.vel = 0
        sFlagO.v.value = 0
        sFlagO.vel = 0
        sFlagY.target = 0
        sFlagRot.target = 0
        sFlagS.target = 1
        sFlagO.target = 1
      }
      later(() => router.push('/'), 1700) // barra 1.5s → redirige
    }, 480)
  }, 320)
}

function showAuthError(err: unknown) {
  const msg = err instanceof ApiError ? err.message : 'Error del servidor. Intenta de nuevo.'
  formError.value = msg
  phase.value = 'error'
  shake(8, 0.4)
  later(() => {
    phase.value = 'idle'
    formError.value = ''
  }, 450)
}

async function verifyCode() {
  if (phase.value !== 'code' || verifying.value) return
  if (!loginUserId.value || !loginToken.value.trim()) {
    errors.value = { code: 'Ingresa el código de 6 dígitos.' }
    return
  }
  verifying.value = true
  errors.value = { code: undefined }
  formError.value = ''
  try {
    const result = await authApi.verifyLogin(loginUserId.value, loginToken.value.trim())
    setSession(result.token, result.user, remember.value)
    loginToken.value = ''
    runSuccessChoreography()
  } catch (err) {
    showAuthError(err)
  } finally {
    verifying.value = false
  }
}

async function resendCode() {
  if (resending.value) return
  resending.value = true
  formError.value = ''
  codeNote.value = ''
  try {
    const result = await authApi.login(email.value, password.value)
    if (result.requires2FA && result.userId) {
      loginUserId.value = result.userId
      loginToken.value = ''
      codeNote.value = 'Código reenviado. Revisa tu correo.'
    }
  } catch (err) {
    showAuthError(err)
  } finally {
    resending.value = false
  }
}

function backToLogin() {
  phase.value = 'idle'
  loginToken.value = ''
  codeNote.value = ''
  formError.value = ''
  errors.value = { code: undefined }
  curX.value = 0
  curY.value = 0
}

function maskEmail(value: string) {
  const idx = value.indexOf('@')
  if (idx <= 0) return value
  const head = value.slice(0, 2)
  const mask = '•'.repeat(Math.max(2, idx - 2))
  return `${head}${mask}${value.slice(idx)}`
}

function onEmail(v: string) {
  email.value = v
  errors.value = { ...errors.value, email: undefined }
}
function onPassword(v: string) {
  password.value = v
  errors.value = { ...errors.value, password: undefined }
}
function onLoginToken(v: string) {
  loginToken.value = v.replace(/\s/g, '').slice(0, 6).toUpperCase()
  errors.value = { ...errors.value, code: undefined }
}
</script>

<template>
  <ion-page>
    <section
      ref="root"
      aria-label="Acceso para miembros 4M"
      class="fixed inset-0 z-[60] overflow-hidden bg-brand-charcoal-900"
    >
      <!-- ---------- Fondo cinematográfico: capa A (nítida) ---------- -->
      <div ref="bgAEl" aria-hidden="true" class="absolute -inset-10">
        <img
          ref="bgAImg"
          src="/login-bg.jpg"
          alt=""
          draggable="false"
          class="h-full w-full object-cover"
          :style="bgAStyle"
        />
      </div>

      <!-- ---------- Fondo capa B (blur con máscara radial, DOF falso) ---------- -->
      <div aria-hidden="true" class="absolute -inset-10">
        <img
          src="/login-bg.jpg"
          alt=""
          draggable="false"
          class="h-full w-full object-cover"
          :style="bgBStyle"
        />
      </div>

      <!-- Vignette radial -->
      <div
        aria-hidden="true"
        class="absolute inset-0"
        style="background: radial-gradient(120% 90% at 50% 45%, transparent 38%, rgba(0, 0, 0, 0.72) 100%)"
      />

      <!-- ---------- Campo de brasas 3D (three.js) / fallback CSS ---------- -->
      <EmberField
        v-if="webglOk"
        :count="coarse ? 60 : 180"
        class="pointer-events-none absolute inset-0 z-[5]"
      />
      <div
        v-else-if="!reduced"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      >
        <span
          v-for="(e, i) in cssEmbers"
          :key="i"
          class="login-ember-css absolute bottom-0 block rounded-full"
          :style="e"
        />
      </div>

      <!-- ---------- Periférico: logo + regreso ---------- -->
      <div class="login-topbar absolute left-5 top-5 z-20 flex items-center gap-4 md:left-10 md:top-8">
        <router-link to="/" class="flex items-center gap-3" aria-label="4MGT — Volver al inicio">
          <span class="clip-cut flex h-9 w-7 items-center justify-center bg-brand-red">
            <span class="font-display text-lg font-black leading-none text-white">4</span>
          </span>
          <span class="font-display font-expanded text-xl font-black leading-none tracking-tight text-white">
            M<sup class="align-super text-xs font-extrabold text-brand-red">GT</sup>
          </span>
        </router-link>
        <router-link
          to="/"
          class="group/back hidden items-center gap-2 border border-brand-line px-4 py-2.5 font-display text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-white/70 transition-colors duration-300 hover:border-brand-red hover:text-white sm:inline-flex"
        >
          <ion-icon
            :icon="arrowBackOutline"
            class="text-[13px] transition-transform duration-300 group-hover/back:-translate-x-1"
          />
          Volver al inicio
        </router-link>
      </div>

      <!-- ---------- Periférico: tagline ---------- -->
      <div
        aria-hidden="true"
        class="login-tagline pointer-events-none absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-4 md:bottom-8"
      >
        <FlagMark class="h-3 w-2.5" />
        <span class="overline text-white/50">Ordinary people · Extraordinary lives</span>
        <FlagMark class="h-3 w-2.5" />
      </div>

      <!-- ---------- Escena de la tarjeta ---------- -->
      <div
        class="relative z-10 flex h-full items-center justify-center px-4"
        style="perspective: 1400px"
      >
        <!-- Entrada: y 80, rotateX -25°, spring (stiffness 90 / damping 16, delay 0.3s) -->
        <div :style="entryStyle">
          <!-- Coreografía de error/éxito (shake + scale flash) — GSAP en choreoEl -->
          <div ref="choreoEl" style="transform-style: preserve-3d">
            <!-- Tilt ligado al cursor + sombra dinámica -->
            <div ref="cardEl" class="group relative w-[min(420px,92vw)]" :style="tiltStyle">
              <!-- Borde de brasa: gradiente cónico rotando (visible en hover/focus) -->
              <div
                aria-hidden="true"
                class="login-ember-ring clip-cut-lg pointer-events-none absolute -inset-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
              />

              <!-- Vidrio base -->
              <div
                aria-hidden="true"
                class="clip-cut-lg pointer-events-none absolute inset-0 border border-[rgba(255,255,255,0.12)] bg-[rgba(38,38,38,0.45)] [backdrop-filter:blur(18px)_saturate(1.3)]"
              />

              <!-- Capa fondo (translateZ -30px): grano + bandera outline gigante -->
              <div
                aria-hidden="true"
                class="clip-cut-lg pointer-events-none absolute -inset-2 overflow-visible"
                style="transform: translateZ(-30px)"
              >
                <img
                  src="/flag-outline.svg"
                  alt=""
                  draggable="false"
                  class="absolute -bottom-32 -right-20 h-[560px] opacity-[0.08]"
                />
                <div class="grain-overlay absolute inset-0 opacity-40" />
              </div>

              <!-- Capa media (translateZ 20px): contenido del formulario -->
              <div
                class="relative z-10 flex h-[560px] flex-col px-8 pb-7 pt-[76px] sm:px-10"
                style="transform: translateZ(20px)"
              >
                <div
                  class="flex h-full flex-col transition-opacity duration-[350ms]"
                  :style="{
                    opacity: phase === 'success' || phase === 'code' ? 0 : 1,
                    pointerEvents: phase === 'success' || phase === 'code' ? 'none' : 'auto',
                  }"
                >
                  <div class="login-reveal">
                    <p class="overline text-brand-red">Miembros 4M</p>
                    <h1 class="h3-display mt-2 text-white">Identifícate</h1>
                    <p class="mt-1.5 text-sm text-brand-muted">Acceso para hombres del movimiento.</p>
                  </div>

                  <form novalidate class="mt-6 flex flex-col gap-4" @submit.prevent="onSubmit">
                    <GlassField
                      id="login-email"
                      label="Email"
                      type="email"
                      auto-complete="email"
                      class="login-reveal"
                      :model-value="email"
                      :error="errors.email"
                      :reduced="reduced"
                      @update:model-value="onEmail"
                    />
                    <GlassField
                      id="login-password"
                      label="Contraseña"
                      :type="showPassword ? 'text' : 'password'"
                      auto-complete="current-password"
                      class="login-reveal"
                      :model-value="password"
                      :error="errors.password"
                      :reduced="reduced"
                      @update:model-value="onPassword"
                    >
                      <template #trailing>
                        <button
                          type="button"
                          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                          class="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors duration-200"
                          :class="showPassword ? 'text-brand-red' : 'text-white/50 hover:text-white'"
                          @click="showPassword = !showPassword"
                        >
                          <ion-icon
                            :icon="showPassword ? eyeOffOutline : eyeOutline"
                            class="block text-[17px]"
                          />
                        </button>
                      </template>
                    </GlassField>

                    <div class="login-reveal flex items-center justify-between">
                      <label class="flex cursor-pointer select-none items-center gap-2.5">
                        <input v-model="remember" type="checkbox" class="peer sr-only" />
                        <span
                          class="clip-cut flex h-4 w-4 items-center justify-center border border-[rgba(255,255,255,0.25)] bg-[rgba(18,18,18,0.6)] transition-colors duration-200 peer-checked:border-brand-red peer-focus-visible:shadow-[0_0_0_3px_rgba(205,23,30,0.25)]"
                        >
                          <ion-icon
                            v-if="remember"
                            :icon="checkmarkOutline"
                            class="text-[11px] text-brand-red"
                            style="--ionicon-stroke-width: 64px"
                          />
                        </span>
                        <span class="text-xs text-white/60">Recuérdame</span>
                      </label>
                      <a
                        href="#recuperar"
                        class="group/forgot relative text-xs text-white/60 transition-colors duration-200 hover:text-white"
                        @click.prevent
                      >
                        ¿Olvidaste tu contraseña?
                        <span
                          aria-hidden="true"
                          class="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-brand-red transition-transform duration-300 group-hover/forgot:scale-x-100"
                        />
                      </a>
                    </div>

                    <div class="login-reveal">
                      <p v-if="formError" class="mb-3 text-xs text-brand-red" role="alert">
                        {{ formError }}
                      </p>
                      <button
                        type="submit"
                        :disabled="busy"
                        class="clip-cut inline-flex w-full items-center justify-center gap-2.5 bg-brand-red px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(205,23,30,0.5)] hover:[clip-path:var(--cut-deep)] disabled:cursor-wait"
                      >
                        <template v-if="phase === 'loading'">
                          <span
                            v-for="i in [0, 1, 2]"
                            :key="i"
                            class="login-dot inline-block h-1.5 w-1.5 rounded-full"
                            :class="i === 0 ? 'bg-brand-ember' : i === 1 ? 'bg-brand-flame' : 'bg-white'"
                            :style="{ animationDelay: `${i * 0.15}s` }"
                          />
                          <span class="sr-only">Entrando…</span>
                        </template>
                        <template v-else>Entrar</template>
                      </button>
                    </div>
                  </form>

                  <div class="login-reveal mt-auto flex flex-col gap-3 pt-5">
                    <div aria-hidden="true" class="flex items-center gap-4">
                      <span class="h-px flex-1 bg-brand-line" />
                      <span class="text-xs text-brand-muted">o</span>
                      <span class="h-px flex-1 bg-brand-line" />
                    </div>
                    <router-link
                      to="/contacto"
                      class="text-center font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors duration-200 hover:text-brand-red"
                    >
                      ¿Aún no eres parte? <span class="text-brand-red">Únete al movimiento</span>
                    </router-link>
                  </div>
                </div>

                <!-- ---------- Panel de código 2FA (crossfade) ---------- -->
                <div
                  v-if="phase === 'code'"
                  class="login-codepanel absolute inset-0 flex flex-col justify-center gap-4 px-2 sm:px-6"
                >
                  <div class="text-center">
                    <p class="overline text-brand-red">Verificación</p>
                    <h2 class="h3-display mt-1 text-white">Código de acceso</h2>
                    <p class="mt-1 text-sm text-brand-muted">
                      Enviamos un código de 6 dígitos a {{ maskEmail(email) }}.
                    </p>
                  </div>

                  <GlassField
                    id="login-code"
                    label="Código de 6 dígitos"
                    type="text"
                    auto-complete="one-time-code"
                    :model-value="loginToken"
                    :error="errors.code"
                    :reduced="reduced"
                    @update:model-value="onLoginToken"
                  />

                  <p
                    v-if="codeNote"
                    class="text-center text-xs text-brand-muted"
                    role="status"
                  >
                    {{ codeNote }}
                  </p>

                  <div class="flex flex-col gap-2.5">
                    <button
                      type="button"
                      :disabled="verifying"
                      class="clip-cut inline-flex w-full items-center justify-center gap-2.5 bg-brand-red px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(205,23,30,0.5)] hover:[clip-path:var(--cut-deep)] disabled:cursor-wait"
                      @click="verifyCode"
                    >
                      {{ verifying ? 'Verificando…' : 'Verificar y entrar' }}
                    </button>
                    <button
                      type="button"
                      :disabled="resending"
                      class="inline-flex w-full items-center justify-center gap-2 px-8 py-3 font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/60 transition-colors duration-200 hover:text-brand-red disabled:cursor-wait"
                      @click="resendCode"
                    >
                      {{ resending ? 'Enviando…' : 'Reenviar código' }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex w-full items-center justify-center gap-1 px-8 py-2 font-display text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors duration-200 hover:text-white"
                      @click="backToLogin"
                    >
                      ← Volver a ingresar
                    </button>
                  </div>
                </div>

                <!-- ---------- Panel de éxito (crossfade) ---------- -->
                <div
                  v-if="phase === 'success'"
                  class="login-success-panel absolute inset-0 flex flex-col items-center justify-center gap-4 px-10 text-center"
                >
                  <div
                    aria-hidden="true"
                    class="clip-cut flex h-24 w-[74px] items-center justify-center bg-brand-red shadow-[0_16px_48px_rgba(205,23,30,0.45)]"
                    :style="sFlagStyle"
                  >
                    <span class="font-display text-4xl font-black leading-none text-white">4</span>
                  </div>
                  <h2 class="h3-display text-white">Bienvenido, hermano.</h2>
                  <p class="text-sm text-brand-muted">Redirigiendo a tu panel...</p>
                  <div
                    class="mt-2 h-1 w-48 overflow-hidden bg-white/10"
                    role="progressbar"
                    aria-label="Redirigiendo"
                  >
                    <div class="login-progress-fill h-full bg-brand-red" />
                  </div>
                </div>
              </div>

              <!-- Glare especular que sigue al cursor (blend overlay) -->
              <div
                aria-hidden="true"
                class="clip-cut-lg pointer-events-none absolute inset-0"
                :style="{ transform: 'translateZ(46px)', background: glareBg, mixBlendMode: 'overlay' }"
              />

              <!-- Capa frente (translateZ 45px): bandera del logo que sobresale -->
              <div aria-hidden="true" class="pointer-events-none absolute -top-8 left-1/2" :style="flagStyle">
                <div
                  class="clip-cut flex h-[82px] w-16 items-center justify-center bg-brand-red shadow-[0_14px_36px_rgba(0,0,0,0.55)]"
                >
                  <span class="font-display text-3xl font-black leading-none text-white">4</span>
                </div>
              </div>

              <!-- Flash de la explosión -->
              <div
                v-if="phase === 'burst'"
                aria-hidden="true"
                class="login-flash clip-cut-lg pointer-events-none absolute inset-0 bg-brand-ember"
                style="transform: translateZ(30px); mix-blend-mode: screen"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Explosión de brasas (canvas overlay) -->
      <EmberBurst :burst-key="burstKey" :target="cardEl" />
    </section>
  </ion-page>
</template>

<style>
/* Keyframes locales de la página login (borde de brasa cónico, dots de carga,
   pulso de error, flash de explosión, panel de éxito, fallback CSS de brasas). */
@property --login-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
.login-ember-ring {
  background:
    conic-gradient(
      from var(--login-angle),
      rgba(205, 23, 30, 0) 0deg,
      rgba(205, 23, 30, 0.95) 50deg,
      #f5821e 100deg,
      rgba(232, 64, 47, 0.9) 140deg,
      rgba(205, 23, 30, 0) 200deg,
      rgba(205, 23, 30, 0) 360deg
    ),
    conic-gradient(
      from calc(var(--login-angle) + 180deg),
      rgba(205, 23, 30, 0) 0deg,
      rgba(245, 130, 30, 0.65) 60deg,
      rgba(205, 23, 30, 0) 150deg,
      rgba(205, 23, 30, 0) 360deg
    );
  animation: login-ember-spin 3s linear infinite;
}
@keyframes login-ember-spin {
  to {
    --login-angle: 360deg;
  }
}
.login-dot {
  animation: login-dot-bounce 1s ease-in-out infinite;
}
@keyframes login-dot-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }
  40% {
    transform: translateY(-7px);
    opacity: 1;
  }
}
.login-input-error {
  animation: login-error-pulse 1.2s ease-in-out infinite;
}
@keyframes login-error-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(205, 23, 30, 0.45);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(205, 23, 30, 0.12);
  }
}
.login-ember-css {
  animation: login-ember-rise linear infinite;
}
@keyframes login-ember-rise {
  0% {
    transform: translateY(12vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.9;
  }
  85% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-96vh) translateX(4vw);
    opacity: 0;
  }
}
/* Flash de la explosión: opacity 0 → 0.55 → 0 en 0.5s */
.login-flash {
  animation: login-flash-pop 0.5s ease-out both;
}
@keyframes login-flash-pop {
  0% {
    opacity: 0;
  }
  25% {
    opacity: 0.55;
  }
  100% {
    opacity: 0;
  }
}
/* Panel de éxito: fade in con delay 0.15s */
.login-success-panel {
  animation: login-fade-in 0.35s ease 0.15s both;
}
/* Panel de código 2FA: fade in con delay 0.15s */
.login-codepanel {
  animation: login-fade-in 0.35s ease 0.15s both;
}
@keyframes login-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
/* Barra de progreso de redirección (1.5s) */
.login-progress-fill {
  animation: login-progress 1.5s ease-in-out forwards;
}
@keyframes login-progress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .login-ember-ring,
  .login-dot,
  .login-input-error,
  .login-ember-css,
  .login-flash {
    animation: none !important;
  }
}
</style>
