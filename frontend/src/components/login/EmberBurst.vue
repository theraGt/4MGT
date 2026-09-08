<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'

/**
 * Explosión de ~60 brasas (canvas overlay) disparadas desde el centro
 * de la tarjeta en la secuencia de éxito del login. One-shot por burstKey.
 * Port 1:1 de app/src/components/login/EmberBurst.tsx.
 */
const COLORS = ['#CD171E', '#E8402F', '#F5821E', '#FFD9A0']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

const props = defineProps<{
  /** Incrementar para disparar la explosión (0 = sin explosión). */
  burstKey: number
  /** Elemento desde cuyo centro salen las brasas (la tarjeta). */
  target: HTMLElement | null
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0

function explode() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  cancelAnimationFrame(raf)

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr

  const rect = props.target?.getBoundingClientRect()
  const ox = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
  const oy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2

  const parts: Particle[] = []
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 7
    parts.push({
      x: ox + (Math.random() - 0.5) * 48,
      y: oy + (Math.random() - 0.5) * 48,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.6,
      life: 0,
      maxLife: 45 + Math.random() * 40,
      size: 1 + Math.random() * 2.5,
      color: COLORS[i % COLORS.length],
    })
  }

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.globalCompositeOperation = 'lighter'
    let alive = false
    for (const p of parts) {
      p.life += 1
      if (p.life > p.maxLife) continue
      alive = true
      p.vx *= 0.985
      p.vy = p.vy * 0.985 - 0.045 // drift ascendente de brasa
      p.x += p.vx
      p.y += p.vy
      const t = 1 - p.life / p.maxLife
      ctx.globalAlpha = Math.max(t, 0)
      ctx.fillStyle = p.color
      ctx.shadowBlur = 9
      ctx.shadowColor = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * t + 0.4, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
    if (alive) {
      raf = requestAnimationFrame(tick)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }
  raf = requestAnimationFrame(tick)
}

watch(
  () => props.burstKey,
  (k) => {
    if (k > 0) explode()
  }
)

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <canvas
    ref="canvasRef"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-40 h-full w-full"
  />
</template>
