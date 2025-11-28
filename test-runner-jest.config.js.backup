import { getJestConfig } from '@storybook/test-runner';

// The default Jest configuration comes from @storybook/test-runner
const testRunnerConfig = getJestConfig();

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
  ...testRunnerConfig,
  // Increase timeout for stories with Shadow DOM and interactions
  testTimeout: 30000,
  maxWorkers: 2,
};
