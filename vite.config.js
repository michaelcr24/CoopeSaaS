import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vercel sirve la app en la raiz del dominio; GitHub Pages la sirve bajo
// /coopesaas/ (nombre del repo). Vercel define VERCEL=1 automaticamente en build.
const base = process.env.VERCEL ? '/' : '/coopesaas/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base,
})
