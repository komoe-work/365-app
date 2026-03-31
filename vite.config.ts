import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
      ],
      build: {
        minify: true,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes("node_modules")) {
                if (id.includes("framer-motion")) return "animations";
                if (id.includes("lucide-react")) return "icons";
                return "vendor";
              }
            }
          }
        }
      },
      esbuild: {
        drop: ['console', 'debugger'],
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
