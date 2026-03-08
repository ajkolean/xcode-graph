import path from 'node:path';
import { compileLitTemplates } from '@lit-labs/compiler';
import typescript from '@rollup/plugin-typescript';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type Plugin } from 'vite';

/**
 * Vite plugin that wraps `new Worker(url)` calls with a cross-origin fallback.
 *
 * When the library JS is loaded from a CDN but the page is on a different origin
 * (e.g., localhost), `new Worker(cdnUrl)` throws a SecurityError. This plugin
 * post-processes the built output to catch that error and retry with a same-origin
 * blob URL using `importScripts` (classic) or `import` (module workers).
 *
 * Must run AFTER Vite's worker plugin so workers are still emitted as separate files.
 */
function crossOriginWorkerPlugin(): Plugin {
  return {
    name: 'cross-origin-worker',
    enforce: 'post',
    renderChunk(code) {
      if (!code.includes('new Worker(')) return null;

      // Inject the helper function once at the top of the chunk
      const helper = `\
function __createWorker(url, opts) {
  try { return new Worker(url, opts); }
  catch (e) {
    if (!(url instanceof URL) || !(e instanceof DOMException) || e.name !== "SecurityError") throw e;
    var s = opts?.type === "module"
      ? 'import ' + JSON.stringify(url.href)
      : 'importScripts(' + JSON.stringify(url.href) + ')';
    return new Worker(URL.createObjectURL(new Blob([s], {type: "text/javascript"})), opts);
  }
}\n`;

      // Replace `new Worker(` with `__createWorker(` globally
      return helper + code.replaceAll('new Worker(', '__createWorker(');
    },
  };
}

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
    crossOriginWorkerPlugin(),
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
  define: {
    'process.env.NODE_ENV': '"production"',
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
