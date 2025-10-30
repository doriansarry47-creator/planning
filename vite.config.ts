import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
