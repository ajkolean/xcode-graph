# Interaction Testing Guide

This project has **full interaction testing** capabilities with Shadow DOM support for testing Lit Web Components.

## 🎯 What You Have

### ✅ Installed & Configured

- **@storybook/addon-vitest** - Run component tests in Storybook
- **@vitest/coverage-v8** - Code coverage for tests
- **shadow-dom-testing-library** - Query inside Shadow DOM
- **TypeScript types** - Full type safety for Shadow DOM queries

### ✅ Available Query Methods

With Shadow DOM support configured in `.storybook/preview.ts`, you can use these queries in your `play()` functions:

#### Shadow DOM Queries (for Lit components)
```typescript
// Find single elements
canvas.findByShadowRole('button', { name: /Submit/i })
canvas.getByShadowText('Hello')
canvas.queryByShadowLabelText('Email')

// Find multiple elements
canvas.findAllByShadowRole('checkbox')
canvas.getAllByShadowText(/item/i)
```

#### Standard DOM Queries (for React components)
```typescript
canvas.findByRole('button', { name: /Submit/i })
canvas.getByText('Hello')
canvas.queryByLabelText('Email')
```

## 📝 Writing Interaction Tests

### Example 1: Testing with Play Function

```typescript
export const InteractiveExample = meta.story({
  name: '🎯 Interactive Test',
  tags: ['lit', 'interactive', 'test'],
  args: {
    onClick: fn(), // Mock function
  },
  render: (args) => (
    <LitComponent onClick={args.onClick} />
  ),
  play: async ({ canvas, args, step, userEvent }) => {
    await step('Wait for component to render', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    await step('Find and click button', async () => {
      const button = await canvas.findByShadowRole('button');
      await expect(button).toBeTruthy();
      await userEvent.click(button);
    });

    await step('Verify callback was called', async () => {
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
  },
});
```

### Example 2: Using .test() Syntax

```typescript
LitButton.test('should render with correct text', async ({ canvas, expect }) => {
  // Wait for Lit component
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Query inside shadow DOM
  const button = await canvas.findByShadowRole('button');
  await expect(button).toBeTruthy();

  const text = await canvas.findByShadowText('Click me');
  await expect(text).toBeTruthy();
});
```

## 🧪 Real Examples in This Project

### 1. StatsCard - Shadow DOM Assertions
**File:** `src/stories/StatsCard.stories.tsx:174`

```typescript
play: async ({ canvas }) => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Query inside shadow DOM
  const labels = await canvas.findAllByShadowText(/Hover Me|Highlighted/i);
  await expect(labels.length).toBeGreaterThanOrEqual(2);

  const value42 = await canvas.findByShadowText('42');
  await expect(value42).toBeTruthy();
}
```

### 2. ClearFiltersButton - User Interactions with Steps
**File:** `src/stories/ClearFiltersButton.stories.tsx:186`

```typescript
play: async ({ canvas, args, step }) => {
  await step('Wait for component to render', async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  await step('Find and click the button using Shadow DOM queries', async () => {
    const button = await canvas.findByShadowRole('button');
    await userEvent.click(button);
  });

  await step('Verify the callback was called', async () => {
    await expect(args.onClearFilters).toHaveBeenCalledTimes(1);
  });
}
```

### 3. ClusterTypeBadge - Attribute Verification
**File:** `src/stories/ClusterTypeBadge.stories.tsx:161`

```typescript
LitPackage.test('should render with correct type', async ({ canvas }) => {
  const packageText = canvas.getByText('Package');
  const badgeElement = packageText.closest('cluster-type-badge');

  const clusterType = badgeElement.getAttribute('clustertype');
  await expect(clusterType).toBe('package');
});
```

## 🚀 Running Tests

### In Storybook UI
1. Start Storybook: `pnpm storybook`
2. Open the **Testing** widget in the sidebar
3. Click **"Run component tests"**
4. View results in the **Interactions panel**

### Via CLI
```bash
# Run all tests (including story tests)
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run Storybook-specific tests
pnpm test -- --project=storybook
```

### In CI
Your tests will run automatically in CI when you push. Coverage reports will be generated.

## 🔧 Available Testing Utilities

### From `@storybook/test`

```typescript
import { within, userEvent, expect, fn, step } from '@storybook/test';

// canvas - Query the rendered component
const button = await canvas.findByShadowRole('button');

// userEvent - Simulate user interactions
await userEvent.click(button);
await userEvent.type(input, 'Hello');
await userEvent.hover(element);

// expect - Make assertions
await expect(button).toBeTruthy();
await expect(args.onClick).toHaveBeenCalled();

// fn - Create mock functions
const onClickMock = fn();

// step - Group interactions with labels
await step('Click the button', async () => {
  await userEvent.click(button);
});
```

## 📊 Coverage

Coverage is automatically calculated for your component tests. View it:

1. **In Storybook UI** - Enable coverage in the testing widget
2. **HTML Report** - Open `./coverage/index.html` after running tests
3. **Terminal** - Run `pnpm test:coverage`

## 🎨 Best Practices

### 1. Always await interactions
```typescript
// ❌ Wrong
userEvent.click(button);

// ✅ Right
await userEvent.click(button);
```

### 2. Use step() for clarity
```typescript
await step('Fill in the form', async () => {
  await userEvent.type(emailInput, 'test@example.com');
  await userEvent.type(passwordInput, 'password123');
});

await step('Submit the form', async () => {
  await userEvent.click(submitButton);
});
```

### 3. Wait for Lit components to render
```typescript
// Always wait for Lit components before querying
await new Promise((resolve) => setTimeout(resolve, 100));

// Then query
const button = await canvas.findByShadowRole('button');
```

### 4. Use semantic queries
```typescript
// ✅ Prefer accessible queries
canvas.findByShadowRole('button', { name: /Submit/i })

// ⚠️ Use data-testid as last resort
canvas.getByShadowTestId('submit-button')
```

## 🐛 Debugging

### View in Interactions Panel
All test steps and assertions appear in the **Interactions panel** in Storybook UI with:
- ✅ Passed assertions
- ❌ Failed assertions
- 🔄 Step-by-step execution
- ⏸️ Pause/resume controls

### Common Issues

**Issue:** "Cannot find element inside shadow DOM"
```typescript
// Solution: Use Shadow DOM query methods
await canvas.findByShadowRole('button') // ✅
// Not: await canvas.findByRole('button') // ❌
```

**Issue:** "Element not found"
```typescript
// Solution: Wait for Lit components to render
await new Promise((resolve) => setTimeout(resolve, 100));
const element = await canvas.findByShadowRole('button');
```

## 📚 Learn More

- [Storybook Interaction Testing](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [Shadow DOM Testing Library](https://github.com/KonnorRogers/shadow-dom-testing-library)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Vitest Expect API](https://vitest.dev/api/expect.html)
