import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Custom chunk splitting: vendor libs and heavy admin pages
    rollupOptions: {
      output: {
        manualChunks: {
          // All React and router dependencies in a vendor chunk
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Admin chunk—add actual paths if/when you want more granular splits
          admin: [
            './src/components/admin/AdminDashboard.jsx',
            './src/components/admin/UserManagement.jsx',
            './src/components/admin/Analytics.jsx',
            './src/components/admin/Moderation.jsx',
            './src/components/admin/Permissions.jsx',
            './src/components/admin/SystemMonitoring.jsx'
          ],
        }
      }
    }
  }
})
