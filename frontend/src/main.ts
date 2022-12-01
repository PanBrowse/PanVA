import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
// import { createMetaManager, plugin as metaPlugin } from 'vue-meta'

import App from './App.vue'

import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(Antd)

// const metaManager = createMetaManager()
// app.use(metaManager)
// app.use(metaPlugin)

app.mount('#app')
