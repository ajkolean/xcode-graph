import type { Page, Locator } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { writeFileSync } from 'fs';
import { join } from 'path';

export interface VisualParityResult {
  match: boolean;
  pixelDifference: number;
  percentDifference: number;
  diffImagePath?: string;
  reactImagePath?: string;
  litImagePath?: string;
}

/**
 * Compare two DOM elements visually using pixel comparison
 *
 * @param reactElement - Locator for React component pane
 * @param litElement - Locator for Lit component pane
 * @param testName - Name of the test (for diff image filename)
 * @param threshold - Acceptable difference percentage (default 0.1%)
 */
export async function compareVisualParity(
  reactElement: Locator,
  litElement: Locator,
  testName: string,
  threshold = 0.1
): Promise<VisualParityResult> {
  // Take screenshots of both elements
  const reactScreenshot = await reactElement.screenshot();
  const litScreenshot = await litElement.screenshot();

  // Parse PNG images
  const reactImg = PNG.sync.read(reactScreenshot);
  const litImg = PNG.sync.read(litScreenshot);

  // Ensure same dimensions
  if (reactImg.width !== litImg.width || reactImg.height !== litImg.height) {
    // If dimensions differ, that's already a parity failure
    return {
      match: false,
      pixelDifference: 0,
      percentDifference: 100,
      diffImagePath: undefined,
    };
  }

  // Create diff image
  const { width, height } = reactImg;
  const diffImg = new PNG({ width, height });

  // Pixel comparison using pixelmatch
  const numDiffPixels = pixelmatch(
    reactImg.data,
    litImg.data,
    diffImg.data,
    width,
    height,
    {
      threshold: 0.1,           // Pixel matching threshold (0-1)
      includeAA: false,         // Ignore anti-aliasing differences
      diffColor: [255, 0, 255], // Pink highlight for differences
      diffMask: false,          // Show full image, not just diff
    }
  );

  const totalPixels = width * height;
  const percentDiff = (numDiffPixels / totalPixels) * 100;

  const match = percentDiff <= threshold;

  // Save images if there's a difference
  let diffImagePath: string | undefined;
  let reactImagePath: string | undefined;
  let litImagePath: string | undefined;

  if (!match) {
    const outputDir = join(process.cwd(), '.visual-parity-diffs');
    const safeName = testName.replace(/[^a-z0-9]/gi, '-').toLowerCase();

    reactImagePath = join(outputDir, `${safeName}-react.png`);
    litImagePath = join(outputDir, `${safeName}-lit.png`);
    diffImagePath = join(outputDir, `${safeName}-diff.png`);

    // Ensure directory exists
    require('fs').mkdirSync(outputDir, { recursive: true });

    // Save images
    writeFileSync(reactImagePath, PNG.sync.write(reactImg));
    writeFileSync(litImagePath, PNG.sync.write(litImg));
    writeFileSync(diffImagePath, PNG.sync.write(diffImg));
  }

  return {
    match,
    pixelDifference: numDiffPixels,
    percentDifference: percentDiff,
    diffImagePath,
    reactImagePath,
    litImagePath,
  };
}

/**
 * Wait for all Lit components to finish rendering
 */
export async function waitForLitComponents(page: Page, timeout = 1000): Promise<void> {
  // Wait for custom elements to upgrade and render
  await page.evaluate(async () => {
    const customElementTags = [
      'graph-badge',
      'graph-button',
      'graph-card',
      'graph-checkbox',
      'graph-input',
      'graph-label',
      'graph-progress',
      'graph-radio-group',
      'graph-separator',
      'graph-skeleton',
      'graph-slider',
      'graph-switch',
      'graph-tabs',
      'graph-textarea',
      'graph-toggle',
      'graph-accordion',
    ];

    const elements = Array.from(
      document.querySelectorAll(customElementTags.join(','))
    );

    await Promise.all(
      elements.map(async (el: any) => {
        if (el.updateComplete) {
          await el.updateComplete;
        }
      })
    );
  });

  // Extra wait for rendering to fully settle
  await page.waitForTimeout(timeout);
}
