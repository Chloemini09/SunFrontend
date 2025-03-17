import 'bootstrap/dist/css/bootstrap.min.css'
// Import the functions you need from the SDKs you need

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { vKeyboardNavigation } from './directives/keyboardNavigation.js'

const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)
app.directive('keyboard-navigation', vKeyboardNavigation)
app.mount('#app')