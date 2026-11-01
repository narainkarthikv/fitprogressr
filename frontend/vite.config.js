
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
