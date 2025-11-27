import { test, expect } from '@playwright/test';

test('Button Parity - Default', async ({ page }) => {
  // Navigate to the story's iframe
  await page.goto('/iframe.html?id=parity-button--default&viewMode=story');

  // Wait for the component to be visible
  const container = page.locator('#storybook-root');
  await expect(container).toBeVisible();

  // Locate the React and Lit containers within the ParityComparison
  // Based on the styles in ParityComparison.tsx
  const reactPane = page.locator('div > div:first-child').filter({ hasText: 'React Button' });
  const litPane = page.locator('div > div:last-child').filter({ hasText: 'Lit Button' });

  // Take snapshots
  // Note: In a real scenario, we might mask the text if fonts render differently across envs
  await expect(page).toHaveScreenshot('button-parity-full.png', {
    maxDiffPixelRatio: 0.02, // Allow small anti-aliasing diffs
  });
});

test('Button Parity - All Variants', async ({ page }) => {
  await page.goto('/iframe.html?id=parity-button--all-variants&viewMode=story');
  const container = page.locator('#storybook-root');
  await expect(container).toBeVisible();
  
  // Allow time for any lazy loading or hydration
  await page.waitForTimeout(1000);

  await expect(page).toHaveScreenshot('button-parity-variants.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.02,
  });
});
