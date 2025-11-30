import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/cities': {
        target: 'http://cdf.map.defuy.cn:10888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cities/, '')
      }
    }
  },
})
