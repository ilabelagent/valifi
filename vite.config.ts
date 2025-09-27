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
    port: 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
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