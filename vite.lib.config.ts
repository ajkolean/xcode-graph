import path from 'node:path';
import { defineConfig } from 'vite';

/**
 * Library build config — produces a single self-registering JS bundle.
 *
 * Usage:
 *   pnpm build:lib
 *
 * Output:
 *   dist/tuistgraph.js  — ES module, registers <graph-app> custom element
 *
 * Consumers load it via:
 *   <script type="module" src="https://cdn.jsdelivr.net/npm/@tuist/graph/dist/tuistgraph.js"></script>
 */
export default defineConfig({
  plugins: [],
  esbuild: {
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
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, './src/components/graph-app.ts'),
      formats: ['es'],
      fileName: () => 'tuistgraph.js',
    },
    rollupOptions: {
      // Bundle everything — no externals for CDN usage
      external: [],
    },
    cssCodeSplit: false,
    // Inline CSS into JS so consumers only need one <script> tag
    cssMinify: true,
  },
  worker: {
    format: 'es',
    plugins: () => [],
  },
});
