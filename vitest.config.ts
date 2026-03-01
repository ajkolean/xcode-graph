/// <reference types="vitest" />

import path from 'node:path';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

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
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/fixtures/**',
        'src/vite-env.d.ts',
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: [
            'src/services/*.test.ts',
            'src/shared/schemas/*.test.ts',
            'src/shared/signals/*.test.ts',
            'src/shared/controllers/*.test.ts',
            'src/shared/machines/*.test.ts',
            'src/graph/signals/*.test.ts',
            'src/graph/utils/*.test.ts',
            'src/graph/layout/*.test.ts',
            'src/graph/controllers/*.test.ts',
            'src/graph/components/*.test.ts',
            'src/ui/utils/*.test.ts',
            'src/ui/components/*.test.ts',
            'src/ui/layout/*.test.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'component',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          include: ['src/**/*.browser.test.ts'],
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@graph': path.resolve(__dirname, './src/graph'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
