import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleCategorizeRequest } from './server/categorizeHandler.js';

export default defineConfig(({ mode }) => {
  // Load env variables (including GEMINI_API_KEY from process.env or .env file)
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

  return {
    plugins: [
      react(),
      {
        name: 'api-categorize-middleware',
        configureServer(server) {
          server.middlewares.use('/api/categorize', (req, res) => {
            handleCategorizeRequest(req, res, apiKey);
          });
        },
        configurePreviewServer(server) {
          server.middlewares.use('/api/categorize', (req, res) => {
            handleCategorizeRequest(req, res, apiKey);
          });
        }
      }
    ],
    server: {
      port: 5173,
      host: true
    }
  };
});

