import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // `wrangler dev` inside worker/ serves the assistant on 8787, so the
      // browser only ever talks to a same-origin path and the key stays in
      // Cloudflare.
      '/api/chat': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: false,
        rewrite: () => '/',
      },
    },
  },
  build: {
    cssMinify: 'lightningcss',
  },
})
