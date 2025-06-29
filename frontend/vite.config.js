import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
   base: './', // IMPORTANT for Electron to load local files
  plugins: [
    react(),
    tailwindcss()
  ],
})
