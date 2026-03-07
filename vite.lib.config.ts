import path from 'node:path';
import { compileLitTemplates } from '@lit-labs/compiler';
import typescript from '@rollup/plugin-typescript';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

/**
 * Library build config — produces a single self-registering JS bundle.
 *
 * Usage:
 *   pnpm build:lib
 *
 * Output:
 *   dist/xcodegraph.js  — ES module, registers <xcode-graph> custom element
 *
 * Consumers load it via:
 *   <script type="module" src="https://cdn.jsdelivr.net/npm/xcode-graph/dist/xcodegraph.js"></script>
 */
export default defineConfig({
  // Use relative paths so worker URLs resolve correctly when consumed as an npm package
  base: './',
  plugins: [
    typescript({
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
      compilerOptions: {
        composite: false,
        declaration: false,
        declarationMap: false,
        isolatedDeclarations: false,
        verbatimModuleSyntax: false,
        importHelpers: false,
      },
      transformers: {
        before: [compileLitTemplates()],
      },
    }),
    visualizer({
      filename: 'dist/bundle-stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  // Disable oxc — TypeScript compilation is handled by @rollup/plugin-typescript
  // with @lit-labs/compiler for pre-compiled Lit templates
  oxc: false,
  resolve: {
    extensions: ['.js', '.ts', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@graph': path.resolve(__dirname, './src/graph'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, './src/components/xcode-graph.ts'),
      formats: ['es'],
      fileName: () => 'xcodegraph.js',
    },
    rolldownOptions: {
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
    rolldownOptions: {
      output: {
        // Emit worker as a separate file with a stable name
        entryFileNames: '[name].js',
      },
    },
    plugins: () => [
      typescript({
        exclude: ['**/*.test.ts', '**/*.spec.ts'],
        compilerOptions: {
          composite: false,
          declaration: false,
          declarationMap: false,
          isolatedDeclarations: false,
          verbatimModuleSyntax: false,
          importHelpers: false,
        },
      }),
    ],
  },
});
