import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? ''),
        'process.env.REACT_APP_API_URL': JSON.stringify(env.VITE_API_URL || env.REACT_APP_API_URL || 'http://localhost:8080'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Monaco Editor - largest chunk (~600KB)
              if (id.includes('monaco-editor') || id.includes('@monaco-editor')) {
                return 'monaco-editor';
              }
              // Recharts - charts library (~200KB)
              if (id.includes('recharts') || id.includes('d3-')) {
                return 'recharts';
              }
              // React core vendor
              if (id.includes('node_modules/react/') ||
                  id.includes('node_modules/react-dom/') ||
                  id.includes('node_modules/react-router')) {
                return 'react-vendor';
              }
            },
          },
        },
      },
    };
});
