<p align="center">
  <img src="https://ajkolean.github.io/xcode-graph/xcode-graph-icon-readme.png" alt="XcodeGraph" width="180" />
</p>

<h1 align="center">xcode-graph</h1>

<p align="center">
  <strong>Interactive dependency graph visualization for Xcode projects</strong>
</p>

<p align="center">
  A self-contained Lit web component that renders zoomable, filterable dependency graphs on canvas — designed for embedding in any web app or Swift server.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/xcode-graph"><img src="https://img.shields.io/npm/v/xcode-graph?color=7c3aed&label=npm" alt="npm version" /></a>
  <a href="https://github.com/ajkolean/xcode-graph/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/types-TypeScript-3178C6" alt="TypeScript" /></a>
  <a href="https://lit.dev"><img src="https://img.shields.io/badge/built%20with-Lit-324FFF" alt="Built with Lit" /></a>
  <a href="https://app.deepsource.com/gh/ajkolean/xcode-graph/"><img src="https://app.deepsource.com/gh/ajkolean/xcode-graph.svg/?label=code+coverage&show_trend=true&token=bpb3vqsaKxh829cTU452ydmW" alt="DeepSource Code Coverage" /></a>
  <a href="https://app.deepsource.com/gh/ajkolean/xcode-graph/"><img src="https://app.deepsource.com/gh/ajkolean/xcode-graph.svg/?label=active+issues&show_trend=true&token=bpb3vqsaKxh829cTU452ydmW" alt="DeepSource Active Issues" /></a>
</p>

<p align="center">
  <a href="https://ajkolean.github.io/xcode-graph/">Docs</a> &nbsp;&bull;&nbsp;
  <a href="https://ajkolean.github.io/xcode-graph/demo">Live Demo</a> &nbsp;&bull;&nbsp;
  <a href="https://ajkolean.github.io/xcode-graph/api/">API Reference</a>
</p>

---

## Features

- **Interactive Canvas** — Zoom, pan, and click through dependency graphs with hardware-accelerated SVG rendering
- **Cluster Layouts** — Nodes grouped by project into visual clusters using a two-phase hierarchical layout (ELK + D3-force)
- **Search & Filter** — Filter by node type, origin, platform, or project; instant search with highlighting
- **Transitive Dependencies** — Highlight the full dependency chain (direct, transitive, dependents, or both) for any node
- **Circular Dependency Detection** — Automatically identifies and warns about cycles in the graph
- **File Upload** — Drag-and-drop or file picker for loading XcodeGraph JSON
- **Theming** — 30+ CSS custom properties for complete visual customization
- **Dark & Light Mode** — Automatic adaptation to `prefers-color-scheme`, or force a specific mode
- **Accessible** — ARIA labels, keyboard navigation, focus traps, and `prefers-reduced-motion` support
- **TypeScript** — Full type definitions with strict mode
- **Zero Config** — Single `<xcode-graph>` element, works in any framework or vanilla HTML
- **CDN Ready** — Self-contained ES module bundle with code-split Zod validation

## Installation

```bash
# pnpm
pnpm add xcode-graph

# npm
npm install xcode-graph

# yarn
yarn add xcode-graph
```

Or load directly from a CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/xcode-graph/dist/xcodegraph.js"></script>
```

## Quick Start

### With data properties

```html
<script type="module">
  import 'xcode-graph';
</script>

<xcode-graph
  .nodes=${nodes}
  .edges=${edges}
></xcode-graph>
```

### With raw XcodeGraph JSON

```js
const app = document.querySelector('xcode-graph');
app.loadRawGraph(xcodeGraphJson);
```

`loadRawGraph` validates and transforms the raw JSON into the internal `GraphNode` / `GraphEdge` format automatically. The Zod validation layer is lazy-loaded on first call to keep the main bundle small. Unknown enum values produce warnings rather than errors, so the component is forward-compatible with newer Xcode project types.

### From a CDN (no bundler)

```html
<!DOCTYPE html>
<html>
<body>
  <xcode-graph id="graph" style="width: 100%; height: 100vh;"></xcode-graph>
  <script type="module">
    import 'https://cdn.jsdelivr.net/npm/xcode-graph/dist/xcodegraph.js';

    const res = await fetch('/graph.json');
    const data = await res.json();
    document.getElementById('graph').loadRawGraph(data);
  </script>
