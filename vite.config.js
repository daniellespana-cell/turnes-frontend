import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  // 🟢 SOLUCIÓN: Base URL explícita para enrutamiento correcto
  base: '/',

  // 🟢 Tipo de aplicación SPA para fallback correcto
  appType: 'spa',

  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
      // Force the new Service Worker to take over immediately (fixes Android showing old icon)
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Turnes',
        short_name: 'Turnes',
        description: 'La Plataforma Élite para Talento Operativo',
        theme_color: '#09090b',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // 🟢 Optimización de consola (Remueve console.logs en producción)
  esbuild: {
    pure: ['console.log', 'console.info', 'console.debug', 'console.trace'],
  },
  
  server: {
    // 🔧 SOLUCIÓN PUERTO: Puerto por defecto con fallback automático
    port: 5173,
    strictPort: false, // ✅ Permite usar el siguiente puerto si está ocupado
    open: true,
    host: true, // Permite acceso desde red local
    
    // 🟢 SOLUCIÓN SPA: Configuración para React Router
    // Esto asegura que todas las rutas redirijan a index.html
    proxy: {},
    cors: true,
    
    // Permitir acceso a archivos del sistema
    fs: {
      allow: ['..', '.']
    },
    
    // 🔧 Configuración de HMR (Hot Module Replacement)
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost'
    }
  },
  
  // 🟢 Optimización de build y Arquitectura de Chunks (Anti-TBT)
  build: {
    outDir: 'dist',
    sourcemap: true,
    // ⚡ Senior Move: Forzar la división del AST (Abstract Syntax Tree) para paralelizar descarga y reducir Script Evaluation en móviles
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-maps';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
            if (id.includes('@daily-co')) return 'vendor-rtc';
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('sonner')) return 'vendor-ui';
            if (id.includes('@sentry')) return 'vendor-sentry';
            return 'vendor-core';
          }
        }
      }
    }
  },
  
  // 🔧 Configuración de preview (para producción local)
  preview: {
    port: 4173,
    strictPort: false,
    open: true,
    host: true
  }
})
