import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead, VueHeadMixin } from '@vueuse/head'

import App from './App.vue'

import { registerErrorHandlers } from './errors'
import './assets/main.scss'

const pinia = createPinia()
const head = createHead()

const app = createApp(App)
registerErrorHandlers(app)

// Add options API support for `head`.
app.mixin(VueHeadMixin)

// Register plugins.
app.use(pinia)
app.use(head)

app.mount('#app')
