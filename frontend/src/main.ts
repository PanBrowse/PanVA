import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead, VueHeadMixin } from '@vueuse/head'
import Antd from 'ant-design-vue'

import App from './App.vue'

import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(Antd)

const head = createHead()
// Add options API support.
app.mixin(VueHeadMixin)
app.use(head)

app.mount('#app')
