import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead, VueHeadMixin } from '@vueuse/head'
import Antd from 'ant-design-vue'

import App from './App.vue'

import { registerErrorHandlers } from './errors'
import './assets/main.css'
// import { loadRuntimeConfig, runtimeConfig } from './plugins/runtimeConfig'

const pinia = createPinia()
const head = createHead()

const app = createApp(App)
registerErrorHandlers(app)

// Add options API support for `head`.
app.mixin(VueHeadMixin)

// Register plugins.
app.use(pinia)
app.use(Antd)
app.use(head)

// // Load runtime config, and show error if it fails to load or validate.
// try {
//   const config = await loadRuntimeConfig()
//   app.use(runtimeConfig, config)
// } catch {
//   showError({
//     message: 'Invalid runtime configuration found.',
//     isFatal: true,
//   })
// }

app.mount('#app')
