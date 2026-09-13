import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

declare const process: { env: Record<string, string | undefined> }

// GitHub Pages serves a project repo from /<repo>/, so the workflow passes
// VITE_BASE. Anywhere else (local, a custom domain) it stays at the root.
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
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
