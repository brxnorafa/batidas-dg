import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      '/php': {
        target: 'http://localhost/batidas-dg/backend_php',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/php/, ''),
      },
    },
  },
})
