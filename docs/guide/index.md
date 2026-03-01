---
title: Getting Started
---

# Getting Started

TuistGraph is a Lit web component for visualizing [Tuist](https://tuist.dev) dependency graphs.

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

| Field               | Type                        | Description                                              |
|---------------------|-----------------------------|----------------------------------------------------------|
| `id`                | `string`                    | Unique identifier                                        |
| `name`              | `string`                    | Display name                                             |
| `type`              | `NodeType`                  | Category (`app`, `framework`, `library`, `package`, ...) |
| `platform`          | `Platform`                  | Target platform (`iOS`, `macOS`, ...)                    |
| `origin`            | `Origin`                    | `local` or `external`                                    |
| `project`           | `string?`                   | Owning project name                                      |
| `deploymentTargets` | `Record<Platform, string>?` | Multi-platform deployment targets                        |

### `GraphEdge`

| Field                | Type              | Description                                                |
|----------------------|-------------------|------------------------------------------------------------|
| `source`             | `string`          | ID of the source node (depends on target)                  |
| `target`             | `string`          | ID of the target node (dependency)                         |
| `kind`               | `DependencyKind?` | Dependency type (`target`, `project`, `sdk`, `xcframework`) |
| `platformConditions` | `Platform[]?`     | Platform conditions for this edge                          |

See the full type definitions in the [API Reference](/api/).
