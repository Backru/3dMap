import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/cities': {
        target: 'http://cdf.defuy.cn:10889/cities',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cities/, '')
      }
    }
  },
  base: '/3dMap/'
})
