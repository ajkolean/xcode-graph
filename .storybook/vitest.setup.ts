import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/react';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import * as projectAnnotations from './preview';

// Reuse the global test setup (matchers, DOM mocks)
import '../src/test/setup';

// Set up Storybook with a11y addon integration
const project = setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
]);

// Run Storybook's beforeAll hook
beforeAll(project.beforeAll);
