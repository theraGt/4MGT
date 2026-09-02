import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue') },
  { path: '/xcc', name: 'xcc', component: () => import('../views/Xcc.vue') },
  { path: '/arise', name: 'arise', component: () => import('../views/Arise.vue') },
  { path: '/bonfire', name: 'bonfire', component: () => import('../views/Bonfire.vue') },
  {
    path: '/quienes-somos',
    name: 'quienes-somos',
    component: () => import('../views/QuienesSomos.vue'),
  },
  { path: '/contacto', name: 'contacto', component: () => import('../views/Contacto.vue') },
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
