<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const COLORS = ['#F5821E', '#E8402F', '#FFC46B', '#CD171E']

interface Spark {
  /** posición horizontal 0..1 */
  x: number
  /** posición vertical 0..1 (crece hacia abajo) */
  y: number
  /** velocidad de ascenso (fracción de alto por frame @60fps) */
  vy: number
  /** amplitud/frecuencia del vaivén */
  sway: number
  swayFreq: number
  phase: number
  size: number
  color: string
  /** ms desde el inicio en que la chispa "enciende" */
  bornAt: number
}

const props = withDefaults(
  defineProps<{
    count?: number
    /** multiplica velocidad y brillo (p.ej. cuando el CTA entra al viewport) */
    intensity?: number
  }>(),
  { count: 60, intensity: 1 }
)

/**
 * Chispas 2D en canvas (versión liviana del campo de brasas 3D).
 * Partículas ámbar/rojas que ascienden desde el tercio inferior,
 * respiran con seno y "encienden" una a una durante los primeros 1.5s.
 * Se pausa fuera del viewport y se desactiva con prefers-reduced-motion.
 */

const canvasRef = ref<HTMLCanvasElement | null>(null)
const intensityRef = ref(props.intensity)
watch(
  () => props.intensity,
  (v) => {
    intensityRef.value = v
  }
)

let cleanup: (() => void) | null = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const count = props.count

  let w = 0
  let h = 0
  let raf = 0
  let running = false
  let last = 0
  let current = 1 // intensidad suavizada (lerp)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const start = performance.now()

  const makeSpark = (i: number): Spark => ({
    x: Math.random(),
    y: 0.55 + Math.random() * 0.5,
    vy: 0.0006 + Math.random() * 0.0012,
    sway: 0.004 + Math.random() * 0.012,
    swayFreq: 0.0006 + Math.random() * 0.0012,
    phase: Math.random() * Math.PI * 2,
    size: 0.8 + Math.random() * 1.8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    // encendido escalonado durante 1.5s (con jitter)
    bornAt: (i / Math.max(count, 1)) * 1500 + Math.random() * 250,
  })

  let sparks: Spark[] = Array.from({ length: count }, (_, i) => makeSpark(i))

  const resize = () => {
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.max(1, Math.round(w * dpr))
    canvas.height = Math.max(1, Math.round(h * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  const step = (now: number) => {
    if (!running) return
    const dt = Math.min((now - last) / 16.7 || 1, 3)
    last = now
    current += (intensityRef.value - current) * 0.04

    ctx.clearRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'lighter'

    const elapsed = now - start
    for (const s of sparks) {
      if (elapsed < s.bornAt) continue
      // fade-in tras nacer (0.6s)
      const birth = Math.min((elapsed - s.bornAt) / 600, 1)
      s.y -= s.vy * dt * current
      if (s.y < -0.05) {
        // respawn en el tercio inferior
        s.y = 0.9 + Math.random() * 0.15
        s.x = Math.random()
      }
      const px = (s.x + Math.sin(now * s.swayFreq + s.phase) * s.sway) * w
      const py = s.y * h
      // respiración con seno
      const breathe = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * 0.003 + s.phase * 3))
      const alpha = breathe * birth * Math.min(current, 1.6) * 0.85
      const r = s.size * (0.9 + 0.4 * current)

      // halo suave
      ctx.globalAlpha = alpha * 0.25
      ctx.fillStyle = s.color
      ctx.beginPath()
      ctx.arc(px, py, r * 3.2, 0, Math.PI * 2)
      ctx.fill()
      // núcleo brillante
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(px, py, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    raf = requestAnimationFrame(step)
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(step)
      } else if (!entry.isIntersecting && running) {
        running = false
        cancelAnimationFrame(raf)
      }
    },
    { threshold: 0.02 }
  )
  io.observe(canvas)

  cleanup = () => {
    running = false
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    sparks = []
  }
})

onUnmounted(() => {
  cleanup?.()
  cleanup = null
})
</script>

<template>
  <canvas
    ref="canvasRef"
    aria-hidden="true"
    style="width: 100%; height: 100%; display: block"
  />
</template>
