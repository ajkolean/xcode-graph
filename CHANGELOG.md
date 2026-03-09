# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- VitePress documentation site with TypeDoc API reference
- Custom Elements Manifest (CEM) and IDE metadata files (VS Code, WebStorm)
- Lit Signals for reactive state management
- Zod 4 schema validation with lazy-loaded validation layer
- GitHub Actions CI/CD (build, publish, docs, audit, size-limit, compat-check)
- File upload with drag-and-drop support
- Demo video showcasing component features
- Community files (CONTRIBUTING.md, CODE_OF_CONDUCT.md, PR template)
- Light and dark mode with `prefers-color-scheme` support
- 30+ CSS custom properties for theming
- Keyboard navigation and accessibility (ARIA labels, focus traps)
- Documentation pages for examples, architecture, and troubleshooting

### Changed

- Migrated from Zod 3 to Zod 4
- Upgraded to Lit 3.x with Lit Signals
- Layout engine improvements (ELK.js + D3-force two-phase pipeline)
- Bundle optimized with code-split Zod validation

### Fixed

- OffscreenCanvas stub for jsdom test environments
- Various dependency updates and security patches

## [0.2.0] - 2025-05-01

### Added

- Animated viewport transitions and double-click zoom functionality
- Cluster edge rendering and screen-space cluster label rendering
- GitHub issue templates and CODEOWNERS file
- Components module with improved error handling in development mode

### Changed

- Replaced Konva.js scene graph with raw Canvas2D rendering implementation
- Consolidated GraphLayoutController into a single LayoutController
- Extracted magic numbers into named constants for readability
- Standardized import paths and added barrel files for utility and controller directories
- Updated canvas theme colors and improved visibility of scene elements
- Updated dependencies to latest versions and added new dependencies (colord, graphology, focus-trap, fuse.js)

### Fixed

- Gated layout reporter console logging behind DEV check
- Relaxed upper bound for aspect ratio and adjusted filter section styles

### Removed

- Konva.js dependency (replaced by Canvas2D)
- stats.js dependency and related performance overlay code
- Arrowhead drawing logic and glow effect from badges

### Performance

- Implemented dirty tracking for edge metadata to skip redundant per-frame recomputation
- Added bezier path caching to avoid redundant string generation
- Introduced label LOD culling and arc label bitmap caching (capped at 200 entries)
- Implemented quadtree-based spatial indexing for O(log n) hit testing on mousemove
