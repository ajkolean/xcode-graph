// This file has been automatically migrated to valid ESM format by Storybook.

import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/web-components-vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  tags: {
    // Tag filtering configuration for tests
    test: {
      defaultFilterSelection: 'exclude', // Hide test stories from sidebar by default
    },
  },
  viteFinal: async (config) => {
    // Add path aliases matching tsconfig.json
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
      '@graph': path.resolve(__dirname, '../src/graph'),
      '@ui': path.resolve(__dirname, '../src/ui'),
      '@shared': path.resolve(__dirname, '../src/shared'),
      'styled-system': path.resolve(__dirname, '../styled-system'),
    };

    // Set esbuild target for Lit decorators
    if (config.esbuild) {
      config.esbuild.target = 'esnext';
    }

    return config;
  },
  staticDirs: ['../public'],
};

export default config;
