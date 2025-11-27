/// <reference types="vitest" />

import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      ...react({
        // Only apply React SWC to React components
        include: /\.(jsx|tsx)$/,
      }),
      // Override apply to be more selective
      apply: (config, env) => {
        const id = config?.command;
        // Don't apply to Lit files
        return true;
      },
    },
  ],
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'build', 'dist', 'src/test/visual-parity.test.ts'],
    // Required for Lit component testing
    deps: {
      inline: ['lit', '@lit/reactive-element', '@lit/task'],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts', '**/*.config.*', '**/types/*', 'styled-system/'],
    },
  },
  resolve: {
    alias: {
      'class-variance-authority@0.7.1': 'class-variance-authority',
      '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
      '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
      '@storybook/test': path.resolve(__dirname, './src/test/storybook-test-shim.ts'),
      '@': path.resolve(__dirname, './src'),
      '@lit-components': path.resolve(__dirname, './src/components-lit'),
    },
  },
});
