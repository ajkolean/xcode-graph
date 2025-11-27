# Chromatic Features Guide

This guide explains the Chromatic features available in this project and how to use them.

## Current Status

### ✅ Already Configured and Running

1. **Visual Regression Tests** - Running in CI on every PR
   - Tests light and dark modes
   - TurboSnap enabled (only tests changed stories)
   - Auto-accept on main branch
   - Shadow DOM support for Lit components

2. **Accessibility Tests** - Running automatically in CI
   - Powered by @storybook/addon-a11y and axe
   - Tests all stories for WCAG violations
   - Results available in Chromatic dashboard

3. **Visual Tests Addon** - Installed but not authenticated
   - Package: @chromatic-com/storybook@3.2.7
   - Enables local visual testing in Storybook
   - Requires one-time authentication to use

---

## Feature 1: Chromatic Accessibility Tests

### What It Does

Chromatic automatically runs accessibility tests on all your stories in CI and tracks violations over time using regression-based testing. This means:

- **First build**: Establishes a baseline of current accessibility violations
- **Subsequent builds**: Only flags NEW or CHANGED violations
- **Dashboard**: Provides a bird's-eye view of accessibility health across all components

### Current vs. Chromatic Accessibility Testing

| Feature | @storybook/addon-a11y (Local) | Chromatic (CI) |
|---------|------------------------------|----------------|
| When it runs | During local development | On every CI build |
| What it shows | ALL violations at current moment | NEW/CHANGED violations vs baseline |
| Dashboard | No | Yes - across all components |
| Regression tracking | No | Yes - commit-to-commit tracking |
| Blocks PRs | No (manual review) | Yes (optional - can fail build) |

**Key insight**: These tools complement each other. Use the a11y addon during development to catch issues early, and rely on Chromatic in CI to prevent regressions.

### How to Start Using It

#### Step 1: Check Current Accessibility Status

1. Go to your Chromatic project dashboard
2. Navigate to the "Accessibility" tab
3. You'll see a list of all violations detected in your latest build

#### Step 2: Establish Your Baseline

**Important**: The first time you review accessibility results, you'll need to establish a baseline. This tells Chromatic "these are the violations we're aware of."

Options:

**A) Accept all current violations as baseline (recommended for starting)**
- This allows you to prevent NEW violations without blocking on existing ones
- You can fix legacy violations incrementally over time
- Future PRs will only fail if they introduce NEW violations

**B) Fix all violations before establishing baseline**
- Ensures zero accessibility debt going forward
- May take significant time depending on violation count
- All future PRs must be violation-free

#### Step 3: Configure PR Checks (Optional)

By default, Chromatic CI builds succeed even with accessibility violations (due to `exitZeroOnChanges: true` in the workflow).

To fail builds on new accessibility violations:

1. Update `.github/workflows/chromatic.yml`:
   ```yaml
   - name: Run Chromatic
     uses: chromaui/action@latest
     with:
       projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
       buildScriptName: 'build-storybook'
       onlyChanged: true
       autoAcceptChanges: 'main'
       exitZeroOnChanges: false  # Changed from true
       exitOnceUploaded: true
   ```

2. This will cause CI to fail if:
   - New accessibility violations are introduced
   - Existing violations are modified

#### Step 4: Team Workflow

**During Development:**
1. Developer creates new component/story
2. Checks @storybook/addon-a11y panel locally
3. Fixes any violations before committing

**During Code Review:**
1. PR triggers Chromatic CI build
2. If new accessibility violations detected → Build fails (if configured)
3. Reviewer checks Chromatic dashboard for details
4. Options:
   - Fix the violation and push new commit
   - Accept the violation as intentional (updates baseline)

**Tracking Progress:**
- Use Chromatic dashboard to monitor violation trends
- Set team goals to reduce violation count over time
- Celebrate incremental improvements

### Example Workflow

```
Initial State: 50 accessibility violations across all stories
↓
Action: Accept as baseline
↓
PR #1: Adds new Button with missing aria-label
Result: Chromatic FAILS ❌ (new violation detected)
Action: Add aria-label, push fix
Result: Chromatic PASSES ✅ (50 violations, unchanged)
↓
PR #2: Fixes 10 legacy violations in Card component
Result: Chromatic detects CHANGES (50 → 40 violations)
Action: Review and accept new baseline
Result: New baseline = 40 violations
↓
PR #3: Adds new Select component (fully accessible)
Result: Chromatic PASSES ✅ (40 violations, unchanged)
```

### Accessibility Test Configuration

Accessibility tests run automatically with the current setup. Optional configuration via `chromatic.config.json`:

```json
{
  "projectId": "Project:YOUR_PROJECT_ID",
  "accessibility": {
    "disableRules": ["color-contrast"],  // Temporarily disable specific rules
  }
}
```

**Note**: The `chromatic.config.json` file doesn't exist yet. It will be created automatically when you authenticate the Visual Tests addon (see below), or you can create it manually.

---

## Feature 2: Visual Tests Addon (Local Development)

### What It Does

Enables running Chromatic visual tests directly from Storybook during local development, without pushing to CI.

### Benefits

- **Instant feedback** - See visual changes immediately while developing
- **Faster iteration** - No need to commit/push to test visual changes
- **Baseline syncing** - Accept baselines locally that sync to cloud for team
- **TurboSnap integration** - Accepted stories skip review in CI

### When to Use It

**Use the Visual Tests addon if:**
- You're making frequent visual changes and want faster feedback
- Waiting for CI to run Chromatic becomes a bottleneck
- You want to catch visual bugs before pushing code

