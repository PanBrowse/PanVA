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
        '@': fileURLToPath(new URL('./src', import.meta.url)),

        // We are using the environment variable `VITE_DATASET` to determine
        // which dataset should be used at build time.
        '@dataset': fileURLToPath(
          new URL(`./src/datasets/${process.env.VITE_DATASET}`, import.meta.url)
        ),
      },
    },
  })
}
