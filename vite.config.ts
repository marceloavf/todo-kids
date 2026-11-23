import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: { license: { fileName: 'licenses/dependencies.md' } },
  plugins: [react(), tailwindcss()],
})
