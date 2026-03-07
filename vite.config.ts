import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  oxc: {
    target: 'esnext',
  },
  resolve: {
    conditions: ['development'],
    extensions: ['.js', '.ts', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@graph': path.resolve(__dirname, './src/graph'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
  },
  worker: {
    format: 'es',
    plugins: () => [],
  },
  optimizeDeps: {},
});
