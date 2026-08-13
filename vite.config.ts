import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
})
