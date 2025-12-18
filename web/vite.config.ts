import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages (subpath) deployments: allow overriding base at build-time.
  // In CI we set VITE_BASE="./" so assets resolve correctly without knowing repo name.
  base: process.env.VITE_BASE ?? '/',
})
