import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default ({ mode }: any) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  // https://vitejs.dev/config/
  return defineConfig({
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        // Needed for vue3-runtime-template
        // See https://github.com/vitejs/vite/discussions/4158#discussioncomment-1282397
        vue: 'vue/dist/vue.esm-bundler.js',

        // Absolute imports.
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  })
}
