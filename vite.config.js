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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Turnes',
        short_name: 'Turnes',
        description: 'La Plataforma Élite para Talento Operativo',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
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
  
  // 🟢 Optimización de build
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  
  // 🔧 Configuración de preview (para producción local)
  preview: {
    port: 4173,
    strictPort: false,
    open: true,
    host: true
  }
})
