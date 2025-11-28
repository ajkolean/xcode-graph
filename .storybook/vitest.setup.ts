import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/web-components-vite';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import * as previewAnnotations from './preview';

// Apply Storybook's project annotations (decorators, parameters, etc.) to Vitest tests
// This ensures accessibility tests and other addon configurations work in test context
const annotations = setProjectAnnotations([
  previewAnnotations,
  a11yAddonAnnotations,
]);

// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll);
