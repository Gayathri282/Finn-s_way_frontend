import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL ? process.env.VITE_API_BASE_URL.replace(/\/api$/, '') : 'http://localhost:4000',
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ['**/public/videos/**'],
    },
  },
})
