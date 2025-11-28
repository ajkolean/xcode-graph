// This file has been automatically migrated to valid ESM format by Storybook.
import type { AddonOptionsVite } from '@storybook/addon-coverage';
import type { StorybookConfig } from '@storybook/web-components-vite';
import path, { dirname } from 'node:path';
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Coverage addon configuration for Vite
const coverageConfig: AddonOptionsVite = {
  istanbul: {
    include: ['src/**/*.{ts,tsx}'],
    exclude: [
      'src/**/*.stories.{ts,tsx}',
      'src/**/*.test.{ts,tsx}',
      'src/test/**',
      'src/**/*.d.ts',
    ],
  },
};

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
    {
      name: '@storybook/addon-coverage',
      options: coverageConfig,
    },
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  tags: {
    // Tag filtering configuration for React/Lit parity testing
    test: {
      defaultFilterSelection: 'exclude', // Hide tests from sidebar by default
    },
  },
  viteFinal: async (config) => {
    // Add path aliases matching tsconfig.json
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
      '@lit-components': path.resolve(__dirname, '../src/components-lit'),
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
