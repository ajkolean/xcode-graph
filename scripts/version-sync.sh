#!/usr/bin/env bash
set -euo pipefail

# Sync package version with an XcodeGraph version.
#
# Usage:
#   ./scripts/version-sync.sh <xcodegraph-version>
#
# Examples:
#   ./scripts/version-sync.sh 1.35.0     # Sets package to 1.35.0, xcodegraph to 1.35.0
#   ./scripts/version-sync.sh 1.35.0 2   # Sets package to 1.35.2, xcodegraph to 1.35.0
#
# Versioning convention:
#   - major.minor matches XcodeGraph (signals compatibility)
#   - patch is ours (UI-only fixes within the same XcodeGraph version)

XCGRAPH_VERSION="${1:?Usage: version-sync.sh <xcodegraph-version> [patch]}"
PATCH="${2:-0}"

# Validate format
if [[ ! "${XCGRAPH_VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Invalid version format '${XCGRAPH_VERSION}'. Expected semver like '1.35.0'."
  exit 1
fi

MAJOR_MINOR=$(echo "${XCGRAPH_VERSION}" | cut -d. -f1-2)
PKG_VERSION="${MAJOR_MINOR}.${PATCH}"

echo "XcodeGraph version: ${XCGRAPH_VERSION}"
echo "Package version:    ${PKG_VERSION}"

# Update package.json
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  pkg.version = '${PKG_VERSION}';
  pkg.xcodegraph = '${XCGRAPH_VERSION}';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Update GraphValidator Package.swift
PACKAGE_SWIFT="packages/GraphValidator/Package.swift"
if [[ -f "${PACKAGE_SWIFT}" ]]; then
  sed -i '' "s/exact: \"[0-9]*\.[0-9]*\.[0-9]*\"/exact: \"${XCGRAPH_VERSION}\"/" "${PACKAGE_SWIFT}"
  echo "Updated ${PACKAGE_SWIFT}"
fi

echo ""
echo "Done. Next steps:"
echo "  1. Run: pnpm install (to update lockfile)"
echo "  2. Regenerate types if XcodeGraph major.minor changed"
echo "  3. Run: pnpm test:run && pnpm check"
echo "  4. Commit and tag: git tag v${PKG_VERSION}"
