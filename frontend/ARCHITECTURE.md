# 4MGT — Ionic + Vue 3 · Arquitectura y contrato para page agents

Port 1:1 del sitio React (`/mnt/agents/output/app/src/`, rama master) a **Ionic + Vue 3**
(Composition API con `<script setup>`). Stack: Vue 3 + Vite + TS, `@ionic/vue` 9,
`@ionic/vue-router` (vue-router 4), Tailwind 3.4, GSAP + ScrollTrigger, Lenis, three.js vanilla.

## Rutas

| Ruta | Vista | Estado |
|---|---|---|
| `/` | `src/views/Home.vue` | Completa |
| `/xcc` | `src/views/Xcc.vue` | stub |
| `/arise` | `src/views/Arise.vue` | stub |
| `/bonfire` | `src/views/Bonfire.vue` | stub |
| `/quienes-somos` | `src/views/QuienesSomos.vue` | stub |
| `/contacto` | `src/views/Contacto.vue` | stub |
| `/login` | `src/views/Login.vue` | stub |

Catch-all redirige a `/`. El router vive en `src/router/index.ts` (`createRouter`/`createWebHistory`
de `@ionic/vue-router`). El shell (`src/App.vue`) monta `<ion-app>` + `<ion-router-outlet :animated="false">`;
la transición de página la hace `PageTransition.vue` (barrido rojo con `--cut`), NO Ionic.

## SCROLL — decisión: OPCIÓN B (window scroll)

**Las páginas NO usan `<ion-content>`.** IonApp/IonPage actúan como shell semántico; el contenido
tiene altura natural y el scroll es el de `window`, igual que en la versión React. Razón: todo el
sistema de animación depende de window scroll — `Navbar` (lee `window.scrollY`), `Marquee`
(velocidad por delta de scrollY), y decenas de `ScrollTrigger` con pins. Migrar a scroller propio
de ion-content obligaría a pasar `scroller` a cada trigger y rompe los pins.

Patrón obligatorio para TODA página:

```vue
<script setup lang="ts">
import { IonPage } from '@ionic/vue'
</script>

<template>
  <ion-page>
    <!-- contenido con altura natural; el scroll lo hace window -->
    <section class="...">...</section>
  </ion-page>
</template>
```

Detalles de implementación de la Opción B (ya hechos en core, NO los dupliques):

- `src/theme/main.css` lleva al final reglas **unlayered** que neutralizan el CSS de Ionic
  (`.ion-page { position:absolute; contain:... }` → flujo normal). Sin esto, la altura natural
  de la página colapsa. No metas estas reglas en un `@layer`: el core.css de Ionic es unlayered
  y ganaría la cascada.
- `ion-router-outlet` se usa con `:animated="false"` (el barrido rojo de `PageTransition.vue`
  es la única transición). Ionic añade/quita `ion-page-invisible` automáticamente.
- Al navegar "forward", Ionic deja la página saliente MONTADA con `ion-page-hidden`
  (`display:none`). Por eso el cleanup con `gsap.context` + `ctx.revert()` en `onUnmounted`
  sigue siendo obligatorio (dispara al desmontar de verdad, p.ej. en replace), y `App.vue`
  hace `ScrollTrigger.refresh()` en cada cambio de ruta para recalcular al volver.

- **Lenis** (`lerp: 0.09`) se instancia una sola vez en `App.vue` (`onMounted`), sincronizado con
  ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`). No crees otra instancia.
- En cada cambio de ruta `App.vue` hace `window.scrollTo(0, 0)` + `ScrollTrigger.refresh()`.
- **Navbar offset:** `App.vue` aplica `padding-top: 80px` (`NAV_HEIGHT`, de
  `src/components/nav-links.ts`) alrededor del outlet. Los heroes full-bleed salen debajo del nav
  fijo con `-mt-20` en su `<section>` (como hace el hero de Home). Las secciones normales NO
  compensan el nav.

## GSAP / cleanup — convención obligatoria

Usa `gsap.context` con scope a la raíz de la página y reviértelo en `onUnmounted`
(ver `src/views/Home.vue` y `src/components/Footer.vue`):

```ts
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.from('.mi-seccion', { /* ... */ scrollTrigger: { trigger: '.mi-seccion', start: 'top 80%' } })
  }, root.value as Element)
})
onUnmounted(() => { ctx?.revert(); ctx = null })
```

`ctx.revert()` mata tweens y ScrollTriggers creados dentro — sin esto, los triggers de una página
quedan vivos al navegar. Respeta `prefers-reduced-motion` en cualquier animación no trivial.

## Sistema de diseño (no duplicar)

- `tailwind.config.js`: colores `brand.*` (`red #CD171E`, `red-dark`, `ember`, `flame`,
  `charcoal(-900/-700)`, `gray`, `muted`, `line`) y fuentes `font-display` (Archivo) / `font-body` (Inter).
