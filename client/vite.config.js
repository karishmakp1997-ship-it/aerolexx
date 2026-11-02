import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development /api requests are forwarded to the Express server.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: process.env.VITE_DEV_API || 'http://localhost:5000', changeOrigin: true },
    },
  },
});
