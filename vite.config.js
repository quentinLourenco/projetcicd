import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@App': path.resolve(__dirname, './src/App.jsx'),
      '@components': path.resolve(__dirname, './src/components'),
      '@atoms': path.resolve(__dirname, './src/components/atoms'),
      '@molecules': path.resolve(__dirname, './src/components/molecules'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@context': path.resolve(__dirname, './src/context'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@services': path.resolve(__dirname, './src/services'),
      '@service-interfaces': path.resolve(__dirname, './src/services/interfaces'),
      '@service-implementations': path.resolve(__dirname, './src/services/implementations'),
      '@firebase-config': path.resolve(__dirname, './src/firebase.js'),
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTest.js' 
  },
});
