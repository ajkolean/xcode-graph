<p align="center">
  <img src="docs/public/xcode-graph-icon-readme.png" alt="XcodeGraph" width="180" />
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
</p>

<p align="center">
  <a href="https://ajkolean.github.io/xcode-graph/">Docs</a> &nbsp;&bull;&nbsp;
  <a href="https://ajkolean.github.io/xcode-graph/demo">Live Demo</a> &nbsp;&bull;&nbsp;
  <a href="https://ajkolean.github.io/xcode-graph/api/">API Reference</a>
</p>

---

## Features

- **Interactive Canvas** — Zoom, pan, and click through dependency graphs with hardware-accelerated rendering
- **Cluster Layouts** — Nodes grouped by project into visual clusters using a two-phase hierarchical layout (ELK + D3-force)
- **Search & Filter** — Filter by type, origin, platform, or project; instant search with highlighting
- **Transitive Dependencies** — Highlight the full dependency chain for any node
- **Circular Dependency Detection** — Identifies and warns about cycles in the graph
- **File Upload** — Drag-and-drop or file picker for loading XcodeGraph JSON
- **Theming** — 20+ CSS custom properties for complete visual customization
- **Dark & Light Mode** — Automatic adaptation to system preference
- **TypeScript** — Full type definitions included
- **Zero Config** — Single `<xcode-graph>` element, works in any framework or vanilla HTML

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

`loadRawGraph` validates and transforms the raw JSON into the internal `GraphNode` / `GraphEdge` format automatically.

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

## Data Shape

<details>
<summary><strong>GraphNode</strong></summary>

| Field               | Type                        | Description                                              |
|---------------------|-----------------------------|----------------------------------------------------------|
| `id`                | `string`                    | Unique identifier                                        |
| `name`              | `string`                    | Display name                                             |
| `type`              | `NodeType`                  | `app`, `framework`, `library`, `package`, `test-unit`, `test-ui`, `cli` |
| `platform`          | `Platform`                  | `iOS`, `macOS`, `visionOS`, `tvOS`, `watchOS`            |
| `origin`            | `Origin`                    | `local` or `external`                                    |
| `project`           | `string?`                   | Owning project name                                      |
| `deploymentTargets` | `Record<Platform, string>?` | Multi-platform deployment targets                        |

</details>

<details>
<summary><strong>GraphEdge</strong></summary>

| Field                | Type              | Description                                |
|----------------------|-------------------|--------------------------------------------|
| `source`             | `string`          | ID of the source node (depends on target)  |
| `target`             | `string`          | ID of the target node (dependency)         |
| `kind`               | `DependencyKind?` | `target`, `project`, `sdk`, `xcframework`  |
| `platformConditions` | `Platform[]?`     | Platform conditions for this edge          |

</details>

These are the core fields. See the full type definitions in the [API Reference](https://ajkolean.github.io/xcode-graph/api/).

## Theming

Customize the look with CSS custom properties:

```css
xcode-graph {
  --graph-bg: #1a1a2e;
  --graph-accent: #7c3aed;
  --graph-text: #e2e8f0;
  --graph-node-app: #f59e0b;
  --graph-node-framework: #0ea5e9;
  --graph-node-package: #10b981;
  --graph-radius: 8px;
}
```

See the [Component API reference](https://ajkolean.github.io/xcode-graph/reference/component-api) for all available properties.

## Swift Integration

xcode-graph is designed to work with Swift servers. A reference SwiftNIO implementation serves the component from CDN with zero bundled assets:

```
GET /          → HTML page loading <xcode-graph> from jsdelivr
GET /graph.json → Raw XcodeGraph JSON data
```

See the [Swift Integration guide](https://ajkolean.github.io/xcode-graph/guide/swift-integration) for details.

## Documentation

Full docs at **[ajkolean.github.io/xcode-graph](https://ajkolean.github.io/xcode-graph/)**

- [Getting Started](https://ajkolean.github.io/xcode-graph/guide/) — Installation, usage, and data shape
- [Swift Integration](https://ajkolean.github.io/xcode-graph/guide/swift-integration) — Embedding in a Swift server
- [Component API](https://ajkolean.github.io/xcode-graph/reference/component-api) — Properties, methods, events, CSS custom properties
- [Layout Configuration](https://ajkolean.github.io/xcode-graph/reference/layout-configuration) — ELK & D3-force parameters
- [API Reference](https://ajkolean.github.io/xcode-graph/api/) — Full TypeDoc reference

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm test:run         # Run tests
pnpm check            # Lint + format (Biome)
pnpm docs:dev         # Start docs dev server
pnpm docs:api         # Generate TypeDoc API reference
pnpm analyze          # Regenerate Custom Elements Manifest
```

## License

[MIT](LICENSE) &copy; Andy Kolean
