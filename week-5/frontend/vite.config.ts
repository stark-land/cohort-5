import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Disable code splitting - bundle everything into one file
        inlineDynamicImports: true,
        // Optional: Control output file names
        entryFileNames: 'main.js',
        assetFileNames: '[name].[ext]'
      }
    },
    // Optional: Also disable CSS code splitting
    cssCodeSplit: false
  }
})
