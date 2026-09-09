import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This project's spec requires .js file extensions (not .jsx) throughout src/,
// so esbuild is configured to treat all .js files under src/ as JSX.
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
})