- `src/theme/main.css` (importado en `main.ts` tras el CSS core de Ionic): tokens CSS
  (`--red`, `--cut`, `--cut-lg`, `--cut-deep`), escala tipográfica (`.display-xl/.display-l/
  .h2-display/.h3-display/.overline/.numeral`), `.flag-block`, `.text-outline`, `.clip-cut(-lg)`,
  `.grain-overlay`, `.ember-glow`, keyframes `animate-marquee/animate-pulse-dot/.scroll-line-fill`.
- Paleta dark de Ionic vía clase `ion-palette-dark` en `<html>` (index.html y main.ts).
- **Assets:** servidos desde `public/` — referencia siempre como `/hero-bg.jpg`, `/flag-outline.svg`,
  etc. (sin `import`, sin `src/assets`).

## Componentes compartidos (`src/components/`) — NO modificar sin coordinar

| Componente | Uso |
|---|---|
| `Navbar.vue` | fixed h-20, transparente→blur tras 40px, menú mobile fullscreen. En `App.vue`. |
| `Footer.vue` | En `App.vue`, con parallax de bandera (GSAP). |
| `CutButton.vue` | Props: `to?` (router-link), `href?`, `variant: 'primary'|'ghost'|'arrow'`, `type?`. Emite `click`. |
| `Marquee.vue` | Cinta infinita, acelera con el scroll. |
| `Cursor.vue` | Punto rojo + anillo difference; label vía atributo `data-cursor-label="VER"` en elementos interactivos. Global en `App.vue`. |
| `PageTransition.vue` | Barrido rojo en cada cambio de ruta. Global. |
| `EmberField.vue` | Brasas 3D (three.js vanilla). Props: `count?` (250), `speedRef?: { value: number }` — escribe `value` (p.ej. progress de un ScrollTrigger) para acelerar las brasas. Lazy (IntersectionObserver), se apaga con reduced-motion, hace dispose completo al salir del viewport. Máx. 1 instancia visible por página. |
| `FlagMark.vue` | Mini bandera roja (`class` reemplaza el tamaño default `h-4 w-3`; prop `withFour`). |
| `nav-links.ts` | `NAV_LINKS` y `NAV_HEIGHT` (80). |

## Dónde poner tu código

- Tu vista: `src/views/<Pagina>.vue` (reemplaza el stub, conserva `<ion-page>`).
- Componentes solo de tu página: `src/components/<pagina>/*.vue` (minúscula; Home usa
  `src/components/home/` como referencia).
- Helpers de split de texto reutilizables: `src/components/home/Chars.vue` y `Words.vue`
  (impórtalos si necesitas reveals por carácter/palabra).
- Iconos: `ionicons/icons` + `<ion-icon :icon="...">` o SVG inline (no lucide). OJO: el plugin
  `IonicVue` NO registra componentes globalmente — importa `IonIcon` (y cualquier `Ion*` que uses)
  en cada SFC: `import { IonIcon } from '@ionic/vue'`.
- GSAP + transform de Tailwind: si GSAP anima `x/y/scale` de un elemento, no uses clases
  `translate-*`/`scale-*` de Tailwind en ese mismo elemento (GSAP sobrescribe `transform`);
  el centrado se hace con `gsap.set(el, { xPercent: -50, yPercent: -50 })`.
- Estilos: clases Tailwind + utilidades de `main.css`. Si necesitas CSS extra global, añádelo a
  `src/theme/main.css` en una capa `@layer utilities`, no crees hojas nuevas.

## NO tocar

`src/App.vue`, `src/router/index.ts`, `src/main.ts`, `src/components/*` compartidos,
`tailwind.config.js`, `src/theme/main.css` (tokens existentes), `index.html`.
Si algo compartido no te sirve, repórtalo al lead en vez de editarlo.

## Verificación

`npm run build` (vue-tsc + vite build) debe pasar limpio antes de commitear.
