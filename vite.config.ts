import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative asset paths: the same build works at the domain root (Vercel)
// and under /mee-rai/ (GitHub Pages). Routing is hash-based, so no rewrites needed.
export default defineConfig({ base: './', plugins: [react()] })
