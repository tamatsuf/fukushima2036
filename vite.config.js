import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/fukushima2036_temp/**', '**/fukushima2036_temp.zip'],
    },
    proxy: {
      '/api': 'http://127.0.0.1:7071',
    },
  },
})
