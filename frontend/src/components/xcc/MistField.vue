<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Canvas ligero de niebla/neblina a la deriva (~30 partículas suaves).
 * Exclusivo del hero XCC. Se pausa fuera de viewport y respeta
 * prefers-reduced-motion.
 */

interface Particle {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  alpha: number
  phase: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

let cleanup: (() => void) | null = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let raf = 0
  let running = false
  let particles: Particle[] = []
  let w = 0
  let h = 0
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    w = rect.width
    h = rect.height
    canvas.width = Math.max(1, Math.floor(w * dpr))
    canvas.height = Math.max(1, Math.floor(h * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const seed = () => {
    particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 60 + Math.random() * 160,
      vx: 0.08 + Math.random() * 0.22,
      vy: (Math.random() - 0.5) * 0.06,
      alpha: 0.03 + Math.random() * 0.05,
      phase: Math.random() * Math.PI * 2,
    }))
  }

  let t = 0
  const draw = () => {
    t += 0.008
    ctx.clearRect(0, 0, w, h)
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy + Math.sin(t + p.phase) * 0.12
      if (p.x - p.r > w) p.x = -p.r
      if (p.y - p.r > h) p.y = -p.r
      if (p.y + p.r < 0) p.y = h + p.r
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
      g.addColorStop(0, `rgba(238,238,238,${p.alpha})`)
      g.addColorStop(1, 'rgba(238,238,238,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    }
    raf = requestAnimationFrame(draw)
  }

  const start = () => {
    if (running) return
    running = true
    raf = requestAnimationFrame(draw)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }

  resize()
  seed()

  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { threshold: 0.02 }
  )
  io.observe(canvas)

  const onResize = () => {
    resize()
    seed()
  }
  window.addEventListener('resize', onResize)

  cleanup = () => {
    stop()
    io.disconnect()
    window.removeEventListener('resize', onResize)
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
    style="width: 100%; height: 100%"
  />
</template>
