import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // 🟢 SOLUCIÓN: Base URL explícita para enrutamiento correcto
  base: '/',

  // 🟢 Tipo de aplicación SPA para fallback correcto
  appType: 'spa',

  plugins: [
    react(),
    tailwindcss(),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
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
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  
  // 🔧 Configuración de preview (para producción local)
  preview: {
    port: 4173,
    strictPort: false,
    open: true,
    host: true
  }
})
