import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  esbuild: {
    // Enable decorators for Lit components
    target: 'esnext',
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: true,
      },
    },
  },
  resolve: {
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
  optimizeDeps: {
    exclude: ['comlink'],
  },
});