</body>
</html>
```

### With file upload

```html
<xcode-graph show-upload></xcode-graph>
```

Users can drag-and-drop or use the file picker to load their own XcodeGraph JSON files.

## Component API

### Properties

| Property | Attribute | Type | Default | Description |
|---|---|---|---|---|
| `nodes` | — | `GraphNode[]` | `undefined` | Graph nodes to visualize |
| `edges` | — | `GraphEdge[]` | `undefined` | Graph edges connecting nodes |
| `layoutOptions` | — | `LayoutOptions` | `undefined` | ELK + D3-force layout configuration overrides |
| `showUpload` | `show-upload` | `boolean` | `false` | Show the file upload overlay |
| `colorScheme` | `color-scheme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color scheme preference |

### Methods

| Method | Parameters | Description |
|---|---|---|
| `loadRawGraph()` | `raw: unknown` | Load and transform raw XcodeGraph JSON (`tuist graph --format json` output) |

See the [Component API reference](https://ajkolean.github.io/xcode-graph/reference/component-api) for events, CSS custom properties, and sizing details.

## Data Shape

<details>
<summary><strong>GraphNode</strong></summary>

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier |
| `name` | `string` | Yes | Display name |
| `type` | `NodeType` | Yes | `app`, `framework`, `library`, `package`, `test-unit`, `test-ui`, `cli` |
| `platform` | `Platform` | Yes | `iOS`, `macOS`, `visionOS`, `tvOS`, `watchOS` |
| `origin` | `Origin` | Yes | `local` or `external` |
| `project` | `string?` | No | Parent project or package name |
| `deploymentTargets` | `DeploymentTargets?` | No | Min version per platform |
| `buildSettings` | `BuildSettings?` | No | Swift version, compilation conditions, code signing |
| `bundleId` | `string?` | No | Bundle identifier |
| `sourceCount` | `number?` | No | Total source file count |
| `resourceCount` | `number?` | No | Total resource file count |
| `destinations` | `Destination[]?` | No | Supported device destinations |
| `tags` | `string[]?` | No | Metadata tags |
| `foreignBuild` | `ForeignBuildInfo?` | No | External build system info (Bazel, CMake, KMP/Gradle) |

</details>

<details>
<summary><strong>GraphEdge</strong></summary>

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | `string` | Yes | ID of the source node (depends on target) |
| `target` | `string` | Yes | ID of the target node (dependency) |
| `kind` | `DependencyKind?` | No | `target`, `project`, `sdk`, `xcframework` |
| `platformConditions` | `Platform[]?` | No | Platform conditions for this edge |

</details>

See the full type definitions in the [Data Types reference](https://ajkolean.github.io/xcode-graph/reference/data-types).

## Theming

The component is fully themeable via CSS custom properties. Set `--graph-*` properties on the `<xcode-graph>` element or any ancestor:

```css
xcode-graph {
  /* Core */
  --graph-bg: #1a1a2e;
  --graph-bg-secondary: #16213e;
  --graph-text: #e2e8f0;
  --graph-text-muted: rgba(226, 232, 240, 0.5);
  --graph-accent: #7c3aed;
  --graph-accent-dim: rgba(124, 58, 237, 0.15);
  --graph-border: rgba(255, 255, 255, 0.08);
  --graph-canvas-bg: #1a1a2e;
  --graph-radius: 8px;

  /* Node type colors */
  --graph-node-app: #f59e0b;
  --graph-node-framework: #0ea5e9;
  --graph-node-library: #22c55e;
  --graph-node-test: #ec4899;
  --graph-node-cli: #3b82f6;
  --graph-node-package: #eab308;

  /* Platform colors */
  --graph-platform-ios: #007AFF;
  --graph-platform-macos: #64D2FF;
  --graph-platform-tvos: #B87BFF;
  --graph-platform-watchos: #5AC8FA;
  --graph-platform-visionos: #7D7AFF;

  /* Typography */
  --graph-font: 'Inter', system-ui, sans-serif;
  --graph-font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

### Color scheme

The component adapts to `prefers-color-scheme` automatically. Both dark and light token sets are built in. To force a specific mode:

```html
<xcode-graph color-scheme="light"></xcode-graph>
<xcode-graph color-scheme="dark"></xcode-graph>
<xcode-graph color-scheme="auto"></xcode-graph>  <!-- default -->
```

See the [Component API reference](https://ajkolean.github.io/xcode-graph/reference/component-api) for all available properties with dark and light mode defaults.

## Layout Engine

The graph uses a two-phase layout pipeline:

1. **Macro layout (ELK)** — Positions clusters (groups of related nodes) using the ELK layered algorithm for hierarchical structure
2. **Micro layout (D3-force)** — Positions nodes within each cluster using physics-based force simulation with boundary constraints, radial orbits, and collision avoidance

Override layout parameters via the `layoutOptions` property:

```js
const app = document.querySelector('xcode-graph');
app.layoutOptions = {
  configOverrides: {
    elkDirection: 'RIGHT',     // LEFT | RIGHT | UP | DOWN
    elkNodeSpacing: 300,
    elkLayerSpacing: 400,
    iterations: 500,
  },
  hooks: {
    onLayoutComplete: (result) => {
      console.log('Layout done:', result.clusters.length, 'clusters');
    },
  },
};
```

See the [Layout Configuration reference](https://ajkolean.github.io/xcode-graph/reference/layout-configuration) for all available parameters.

## Architecture

```
src/
├── components/          Root <xcode-graph> web component
├── graph/
│   ├── components/      Canvas rendering (SVG, nodes, edges, tooltips)
│   ├── controllers/     Layout orchestration, interaction handling, animation loop
│   ├── layout/          ELK hierarchical + D3-force physics pipeline
│   ├── signals/         Graph state (selection, highlights, view mode)
│   └── utils/           Traversal, filtering, canvas theming
├── services/
│   ├── graph-data-service.ts       O(1) indexed data layer
│   ├── graph-analysis-service.ts   Circular dependency & path detection
│   ├── xcode-graph.service.ts      Raw Tuist JSON → internal format
│   ├── xcode-graph.validation.ts   Zod schema validation
│   ├── graph-loader.ts             Progressive loading
│   ├── graph-stats-service.ts      Graph statistics
│   └── error-service.ts            User-facing error handling
├── shared/
│   ├── schemas/         Type definitions (GraphNode, GraphEdge, enums)
│   ├── signals/         Global state (filters, UI, errors)
│   ├── controllers/     Zag-js, keyboard shortcuts, focus traps, resize
│   └── machines/        Zag-js state machines
├── ui/
│   ├── layout/          Tab orchestrator, header, sidebar
│   ├── components/      80+ UI components (filters, panels, search, badges)
│   └── utils/           Colors, icons, sizing, viewport
├── styles/
│   ├── tokens.css       Design tokens (dark + light mode)
│   └── theme-utils.ts   Color manipulation, contrast checking
└── index.ts             Library entry point (re-exports public API)
```

### Key Technologies

| Concern | Technology |
|---|---|
| Web components | [Lit](https://lit.dev) 3.x |
| State management | [Lit Signals](https://github.com/nicklama/xcode-graph) (`@lit-labs/signals`) |
| UI state machines | [Zag-js](https://zagjs.com) |
| Hierarchical layout | [ELK.js](https://github.com/kieler/elkjs) |
| Physics simulation | [D3-force](https://d3js.org/d3-force) |
| Schema validation | [Zod](https://zod.dev) 4.x |
| Color utilities | [colord](https://colord.omgovich.dev/) |
| Web workers | [Comlink](https://github.com/nicklama/xcode-graph) |
| Focus management | [focus-trap](https://github.com/focus-trap/focus-trap) |

### Services

| Service | Purpose |
|---|---|
| `GraphDataService` | Centralized O(1) data layer with indexed lookups by type, project, platform, and origin. Provides dependency queries (direct, transitive, BFS traversal) and cluster support. |
| `GraphAnalysisService` | Stateless algorithms for graph analysis: BFS path detection and DFS cycle finding. |
| `XcodeGraphService` | Transforms raw Tuist/XcodeGraph JSON into the internal `GraphData` format. Forward-compatible — unknown enum values produce warnings, not crashes. |
| `ErrorService` | Singleton error handling with toast notifications. Auto-dismiss timers, severity levels, and user-facing messages. |
| `GraphStatsService` | Computes graph statistics (node counts, edge counts, connectivity metrics). |
| `GraphLoaderService` | Progressive/lazy loading with progress tracking. |

### State Management

The component uses [Lit Signals](https://lit.dev/docs/data/signals/) for reactive state:

- **Graph signals** — `selectedNode`, `selectedCluster`, `hoveredNode`, `circularDependencies`, highlight toggles
- **Filter signals** — Active filters for node types, platforms, origins, projects, packages
- **UI signals** — Zoom level, search query, animation toggle, active tab
- **Display computed** — Derived filtered/highlighted data based on all active filters and selections
- **Error signals** — Active error/warning state

## Swift Integration

xcode-graph is designed to work with Swift servers. A reference SwiftNIO implementation serves the component from CDN with zero bundled assets:

```
GET /          → HTML page loading <xcode-graph> from jsdelivr
GET /graph.json → Raw XcodeGraph JSON data
```

```swift
import XcodeGraphServer

let server = try GraphServer(graph: graph)
try server.start()  // opens browser, blocks until ctrl-c
```

The Swift package includes:
- **XcodeGraphServer** — SwiftNIO HTTP server (binds to `localhost:8081`)
- **XcodeGraphCLI** — Command-line interface
- **TransformGraph** — Swift code analyzer for type extraction

See the [Swift Integration guide](https://ajkolean.github.io/xcode-graph/guide/swift-integration) for details.

## IDE Support

The package ships metadata files for editor integration:

| File | Editor | Purpose |
|---|---|---|
| `custom-elements.json` | All | Custom Elements Manifest (CEM) |
| `web-types.json` | WebStorm/JetBrains | Component and property completions |
| `vscode.html-custom-data.json` | VS Code | HTML tag and attribute IntelliSense |
| `vscode.css-custom-data.json` | VS Code | CSS custom property completions |

## Development

```bash
pnpm install              # Install dependencies
pnpm dev                  # Start dev server (port 3000)
pnpm test:run             # Run unit tests
pnpm test:coverage        # Run tests with coverage
pnpm check                # Lint + format (Biome) + token validation
pnpm build:lib            # Build production library bundle
pnpm docs:dev             # Start docs dev server (port 5174)
pnpm docs:api             # Generate TypeDoc API reference
pnpm analyze              # Regenerate Custom Elements Manifest
pnpm size                 # Check bundle size limits
pnpm size:why             # Analyze bundle composition
pnpm depcheck             # Check for unused dependencies
```

### CI/CD

The project runs six GitHub Actions workflows:

| Workflow | Trigger | Purpose |
|---|---|---|
| `build.yml` | Push / PR | Lint, test with coverage, type-check, verify CEM manifest, verify API surface, build |
| `publish.yml` | Git tag `v*` | Version alignment check, test, build, publish to npm |
| `docs.yml` | Push to main | Build and deploy VitePress + TypeDoc docs to GitHub Pages |
| `audit.yml` | Schedule | Security audit of dependencies |
| `size-limit.yml` | Push / PR | Bundle size monitoring (main: 210 kB gzip, all chunks: 785 kB gzip) |
| `compat-check.yml` | Push / PR | Compatibility testing |

### Testing

Tests use Vitest with both jsdom (unit) and Playwright (browser) environments:

```bash
pnpm test:run             # Run all tests once
pnpm test                 # Watch mode
pnpm test:coverage        # With V8 coverage (text, HTML, LCOV)
```

Test coverage includes services, schemas, signals, controllers, utilities, layout algorithms, UI components, web workers, accessibility (vitest-axe), and integration tests.

## Documentation

Full docs at **[ajkolean.github.io/xcode-graph](https://ajkolean.github.io/xcode-graph/)**

- [Getting Started](https://ajkolean.github.io/xcode-graph/guide/) — Installation, usage, data shape, theming, and color scheme
- [Swift Integration](https://ajkolean.github.io/xcode-graph/guide/swift-integration) — Embedding in a Swift server with SwiftNIO
- [Component API](https://ajkolean.github.io/xcode-graph/reference/component-api) — Properties, methods, events, CSS custom properties
- [Data Types](https://ajkolean.github.io/xcode-graph/reference/data-types) — GraphNode, GraphEdge, enums, and all type definitions
- [Layout Configuration](https://ajkolean.github.io/xcode-graph/reference/layout-configuration) — ELK & D3-force parameters and lifecycle hooks
- [API Reference](https://ajkolean.github.io/xcode-graph/api/) — Full TypeDoc reference (100+ exported functions, classes, and types)

## License

[MIT](LICENSE) &copy; Andy Kolean
