import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expose on all network interfaces (0.0.0.0)
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
