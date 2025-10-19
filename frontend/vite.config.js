import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_BACKEND_URL || 'http://127.0.0.1:8002'
  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: backend,
          changeOrigin: true,
          secure: false,
        },
        '/sanctum': {
          target: backend,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
