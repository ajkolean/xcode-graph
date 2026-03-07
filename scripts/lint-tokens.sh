#!/bin/bash

# lint-tokens.sh - Detects raw CSS values that should use design tokens
#
# This script checks for hardcoded colors, pixel values, font families, etc.
# in component files that should be using design tokens instead.
#
# Usage: ./scripts/lint-tokens.sh [--fix-hint]

set -e

# Resolve project root portably
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directories to check (components only, not token files)
COMPONENT_DIRS="src/components"

# Files to exclude (token definition files)
EXCLUDE_PATTERNS="tokens\.(ts|css)|globals\.css|index\.css"

# Track violations
VIOLATIONS=0
WARNINGS=0

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Design Token Lint Check${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to check for pattern and report
check_pattern() {
  local pattern="$1"
  local description="$2"
  local suggestion="$3"
  local severity="${4:-error}"

  # Use ripgrep if available, otherwise fall back to grep
  local grep_cmd="rg"
  if ! command -v rg &> /dev/null; then
    grep_cmd="grep -r -n -E"
  fi

  local results
  results=$(cd "$PROJECT_ROOT" && $grep_cmd --glob "*.ts" --glob "!**/tokens.ts" --glob "!**/node_modules/**" "$pattern" $COMPONENT_DIRS 2>/dev/null || true)

  if [[ -n "$results" ]]; then
    if [[ "$severity" = "error" ]]; then
      echo -e "${RED}✗ $description${NC}"
      ((VIOLATIONS++)) || true
    else
      echo -e "${YELLOW}⚠ $description${NC}"
      ((WARNINGS++)) || true
    fi
    echo -e "  ${CYAN}Suggestion:${NC} $suggestion"
    echo "$results" | head -10 | while read -r line; do
      echo -e "  ${NC}$line"
    done
    local count
    count=$(echo "$results" | wc -l | tr -d ' ')
    if [[ "$count" -gt 10 ]]; then
      echo -e "  ${NC}... and $((count - 10)) more"
    fi
    echo ""
  fi
  return 0
}

# Check for hex colors (excluding CSS custom property definitions)
# Match #xxx, #xxxx, #xxxxxx, #xxxxxxxx patterns not inside var()
check_pattern \
  "#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])" \
  "Hardcoded hex colors found" \
  "Use var(--colors-*) tokens instead" \
  "error"

# Check for rgba/rgb colors with hardcoded values (not using var())
# Matches rgba(N, N, N, N) or rgb(N, N, N) but not rgba(var(...), var(...))
check_pattern \
  "rgba?\s*\(\s*[0-9]" \
  "Hardcoded rgba/rgb colors found" \
  "Use var(--colors-*) tokens or color-mix(in srgb, var(--colors-*) N%, transparent)" \
  "error"

# Check for pixel values in common properties
# This is more targeted - looking for property: Npx patterns
check_pattern \
  "(padding|margin|gap|width|height|top|left|right|bottom|border-radius|font-size):\s*[0-9]+px" \
  "Hardcoded pixel values found" \
  "Use var(--spacing-*), var(--sizes-*), var(--radii-*), or var(--font-sizes-*) tokens" \
  "error"

# Check for hardcoded border widths
# Matches border: Npx, border-*: Npx patterns (but not border-radius which is covered above)
check_pattern \
  "border(-top|-right|-bottom|-left)?:\s*[0-9]+px" \
  "Hardcoded border widths found" \
  "Use var(--border-widths-thin), var(--border-widths-medium), or var(--border-widths-thick)" \
  "error"

# Check for hardcoded font families
check_pattern \
  "font-family:\s*['\"][^'\"]+['\"]" \
  "Hardcoded font-family values found" \
  "Use var(--fonts-body), var(--fonts-heading), or var(--fonts-mono)" \
  "error"

# Check for hardcoded opacity values (but not if already using var())
check_pattern \
  "opacity:\s*0\.[0-9]+[^)]*$" \
  "Hardcoded opacity values found" \
  "Use var(--opacity-*) tokens (0, 2, 4, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100)" \
  "warning"

# Check for hardcoded transition/duration values (not using var(--durations-*))
check_pattern \
  "(transition|animation)[^;]*[0-9]+m?s[^a-z(]" \
  "Hardcoded duration values found" \
  "Use var(--durations-fast), var(--durations-normal), var(--durations-slow), or var(--durations-slower)" \
  "warning"

# Summary
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [[ $VIOLATIONS -eq 0 ]] && [[ $WARNINGS -eq 0 ]]; then
  echo -e "${GREEN}✓ No token violations found!${NC}"
  exit 0
elif [[ $VIOLATIONS -eq 0 ]]; then
  echo -e "${YELLOW}⚠ Found $WARNINGS warning(s) - consider fixing${NC}"
  exit 0
else
  echo -e "${RED}✗ Found $VIOLATIONS error(s) and $WARNINGS warning(s)${NC}" >&2
  echo ""
  echo -e "${CYAN}Token Reference:${NC}"
  echo "  Colors:    var(--colors-primary), var(--colors-accent), var(--colors-muted), etc."
  echo "  Spacing:   var(--spacing-xs), var(--spacing-sm), var(--spacing-md), var(--spacing-lg), var(--spacing-xl)"
  echo "  Sizes:     var(--sizes-icon-sm), var(--sizes-sidebar-collapsed), etc."
  echo "  Fonts:     var(--fonts-body), var(--fonts-heading), var(--fonts-mono)"
  echo "  Font Size: var(--font-sizes-xs), var(--font-sizes-sm), var(--font-sizes-base), etc."
  echo "  Radii:     var(--radii-sm), var(--radii-md), var(--radii-lg), var(--radii-full)"
  echo "  Opacity:   var(--opacity-30), var(--opacity-50), var(--opacity-80), etc."
  echo "  Duration:  var(--durations-fast), var(--durations-normal), var(--durations-slow)"
  echo ""
  echo "See src/styles/tokens.css for full reference"
  exit 1
fi
