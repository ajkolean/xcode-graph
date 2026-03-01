---
title: Versioning
---

# Versioning & Compatibility

When the Tuist CLI bumps its XcodeGraph dependency, it should notify this repo
to run the compatibility suite. This is done via GitHub's `repository_dispatch` API.

## Versioning convention

This package tracks XcodeGraph's version:

- **major.minor** matches XcodeGraph (signals compatibility)
- **patch** is ours (UI-only fixes within the same XcodeGraph version)

For example, `xcode-graph@1.35.2` means "compatible with XcodeGraph 1.35.x, second UI patch".

The `xcodegraph` field in `package.json` records the exact XcodeGraph version
that was tested against. The publish workflow enforces major.minor alignment.

### Syncing versions

```bash
# Bump to XcodeGraph 1.35.0 (sets package to 1.35.0)
pnpm version:sync 1.35.0

# UI-only patch on XcodeGraph 1.35.x (sets package to 1.35.2)
pnpm version:sync 1.35.0 2
```

This updates `package.json` (version + xcodegraph field) and `Package.swift`.

## Option 1: Add a step to Tuist's CI

In the Tuist repo, add a step to the PR/merge workflow that bumps XcodeGraph:

```yaml
# In the Tuist repo's CI workflow
- name: Notify tuistgraph of XcodeGraph update
  if: contains(github.event.head_commit.message, 'XcodeGraph') || contains(steps.changed-files.outputs.all, 'Package.resolved')
  env:
    GH_TOKEN: ${{ secrets.TUISTGRAPH_DISPATCH_TOKEN }}
    XCGRAPH_VERSION: "1.35.0"  # or extract from Package.resolved
  run: |
    gh api repos/tuist/tuistgraph/dispatches \
      --method POST \
      --field event_type=xcodegraph-updated \
      --field 'client_payload[version]'="${XCGRAPH_VERSION}"
```

> **Note:** This requires a GitHub token (`TUISTGRAPH_DISPATCH_TOKEN`) with
> `repo` scope on the tuistgraph repository, stored as a secret in the Tuist repo.

## Option 2: Manual trigger

Run the check manually from the GitHub Actions UI:

1. Go to **Actions** → **XcodeGraph Compatibility Check**
2. Click **Run workflow**
3. Enter the XcodeGraph version (e.g., `1.35.0`)
4. Click **Run workflow**

## Option 3: Automatic weekly check

The workflow runs every Monday at 09:00 UTC against the latest XcodeGraph release.
No action needed — if it fails, an issue is automatically created.

## What the check does

1. Updates the `GraphValidator` Swift package to the target XcodeGraph version
2. Regenerates `xcode-graph.schema.generated.ts` from the new XcodeGraph sources
3. Runs all tests (including forward-compatibility tests)
4. Runs biome lint
5. Runs the production build

If any step fails, it creates a GitHub issue with the `compatibility` label.

## Release workflow

1. Compat check passes for new XcodeGraph version (or you've made UI changes)
2. Run `pnpm version:sync <xcodegraph-version> [patch]`
3. Commit, push, tag: `git tag v1.35.0 && git push --tags`
4. The `publish.yml` workflow validates version alignment and publishes to npm
