import { defineConfig } from 'vite';

export default defineConfig({
  root: 'test-client',
  build: {
    outDir: '../dist',
  },
  resolve: {
    alias: {
      '@': '/test-client',
    },
  },
});
