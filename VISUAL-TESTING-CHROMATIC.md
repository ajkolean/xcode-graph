# Visual Testing with Chromatic & Playwright

This project integrates **Chromatic** with **Playwright** to provide robust visual regression testing. This setup allows you to capture interactive snapshots within your Playwright E2E tests and review visual changes in Chromatic's cloud environment.

## 🚀 Overview

- **Full-Page Archives:** Chromatic captures the full page (DOM, styling, assets), allowing interactive debugging.
- **Cloud Review:** Visual changes are reviewed and approved/rejected in the Chromatic web app.
- **Parallel Execution:** Tests run in parallel on Chromatic's infrastructure.

## 📦 Setup

The integration uses the `@chromatic-com/playwright` package which wraps the standard Playwright test runner.

### 1. Installation (Already Completed)

The following packages have been installed:
```bash
pnpm add -D chromatic @chromatic-com/playwright
```

### 2. Test Configuration

Existing Playwright tests have been updated to import from `@chromatic-com/playwright` instead of `@playwright/test`:

```typescript
// ✅ Correct import for Chromatic
import { test, expect } from '@chromatic-com/playwright';

test('Homepage', async ({ page }) => {
  await page.goto('http://localhost:6006');
  await expect(page).toHaveTitle(/TuistGraph/);
});
```

## 🏃‍♂️ Running Visual Tests

To run your visual tests, you need a Chromatic **Project Token**.

1.  **Sign Up/Sign In:** Go to [Chromatic.com](https://www.chromatic.com/) and sign in.
2.  **Create Project:** Create a new project (or use an existing one) to get your project token.
3.  **Run Tests:**

```bash
# Run Playwright tests as usual (local verification)
npx playwright test

# Run tests and upload to Chromatic (requires token)
npx chromatic --playwright -t=<YOUR_PROJECT_TOKEN>
```

## 🔄 CI Integration

To run these tests automatically in CI, configure your workflow (e.g., GitHub Actions) to run the `chromatic` command with the token stored as a secret.

## 📝 Updated Files

The following test files have been updated to use Chromatic:
- `src/test/visual-parity.test.ts`
- `tests/visual/parity.spec.ts`

## 📚 Resources

- [Chromatic for Playwright Documentation](https://www.chromatic.com/docs/playwright)
