import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Freebuff deploy: root vite config that delegates to app/.
 * The real app config lives in app/vite.config.js.
 * This config is minimal — just enough for `npx vite build` from root.
 */
export default defineConfig({
  root: 'app',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
    modulePreload: {
      resolveDependencies(url, deps) {
        return deps.filter(dep => !dep.includes('vendor-pdf'))
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'vendor-react'
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/animate.css')) return 'vendor-animations'
          if (id.includes('node_modules/recharts')) return 'vendor-charts'
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons'
          if (id.includes('node_modules/dompurify') || id.includes('node_modules/marked')) return 'vendor-utils'
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase'
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas') || id.includes('node_modules/canvg')) return 'vendor-pdf'
        },
      },
    },
  },
  resolve: {
    // Resolve dependencies from app/node_modules when building from root
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg'],
      manifest: {
        name: 'Proyectos PFC Tools',
        short_name: 'PFC Tools',
        description: 'Suite de 7 herramientas con IA para logística industrial',
        theme_color: '#0072CE',
        background_color: '#f8f9fa',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,jpg,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/assets\//,
          /^\/icons\//,
          /^\/logos\//,
          /^\/screenshots\//,
          /\/[^/?]+\.[^/]+$/,
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173, strictPort: true },
  test: {
    include: ['src/__tests__/**/*.test.{js,ts}'],
    exclude: ['e2e/**', 'tests/**', 'node_modules/**'],
  },
})
