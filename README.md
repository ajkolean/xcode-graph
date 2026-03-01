<p align="center">
  <img src="docs/public/xcode-graph-icon.png" alt="XcodeGraph" width="200" />
</p>

<h1 align="center">xcode-graph</h1>

<p align="center">
A Lit web component for visualizing Xcode project dependency graphs. Renders an interactive, zoomable canvas with filtering, search, transitive dependency highlighting, and cluster-based layouts — designed to be embedded in any web application.
</p>

## Installation

```bash
pnpm add xcode-graph
```

## Usage

### Embedded with data

Import the component and pass `GraphNode[]` / `GraphEdge[]` arrays as properties:

```html
<script type="module">
  import 'xcode-graph';
</script>

<xcode-graph
  .nodes=${nodes}
  .edges=${edges}
></xcode-graph>
```

### Raw XcodeGraph JSON

If you have the raw JSON output from XcodeGraph, use the convenience method:

```js
const app = document.querySelector('xcode-graph');
app.loadRawGraph(xcodeGraphJson);
```

`loadRawGraph` validates and transforms the XcodeGraph JSON into the internal `GraphNode` / `GraphEdge` format automatically.

## Data Shape

### `GraphNode`

| Field               | Type                      | Description                              |
|---------------------|---------------------------|------------------------------------------|
| `id`                | `string`                  | Unique identifier                        |
| `name`              | `string`                  | Display name                             |
| `type`              | `NodeType`                | Category (`app`, `framework`, `library`, `package`, …) |
| `platform`          | `Platform`                | Target platform (`iOS`, `macOS`, …)      |
| `origin`            | `Origin`                  | `local` or `external`                    |
| `project`           | `string?`                 | Owning project name                      |
| `deploymentTargets` | `Record<Platform, string>?` | Multi-platform deployment targets      |

### `GraphEdge`

| Field                | Type              | Description                                |
|----------------------|-------------------|--------------------------------------------|
| `source`             | `string`          | ID of the source node (depends on target)  |
| `target`             | `string`          | ID of the target node (dependency)         |
| `kind`               | `DependencyKind?` | Dependency type (`target`, `project`, `sdk`, `xcframework`) |
| `platformConditions` | `Platform[]?`     | Platform conditions for this edge          |

These are the core fields. See the full type definitions in the [API Reference](https://ajkolean.github.io/xcode-graph/api/) for all available properties.

## Documentation

Full documentation is available at **[ajkolean.github.io/xcode-graph](https://ajkolean.github.io/xcode-graph/)**.

- [Getting Started](https://ajkolean.github.io/xcode-graph/guide/) — installation, usage, data shape
- [Swift Integration](https://ajkolean.github.io/xcode-graph/guide/swift-integration) — embedding the component in a Swift server
- [Maintaining](https://ajkolean.github.io/xcode-graph/maintaining/) — versioning, compatibility checks, and publishing
- [Reference](https://ajkolean.github.io/xcode-graph/reference/) — layout algorithm, API reference

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm test:run         # Run tests
pnpm check            # Lint + format (Biome)
pnpm docs:dev         # Start docs dev server
pnpm docs:api         # Generate TypeDoc → .typedoc-out/
pnpm analyze          # Regenerate Custom Elements Manifest
```

## License

See [LICENSE](LICENSE) for details.
