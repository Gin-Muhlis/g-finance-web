import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(MotionPlugin, {
  directives: {
    'fade-up': {
      initial: { opacity: 0, y: 40 },
      enter: { opacity: 1, y: 0 },
    },
    'fade-down': {
      initial: { opacity: 0, y: -24 },
      enter: { opacity: 1, y: 0 },
    },
    'slide-left': {
      initial: { opacity: 0, x: 80, rotate: 8 },
      enter: { opacity: 1, x: 0, rotate: -8 },
    },
    'slide-right': {
      initial: { opacity: 0, x: -80, rotate: -8 },
      enter: { opacity: 1, x: 0, rotate: 7 },
    },
    'pop-in': {
      initial: { opacity: 0, scale: 0.85 },
      enter: { opacity: 1, scale: 1 },
    },
    fade: {
      initial: { opacity: 0 },
      enter: { opacity: 1 },
    },
    'fade-up-subtle': {
      initial: { opacity: 0, y: 20 },
      enter: { opacity: 1, y: 0 },
    },
    'reveal-left': {
      initial: { opacity: 0, x: -28 },
      enter: { opacity: 1, x: 0 },
    },
    'reveal-right': {
      initial: { opacity: 0, x: 28 },
      enter: { opacity: 1, x: 0 },
    },
  },
})
app.mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
