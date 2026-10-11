import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // 127.0.0.1 — Windows-da localhost/IPv6 gözləməsinin qarşısını alır
        target: 'http://127.0.0.1:5164',
        changeOrigin: true,
      },
    },
  },
})
