import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Proxy configuration:
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    }
  }
})
