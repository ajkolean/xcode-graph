/// <reference types="vitest" />

import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const reactPlugin = {
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
};

const esbuildConfig = {
  // Enable decorators for Lit components
  target: 'esnext',
  tsconfigRaw: {
    compilerOptions: {
      experimentalDecorators: true,
      useDefineForClassFields: true,
    },
  },
};

const resolveConfig = {
  alias: {
    'class-variance-authority@0.7.1': 'class-variance-authority',
    '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
    '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
    '@': path.resolve(__dirname, './src'),
    '@lit-components': path.resolve(__dirname, './src/components-lit'),
  },
};

export default defineConfig({
  plugins: [
    reactPlugin,
    storybookTest({
      configDir: '.storybook',
      // Use istanbul coverage for storybook tests (required for preview browser mode)
      coverage: {
        provider: 'istanbul',
      },
    }),
  ],
  esbuild: {
    ...esbuildConfig,
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
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts', '**/*.config.*', '**/types/*', 'styled-system/'],
    },
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: true,
    },
    // Increase timeouts for browser mode
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    ...resolveConfig,
  },
});
