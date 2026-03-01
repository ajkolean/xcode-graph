---
title: Getting Started
---

# Getting Started

XcodeGraph is a Lit web component for visualizing Xcode project dependency graphs.

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

These are the core fields. See the full type definitions in the [API Reference](/api/) for all available properties including `buildSettings`, `sourceType`, `dependencies`, and more.
