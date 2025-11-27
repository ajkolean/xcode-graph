import { test, expect } from '@playwright/test';
import { compareVisualParity, waitForLitComponents } from './visual-parity-helpers';

test.describe('Visual Parity: React vs Lit Pixel Comparison', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  // Button Stories
  test('Button - Default', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-button--default');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Button-Default', 0.1);

    expect(result.match, `Visual difference: ${result.pixelDifference} pixels (${result.percentDifference.toFixed(2)}%)${result.diffImagePath ? `\nDiff: ${result.diffImagePath}` : ''}`).toBe(true);
  });

  test('Button - All Variants', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-button--all-variants');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Button-AllVariants', 0.1);
    expect(result.match).toBe(true);
  });

  test('Button - Disabled', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-button--disabled');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Button-Disabled', 0.1);
    expect(result.match).toBe(true);
  });

  // Badge Stories
  test('Badge - Default', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-badge--default');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Badge-Default', 0.1);
    expect(result.match).toBe(true);
  });

  test('Badge - All Variants', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-badge--all-variants');
    await waitForLitComponents(page, 1500); // More time for multiple badges

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Badge-AllVariants', 0.1);
    expect(result.match).toBe(true);
  });

  // Form Controls
  test('Input - Comparison', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-form-controls--input-comparison');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Input-Comparison', 0.1);
    expect(result.match).toBe(true);
  });

  test('Checkbox - Comparison', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-form-controls--checkbox-comparison');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Checkbox-Comparison', 0.1);
    expect(result.match).toBe(true);
  });

  test('Switch - Comparison', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-form-controls--switch-comparison');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Switch-Comparison', 0.1);
    expect(result.match).toBe(true);
  });

  // Card Stories
  test('Card - Default', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-card--default');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Card-Default', 0.1);
    expect(result.match).toBe(true);
  });

  // Separator Stories
  test('Separator - Horizontal', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-separator--horizontal');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Separator-Horizontal', 0.1);
    expect(result.match).toBe(true);
  });

  test('Separator - Vertical', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-separator--vertical');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Separator-Vertical', 0.1);
    expect(result.match).toBe(true);
  });

  // Skeleton Stories
  test('Skeleton - Default', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-skeleton--default');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Skeleton-Default', 0.1);
    expect(result.match).toBe(true);
  });

  // Progress Stories
  test('Progress - Default', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-progress--default');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Progress-Default', 0.1);
    expect(result.match).toBe(true);
  });

  // Toggle Stories
  test('Toggle - Default', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-toggle--default');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Toggle-Default', 0.1);
    expect(result.match).toBe(true);
  });

  // Slider Stories
  test('Slider - Default', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-slider--default');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Slider-Default', 0.1);
    expect(result.match).toBe(true);
  });

  // Radio Group Stories
  test('Radio Group - Default', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-radio-group--default');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'RadioGroup-Default', 0.1);
    expect(result.match).toBe(true);
  });

  // Tabs Stories
  test('Tabs - Default', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-tabs--default');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Tabs-Default', 0.1);
    expect(result.match).toBe(true);
  });

  // Accordion Stories
  test('Accordion - Default', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/parity-accordion--default');
    await waitForLitComponents(page);

    const reactPane = page.locator('[data-testid="react-pane"]').first();
    const litPane = page.locator('[data-testid="lit-pane"]').first();

    const result = await compareVisualParity(reactPane, litPane, 'Accordion-Default', 0.1);
    expect(result.match).toBe(true);
  });
});
