import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'

/* Ionic core CSS */
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Tema global 4MGT (tokens + tailwind) */
import './theme/main.css'

import App from './App.vue'
import router from './router'

// El sitio es 100% oscuro
document.documentElement.classList.add('ion-palette-dark')

createApp(App).use(IonicVue).use(router).mount('#app')
