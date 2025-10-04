import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  root: '.',

  build: {
    outDir: 'dist',
    sourcemap: true
  },

  server: {
    // DEVELOPMENT PORT CONFIGURATION
    host: '0.0.0.0', // Listen on all interfaces (required for Replit)
    port: 5000,      // Frontend dev server (required for Replit webview)
    strictPort: true, // Fail if port 5000 is already in use
    
    // Allow Replit domains
    allowedHosts: [
      '.replit.dev',
      '.replit.app',
      '.repl.co',
      'localhost'
    ],
    
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Backend server
        changeOrigin: true,
        secure: false
      }
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './components'),
      '@bots': path.resolve(__dirname, './bots'),
      '@lib': path.resolve(__dirname, './lib'),
      '@services': path.resolve(__dirname, './services')
    }
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:3001/api')
  }
});