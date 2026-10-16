import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      // Duas paginas: a link page (/) e a pre-avaliacao (/consultas).
      input: {
        main: resolve(__dirname, 'index.html'),
        consultas: resolve(__dirname, 'consultas.html'),
      },
    },
  },
})
