import type { TestRunnerConfig } from '@storybook/test-runner';
import { injectAxe, checkA11y } from 'axe-playwright';

const config: TestRunnerConfig = {
  // Increase timeout for stories with interactions and Shadow DOM
  testTimeout: 30000,

  async preVisit(page) {
    // Wait for Lit components to be defined and rendered
    await page.waitForTimeout(200);

    // Inject axe-core for accessibility testing
    await injectAxe(page);
  },
  async postVisit(page) {
    // Run accessibility checks after the story renders
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      // Match the same rules configured in preview.ts
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      },
    });
  },
};

export default config;
