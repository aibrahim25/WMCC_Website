import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` makes the real site in /dist for Hostinger.
// `npm run build:preview` makes one self-contained HTML file in /dist-preview (used for the shareable preview).
export default defineConfig(({ mode }) => ({
  plugins: mode === 'preview' ? [react(), viteSingleFile()] : [react()],
  build: {
    outDir: mode === 'preview' ? 'dist-preview' : 'dist',
  },
}))
