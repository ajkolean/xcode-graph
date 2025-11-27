// This file has been automatically migrated to valid ESM format by Storybook.
import type { AddonOptionsVite } from '@storybook/addon-coverage';
import type { StorybookConfig } from '@storybook/react-vite';
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
    name: '@storybook/react-vite',
    options: {},
  },
  tags: {
    // Tag filtering configuration for React/Lit parity testing
    react: {
      title: 'React',
      description: 'React implementation stories',
    },
    lit: {
      title: 'Lit',
      description: 'Lit Web Components implementation stories',
    },
    parity: {
      title: 'Parity',
      description: 'Stories used for visual parity comparison',
    },
    comparison: {
      title: 'Comparison',
      description: 'Side-by-side comparison stories',
    },
    test: {
      title: 'Tests',
      description: 'Stories with attached tests',
      defaultFilterSelection: 'exclude', // Hide tests from sidebar by default
    },
    interactive: {
      title: 'Interactive',
      description: 'Interactive demonstration stories',
    },
    showcase: {
      title: 'Showcase',
      description: 'Stories showcasing all variants',
    },
  },
  viteFinal: async (config) => {
    // Exclude Lit components from React SWC transformation and React Docgen
    if (config.plugins) {
      config.plugins = config.plugins
        .filter((plugin) => !(plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'storybook:react-docgen-plugin'))
        .map((plugin) => {
          if (plugin && typeof plugin === 'object' && 'name' in plugin) {
            if (plugin.name === 'vite:react-swc' || plugin.name === 'storybook:react-docgen-plugin') {
              return {
                ...plugin,
                exclude: [/components-lit/],
              };
            }
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
