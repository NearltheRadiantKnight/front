
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue()
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
  server:{
    host: "localhost",
    port:8080,
    proxy:{
      '/api':{
        target:'http://localhost:8081',
        changeOrigin: true
      }
    },
    cors:true
  }
})
