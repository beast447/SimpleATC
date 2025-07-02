import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000
  },
  // Strip out console.* and debugger statements in production for smaller bundles
  esbuild: {
    drop: ['console', 'debugger']
  }
}) 