import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ── Build-time env validation ──
function validateEnvVars() {
  return {
    name: 'validate-env-vars',
    configResolved() {
      if (!process.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('\n⚠️  [ENV] VITE_SUPABASE_ANON_KEY no está definida.')
        console.warn('   La app usará un stub de Supabase — auth y BD no funcionarán.')
        console.warn('   Configúrala en .env o en Vercel Environment Variables.\n')
      }
      if (!process.env.VITE_SUPABASE_URL) {
        console.warn('\n⚠️  [ENV] VITE_SUPABASE_URL no está definida.')
        console.warn('   La app usará un stub de Supabase.\n')
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    validateEnvVars(),
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
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'vendor-react'
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/animate.css')) return 'vendor-animations'
          if (id.includes('node_modules/firebase/')) return 'vendor-firebase-legacy'
          if (id.includes('node_modules/recharts')) return 'vendor-charts'
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons'
          if (id.includes('node_modules/dompurify') || id.includes('node_modules/marked')) return 'vendor-utils'
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) return 'vendor-pdf'
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    include: ['src/__tests__/**/*.test.js'],
    exclude: ['e2e/**', 'tests/**', 'node_modules/**'],
  },
})
