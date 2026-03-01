import path from 'node:path';
import { compileLitTemplates } from '@lit-labs/compiler';
import typescript from '@rollup/plugin-typescript';
import { minifyTemplateLiterals } from 'rollup-plugin-minify-template-literals';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

/**
 * Library build config — produces a single self-registering JS bundle.
 *
 * Usage:
 *   pnpm build:lib
 *
 * Output:
 *   dist/xcodegraph.js  — ES module, registers <graph-app> custom element
 *
 * Consumers load it via:
 *   <script type="module" src="https://cdn.jsdelivr.net/npm/xcode-graph/dist/xcodegraph.js"></script>
 */
export default defineConfig({
  plugins: [
    typescript({
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
      compilerOptions: {
        noCheck: true,
        composite: false,
        declaration: false,
        declarationMap: false,
        isolatedDeclarations: false,
        importHelpers: false,
      },
      transformers: {
        before: [compileLitTemplates()],
      },
    }),
    minifyTemplateLiterals(),
    visualizer({
      filename: 'dist/bundle-stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  // Disable esbuild — TypeScript compilation is handled by @rollup/plugin-typescript
  // with @lit-labs/compiler for pre-compiled Lit templates
  esbuild: false,
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
      fileName: () => 'xcodegraph.js',
    },
    rollupOptions: {
      // Bundle everything — no externals for CDN usage
      external: [],
      output: {
        chunkFileNames: '[name].js',
      },
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