**Skip it if:**
- Current CI-based workflow is sufficient (no pain points)
- Team prefers centralized visual review in PRs
- You're happy with TurboSnap performance in CI

### Setup (One-time, ~5 minutes)

#### Step 1: Start Storybook

```bash
pnpm storybook
```

#### Step 2: Authenticate

1. Look for the "Visual Tests" panel in Storybook sidebar
2. Click "Sign in to Chromatic"
3. Authenticate with your Chromatic account
4. Select your project from the list
5. The addon will automatically:
   - Create `chromatic.config.json` with your project ID
   - Download existing baselines
   - Enable local visual testing

#### Step 3: Run Visual Tests Locally

1. Click the ▶️ Play button in the Storybook sidebar
2. Tests will upload to Chromatic cloud and return results
3. Review changes in the Visual Tests panel
4. Accept or reject changes locally

### Configuration

Once authenticated, `chromatic.config.json` will be created:

```json
{
  "projectId": "Project:YOUR_PROJECT_ID",
  "buildScriptName": "build-storybook"
}
```

Optional configuration:

```json
{
  "projectId": "Project:YOUR_PROJECT_ID",
  "buildScriptName": "build-storybook",
  "debug": true,  // Verbose logging
  "zip": true     // Recommended for large projects - faster uploads
}
```

### Usage Tips

**Local testing workflow:**
1. Make visual changes to component
2. Save file (Storybook hot-reloads)
3. Click ▶️ Play button in specific story
4. Review visual diff in panel
5. Accept if intentional, fix if bug
6. Accepted baselines sync to cloud immediately

**Benefits for team:**
- Baselines accepted locally are available for everyone
- TurboSnap skips stories with accepted baselines in CI
- Reduces PR review time (fewer visual changes to review)

---

## Feature Comparison

| Feature | Visual Tests (CI) | Visual Tests Addon | Accessibility Tests (CI) | @storybook/addon-a11y |
|---------|-------------------|-------------------|-------------------------|----------------------|
| **Where it runs** | CI only | Local Storybook | CI only | Local Storybook |
| **Triggers** | Every push/PR | Manual (▶️ button) | Every push/PR | Automatic (background) |
| **Feedback speed** | 2-5 minutes | Instant (~30 sec) | 2-5 minutes | Instant |
| **Baseline tracking** | Yes | Yes (syncs) | Yes | No |
| **Team visibility** | Dashboard | Dashboard | Dashboard | Local only |
| **Blocks PRs** | Optional | No | Optional | No |
| **Setup required** | ✅ Done | Authenticate once | ✅ Done | ✅ Done |

---

## Frequently Asked Questions

### Do I need to configure anything for accessibility tests to work?

No! Accessibility tests are already running automatically because:
1. You have `@storybook/addon-a11y` installed and configured
2. Chromatic automatically detects the addon and runs axe tests
3. Results are available in your Chromatic dashboard

You just need to:
1. Check the dashboard
2. Establish a baseline
3. Optionally configure PR failure behavior

### What's the difference between the a11y addon and Chromatic accessibility tests?

- **@storybook/addon-a11y**: Local development tool that shows ALL violations in real-time
- **Chromatic accessibility tests**: CI-based regression tracking that shows only NEW/CHANGED violations

They work together:
- Use a11y addon to fix issues during development
- Use Chromatic to prevent regressions in PRs

### Do I need the Visual Tests addon if I already have CI visual tests?

No, it's optional. The addon provides faster local feedback, but the CI-based workflow is already comprehensive. Use it only if:
- CI feedback is too slow for your workflow
- You want to catch visual bugs before pushing

### Will accessibility tests block my PRs?

By default, no. The workflow has `exitZeroOnChanges: true`, which means builds succeed even with changes.

To block PRs on new violations, change to `exitZeroOnChanges: false` in the workflow.

### How do I disable accessibility tests for a specific story?

Add to your story:

```tsx
export default {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    a11y: {
      disable: true,  // Disables a11y tests for all stories in this file
    },
  },
};

// Or for a specific story:
export const MyStory = {
  parameters: {
    a11y: {
      disable: true,
    },
  },
};
```

### Can I customize which accessibility rules are checked?

Yes, in your story parameters:

```tsx
parameters: {
  a11y: {
    config: {
      rules: [
        { id: 'color-contrast', enabled: false },  // Disable specific rule
      ],
    },
  },
}
```

Or globally in `.storybook/preview.ts`:

```tsx
export default {
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: false },
        ],
      },
    },
  },
};
```

---

## Next Steps

### Recommended: Enable Chromatic Accessibility Tests

1. Visit your Chromatic dashboard
2. Navigate to Accessibility tab
3. Review current violations
4. Accept baseline (establishes "no regressions" policy)
5. (Optional) Update workflow to fail on new violations
6. Update team about new PR checks

### Optional: Set Up Visual Tests Addon

1. Start Storybook: `pnpm storybook`
2. Authenticate with Chromatic
3. Try running tests locally
4. Evaluate after 1-2 weeks if it improves workflow

---

## Resources

- [Chromatic Accessibility Tests Documentation](https://www.chromatic.com/docs/accessibility-tests)
- [Visual Tests Addon Documentation](https://www.chromatic.com/docs/visual-tests-addon)
- [Storybook a11y Addon Documentation](https://storybook.js.org/addons/@storybook/addon-a11y)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Support

If you encounter issues:
1. Check the [Chromatic troubleshooting guide](https://www.chromatic.com/docs/troubleshooting)
2. Verify environment variables are set correctly
3. Ensure Storybook builds successfully locally
4. Contact Chromatic support through your dashboard
