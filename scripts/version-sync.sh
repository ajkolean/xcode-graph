#!/usr/bin/env bash
set -euo pipefail

# Sync package version with XcodeGraph version (1:1 lockstep).
#
# Usage:
#   ./scripts/version-sync.sh <xcodegraph-version>
#
# Example:
#   ./scripts/version-sync.sh 1.35.0

VERSION="${1:?Usage: version-sync.sh <xcodegraph-version>}"

# Validate format
if [[ ! "${VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Invalid version format '${VERSION}'. Expected semver like '1.35.0'."
  exit 1
fi

echo "Setting version: ${VERSION}"

# Update package.json
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  pkg.version = '${VERSION}';
  pkg.xcodegraph = '${VERSION}';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Update swift Package.swift
PACKAGE_SWIFT="swift/Package.swift"
if [[ -f "${PACKAGE_SWIFT}" ]]; then
  sed -i.bak "s/exact: \"[0-9]*\.[0-9]*\.[0-9]*\"/exact: \"${VERSION}\"/" "${PACKAGE_SWIFT}" && rm -f "${PACKAGE_SWIFT}.bak"
  echo "Updated ${PACKAGE_SWIFT}"
fi

echo ""
echo "Done. Next steps:"
echo "  1. Run: pnpm install (to update lockfile)"
echo "  2. Regenerate types if major.minor changed"
echo "  3. Run: pnpm test:run && pnpm check"
echo "  4. Commit and tag: git tag v${VERSION}"
