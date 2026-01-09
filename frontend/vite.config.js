import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    // Handle SPA routing in dev mode
    historyApiFallback: true
  },
  preview: {
    // Handle SPA routing in preview mode
    historyApiFallback: true
  }
})
