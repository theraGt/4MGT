<script lang="ts">
/**
 * Referencia mutable de velocidad: el padre escribe `speedRef.value`
 * (típicamente el progress de un ScrollTrigger) y las brasas aceleran
 * hasta 1 + value * 3 con lerp.
 */
export interface EmberSpeedRef {
  value: number
}
</script>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'

const props = withDefaults(
  defineProps<{
    count?: number
    speedRef?: EmberSpeedRef
  }>(),
  { count: 250 }
)

/**
 * Campo de brasas 3D reutilizable (hero home, CTA final, login).
 * Brasas rojas/naranjas que suben con drift sinusoidal y parallax al cursor.
 * Se monta de forma perezosa al entrar al viewport (IO), se pausa fuera
 * de él y se desactiva con prefers-reduced-motion.
 */
const PALETTE = ['#CD171E', '#E8402F', '#F5821E']

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uHeight;
  varying vec3 vColor;
  varying float vFade;

  void main() {
    vec3 pos = position;
    // ascenso con wrap vertical
    float y = mod(pos.y + uTime * aSpeed * uSpeed, uHeight) - uHeight * 0.5;
    // drift sinusoidal (nunca modifica la posición base)
    pos.x += sin(uTime * 0.6 + aPhase) * 0.35 + sin(uTime * 0.23 + aPhase * 2.0) * 0.15;
    pos.z += cos(uTime * 0.5 + aPhase) * 0.3;
    pos.y = y;
    // fade en los extremos del recorrido
    vFade = smoothstep(-uHeight * 0.5, -uHeight * 0.32, y) * (1.0 - smoothstep(uHeight * 0.28, uHeight * 0.5, y));
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * (140.0 / -mv.z);
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vFade;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.05, d) * vFade;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`

const wrapRef = ref<HTMLDivElement | null>(null)
const active = ref(false)

let io: IntersectionObserver | null = null
let renderer: THREE.WebGLRenderer | null = null
let rafId = 0
let removePointer: (() => void) | null = null

function buildScene(el: HTMLDivElement) {
  const count = props.count
  const height = 14

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 100)
  camera.position.set(0, 0, 9)

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.setSize(el.clientWidth, el.clientHeight)
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  el.appendChild(renderer.domElement)

  // Geometría de partículas (mismos parámetros que la versión React)
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)
  const speeds = new Float32Array(count)
  const colors = new Float32Array(count * 3)
  const color = new THREE.Color()
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 22
    positions[i * 3 + 1] = (Math.random() - 0.5) * height
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
    sizes[i] = 1 + Math.random() * 3 // 1-4px (escalado por distancia)
    phases[i] = Math.random() * Math.PI * 2
    speeds[i] = 0.35 + Math.random() * 0.75
    color.set(PALETTE[Math.floor(Math.random() * PALETTE.length)])
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: 1 },
      uHeight: { value: height },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  const group = new THREE.Group()
  group.add(points)
  scene.add(group)

  // parallax: el grupo rota ±4° siguiendo el cursor (equiv. state.pointer de R3F)
  const pointer = { x: 0, y: 0 }
  const onPointer = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1
    pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1)
  }
  window.addEventListener('pointermove', onPointer, { passive: true })
  removePointer = () => window.removeEventListener('pointermove', onPointer)

  const onResize = () => {
    if (!renderer) return
    camera.aspect = el.clientWidth / el.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(el.clientWidth, el.clientHeight)
  }
  window.addEventListener('resize', onResize)

  const clock = new THREE.Clock()
  const loop = () => {
    rafId = requestAnimationFrame(loop)
    const t = clock.getElapsedTime()
    material.uniforms.uTime.value = t
    const boost = props.speedRef ? props.speedRef.value : 0
    const target = 1 + boost * 3
    const u = material.uniforms.uSpeed
    u.value += (target - u.value) * 0.06
    const ty = pointer.x * (Math.PI / 45) // ±4°
    const tx = -pointer.y * (Math.PI / 60)
    group.rotation.y += (ty - group.rotation.y) * 0.05
    group.rotation.x += (tx - group.rotation.x) * 0.05
    renderer?.render(scene, camera)
  }
  loop()

  return () => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
    geometry.dispose()
    material.dispose()
    renderer?.dispose()
    renderer?.domElement.remove()
    renderer = null
  }
}

let teardown: (() => void) | null = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const el = wrapRef.value
  if (!el) return
  io = new IntersectionObserver(([entry]) => (active.value = entry.isIntersecting), {
    threshold: 0.05,
  })
  io.observe(el)
})

// Monta/destruye la escena según visibilidad (máx. 1 instancia pesada visible)
watch(active, (isActive) => {
  const el = wrapRef.value
  if (!el) return
  if (isActive && !teardown) {
    teardown = buildScene(el)
  } else if (!isActive && teardown) {
    teardown()
    teardown = null
  }
})

onUnmounted(() => {
  io?.disconnect()
  removePointer?.()
  teardown?.()
  teardown = null
})
</script>

<template>
  <div ref="wrapRef" aria-hidden="true" />
</template>
