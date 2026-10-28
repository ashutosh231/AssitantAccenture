import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'AWS_', 'BEDROCK_'],
  server: {
    host: true, // Listen on all local IPs so mobile devices on the same Wi-Fi can connect
    port: 5173,
    proxy: {
      // Proxy for Bedrock Runtime to handle CORS during local phone development if needed
      '/api/bedrock': {
        target: 'https://bedrock-runtime.us-east-1.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bedrock/, ''),
        secure: true
      }
    }
  }
});
