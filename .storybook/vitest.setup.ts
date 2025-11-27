import { setProjectAnnotations } from '@storybook/react';
import * as previewAnnotations from './preview';

// Apply Storybook's project annotations (decorators, parameters, etc.) to Vitest tests
// This ensures accessibility tests and other addon configurations work in test context
const project = setProjectAnnotations([previewAnnotations]);

// Wait for Storybook to initialize
export const beforeAll = async () => {
  await project.beforeAll?.();
};
