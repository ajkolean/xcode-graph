# @tuist/graph

A Lit web component for visualizing [Tuist](https://tuist.dev) dependency graphs. Renders an interactive, zoomable canvas with filtering, search, transitive dependency highlighting, and cluster-based layouts — designed to be embedded in any web application.

## Installation

```bash
pnpm add @tuist/graph
```

## Usage

### Embedded with data

Import the component and pass `GraphNode[]` / `GraphEdge[]` arrays as properties:

```html
<script type="module">
  import '@tuist/graph';
</script>

<graph-app
  .nodes=${nodes}
  .edges=${edges}
></graph-app>
```

### Raw Tuist JSON

If you have the raw JSON output from `tuist graph`, use the convenience method:

```js
const app = document.querySelector('graph-app');
app.loadRawGraph(tuistGraphJson);
```

`loadRawGraph` validates and transforms the Tuist JSON into the internal `GraphNode` / `GraphEdge` format automatically.

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

See the full type definitions in the [API Reference](docs/api/).

## API Reference

Generated TypeDoc documentation is available at [`docs/api/`](docs/api/).

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm test:run         # Run tests
pnpm check            # Lint + format (Biome)
pnpm docs             # Generate TypeDoc → docs/api/
pnpm analyze          # Regenerate Custom Elements Manifest
```

## Maintaining

- [XcodeGraph version syncing & release workflow](.github/TUIST_CLI_INTEGRATION.md) — how versioning tracks XcodeGraph, compatibility checks, and publishing
- [Tuist CLI integration](swift/INTEGRATION.md) — how GraphServer serves the component, CDN delivery, and the Swift ↔ TypeScript boundary
- [Migration guide](docs/MIGRATION-GUIDE.md) — patterns used when porting from React to Lit

## License

See [LICENSE](LICENSE) for details.
