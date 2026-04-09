import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/admin': 'http://127.0.0.1:8000',
      '/livewire': 'http://127.0.0.1:8000',
      '/filament': 'http://127.0.0.1:8000',
    }
  }
})
