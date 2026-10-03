import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true, // describe/test/expect
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
