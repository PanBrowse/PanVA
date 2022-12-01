import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import { createHtmlPlugin } from 'vite-plugin-html'

export default ({ mode }: any) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  // https://vitejs.dev/config/
  return defineConfig({
    plugins: [
      vue(),
      vueJsx(),
      createHtmlPlugin({
        minify: true,
        entry: 'src/main.ts',
        template: 'index.html',
        inject: {
          data: {
            title: 'Some title',
          },
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  })
}
