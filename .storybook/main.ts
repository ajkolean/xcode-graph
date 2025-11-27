// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from '@storybook/react-vite';
import path, { dirname } from 'path';

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
    '@storybook/addon-vitest'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // Exclude Lit components from React SWC transformation
    if (config.plugins) {
      config.plugins = config.plugins.map((plugin) => {
        if (plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'vite:react-swc') {
          return {
            ...plugin,
            exclude: [/components-lit/],
          };
        }
        return plugin;
      });
    }

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
