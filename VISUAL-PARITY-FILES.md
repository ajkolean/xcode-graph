# 📁 Visual Parity Test Files & Git Configuration

## Generated Files Overview

When you run `pnpm test:visual-parity`, several types of files are generated:

### 1. Diff Images (When Tests Fail)

**Location:** `.visual-parity-diffs/`

**Files generated per failed test:**
```
.visual-parity-diffs/
├── button-default-react.png    # React component screenshot
├── button-default-lit.png      # Lit component screenshot
├── button-default-diff.png     # Pink-highlighted differences
├── badge-allvariants-react.png
├── badge-allvariants-lit.png
└── badge-allvariants-diff.png
```

**Purpose:**
- Visual evidence of parity failures
- Pink pixels show exact differences
- Side-by-side comparison artifacts

**Git Status:** ✅ **Gitignored** (local only)

### 2. Playwright Test Results

**Location:** `.playwright-results/`

**Files generated:**
```
.playwright-results/
└── visual-parity-<hash>-<test-name>-chromium/
    ├── test-failed-1.png       # Screenshot at failure
    ├── trace.zip               # Playwright trace (on retry)
    └── video.webm              # Test video (if enabled)
```

**Purpose:**
- Playwright's test execution artifacts
- Screenshots of page state when test fails
- Traces for debugging

**Git Status:** ✅ **Gitignored** (local only)

### 3. Legacy Test Results

**Location:** `test-results/`

**Files generated:**
```
test-results/
├── .last-run.json              # Last test run metadata
└── visual-parity-<hash>-<test-name>-chromium/
    └── test-failed-1.png
```

**Purpose:**
- Legacy Playwright output directory
- Playwright stores screenshots here by default

**Git Status:** ✅ **Gitignored** (local only)

### 4. HTML Test Report

**Location:** `playwright-report/`

**Files generated:**
```
playwright-report/
├── index.html                  # Interactive test report
├── data/
│   └── *.json                  # Test result data
└── trace/
    └── *.zip                   # Execution traces
```

**Purpose:**
- Beautiful HTML report of test results
- View screenshots, traces, and failures

**View:** `open playwright-report/index.html`

**Git Status:** ✅ **Gitignored** (local only)

## Gitignore Configuration

**Added to `.gitignore`:**

```gitignore
# Visual Parity Testing
.visual-parity-diffs/      # Diff images (React vs Lit)
.playwright-results/       # Playwright test artifacts
test-results/              # Legacy Playwright output
playwright-report/         # HTML test reports
```

**Why gitignored:**
- ✅ Test artifacts are local-only
- ✅ Diff images change with every test run
- ✅ Screenshots can be large (MBs)
- ✅ No value in version control
- ✅ CI generates fresh artifacts each run

## Directory Structure Summary

```
tuistgraph/
├── .visual-parity-diffs/       # ← Diff images (GITIGNORED)
│   ├── README.md               # ← Documentation
│   ├── *-react.png             # ← React screenshots
│   ├── *-lit.png               # ← Lit screenshots
│   └── *-diff.png              # ← Diff images with highlights
│
├── .playwright-results/        # ← Playwright artifacts (GITIGNORED)
│   └── */
│       ├── test-failed-*.png
│       └── trace.zip
│
├── test-results/               # ← Legacy Playwright (GITIGNORED)
│   └── */
│
├── playwright-report/          # ← HTML reports (GITIGNORED)
│   └── index.html
│
├── src/test/
│   ├── visual-parity.test.ts        # ← Visual parity tests
│   └── visual-parity-helpers.ts     # ← Pixel comparison logic
│
└── .gitignore                  # ← Updated with all test directories
```

## Cleaning Up Generated Files

```bash
# Remove all visual parity artifacts
rm -rf .visual-parity-diffs .playwright-results test-results playwright-report

# Or add to package.json:
"clean:visual": "rm -rf .visual-parity-diffs .playwright-results test-results playwright-report"
```

## File Sizes

**Typical sizes per test:**
- React screenshot: ~50-200 KB
- Lit screenshot: ~50-200 KB
- Diff image: ~50-200 KB
- **Total per failed test:** ~150-600 KB

**For 18 tests all failing:**
- **Total:** ~2.7-10.8 MB

**Not a concern** - gitignored and regenerated on each run.

## CI Configuration (Optional)

If you want to save diff images in CI:

```yaml
# .github/workflows/visual-parity.yml
- name: Run Visual Parity Tests
  run: pnpm test:visual-parity

- name: Upload diff images if failed
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: visual-parity-diffs
    path: .visual-parity-diffs/
    retention-days: 7
```

**Benefits:**
- Download diff images from failed CI runs
- Review pixel differences without running locally
- 7-day retention (automatic cleanup)

## Viewing Results

### After Running Tests

```bash
# Run tests
pnpm test:visual-parity

# If failures occur:
# 1. Check console output for which tests failed

# 2. Open HTML report
open playwright-report/index.html

# 3. View diff images
open .visual-parity-diffs/
# Look for *-diff.png files
# Pink pixels = differences between React and Lit

# 4. Compare side-by-side
open .visual-parity-diffs/button-default-react.png
open .visual-parity-diffs/button-default-lit.png
```

### HTML Report Features

The Playwright HTML report shows:
- ✅ All test results (pass/fail)
- 📸 Screenshots at failure point
- 📊 Test duration and stats
- 🎬 Video recordings (if enabled)
- 🔍 Network logs and console output
- 📝 Test code with line numbers

## Best Practices

### 1. Run Before Removing React Components

```bash
# Before deleting React Button:
pnpm test:visual-parity --grep "Button"

# All Button tests must pass ✓
# Then safe to remove React implementation
```

### 2. Review Diff Images When Failing

```bash
# Don't just read pass/fail
# LOOK at the diff images:
open .visual-parity-diffs/*-diff.png

# Understand WHAT is different:
# - Is it a border?
# - Padding?
# - Color?
# - Font?
```

### 3. Clean Up After Fixing

```bash
# After fixing parity issues and tests pass:
pnpm clean:visual  # (if you add this script)

# Or:
rm -rf .visual-parity-diffs
```

### 4. Don't Commit Artifacts

✅ All test artifact directories are gitignored
✅ No action needed - just run tests freely
✅ CI will generate fresh artifacts

## Summary

**Configuration complete:**
- ✅ 4 directories gitignored
- ✅ Organized output structure
- ✅ Documentation in place
- ✅ Clean git status

**Generated files:**
- `.visual-parity-diffs/` - Diff images (your main concern)
- `.playwright-results/` - Playwright artifacts
- `test-results/` - Legacy output
- `playwright-report/` - HTML reports

**All gitignored** - safe to generate freely without cluttering git! 🎯
