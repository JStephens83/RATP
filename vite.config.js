import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Proxy configuration:
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://prim.iledefrance-mobilites.fr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // '/OpenData': {
      //   target: 'https://data.iledefrance-mobilites.fr',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, ''),
      // },

    }
  }
})
