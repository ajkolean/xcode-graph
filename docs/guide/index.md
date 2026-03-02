---
title: Getting Started
---

# Getting Started

XcodeGraph is a Lit web component for visualizing Xcode project dependency graphs. It renders an interactive, zoomable canvas with filtering, search, transitive dependency highlighting, and cluster-based layouts.

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

If you have the raw JSON output from the [XcodeGraph](https://github.com/nicklama/xcode-graph) Swift tool (or `tuist graph --format json`), use the convenience method:

```js
const app = document.querySelector('xcode-graph');
app.loadRawGraph(xcodeGraphJson);
```

`loadRawGraph` validates and transforms the raw JSON into the internal `GraphNode` / `GraphEdge` format automatically. Unknown enum values produce warnings rather than errors, so the component is forward-compatible with newer Xcode project types.

### File upload

Add the `show-upload` attribute to let users load their own graph JSON via a file picker or drag-and-drop:

```html
<xcode-graph show-upload></xcode-graph>
```

### Layout customization

Pass a `layoutOptions` object to override default layout parameters:

```js
const app = document.querySelector('xcode-graph');
app.layoutOptions = {
  configOverrides: {
    elkDirection: 'RIGHT',
    elkNodeSpacing: 300,
  },
};
```

See [Layout Configuration](/reference/layout-configuration) for all available options.

## Theming

The component is fully themeable via CSS custom properties. Set `--graph-*` properties on the `<xcode-graph>` element or any ancestor to match your team's brand or design system.

### Colors

```css
xcode-graph {
  /* Core */
  --graph-bg: #0d1117;
  --graph-bg-secondary: #161b22;
  --graph-text: #c9d1d9;
  --graph-text-muted: rgba(201, 209, 217, 0.5);
  --graph-accent: #58a6ff;
  --graph-accent-dim: rgba(88, 166, 255, 0.15);
  --graph-border: rgba(240, 246, 252, 0.1);
  --graph-canvas-bg: #0d1117;
  --graph-radius: 0.375rem;
}
```

### Node type colors

Each node type has its own color. Override them to match your team's palette:

```css
xcode-graph {
  --graph-node-app: #f78166;
  --graph-node-framework: #79c0ff;
  --graph-node-library: #7ee787;
  --graph-node-test: #d2a8ff;
  --graph-node-cli: #a5d6ff;
  --graph-node-package: #f0c674;
}
```

### Typography

```css
xcode-graph {
  --graph-font: 'Inter', system-ui, sans-serif;
  --graph-font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

### Light and dark mode

The component automatically adapts to the user's system preference via `prefers-color-scheme`. Both dark and light token sets are built in — no extra setup needed. Your `--graph-*` overrides apply to whichever mode is active.

To explicitly force a color scheme regardless of the user's system preference, set the `color-scheme` attribute:

```html
<!-- Force light mode -->
<xcode-graph color-scheme="light"></xcode-graph>

<!-- Force dark mode -->
<xcode-graph color-scheme="dark"></xcode-graph>

<!-- Follow system preference (default) -->
<xcode-graph color-scheme="auto"></xcode-graph>
```

Or set it programmatically:

```js
const app = document.querySelector('xcode-graph');
app.colorScheme = 'light';
```

### Platform colors

Each Apple platform has its own accent color used in badges and icons. Override them to match your design system:

```css
xcode-graph {
  --graph-platform-ios: #007AFF;
  --graph-platform-macos: #64D2FF;
  --graph-platform-tvos: #B87BFF;
  --graph-platform-watchos: #5AC8FA;
  --graph-platform-visionos: #7D7AFF;
}
```

See [Component API — CSS Custom Properties](/reference/component-api#css-custom-properties) for the full list of themeable properties with their default values in both modes.

## Component API

See [Component API](/reference/component-api) for the full reference. Here's a quick summary:

| Property | Attribute | Type | Description |
|---|---|---|---|
| `nodes` | — | `GraphNode[]` | Graph nodes to visualize |
| `edges` | — | `GraphEdge[]` | Graph edges connecting nodes |
| `layoutOptions` | — | `LayoutOptions` | Layout configuration overrides |
| `showUpload` | `show-upload` | `boolean` | Show the file upload button |
| `colorScheme` | `color-scheme` | `'light' \| 'dark' \| 'auto'` | Force light/dark mode or follow system |

| Method | Parameters | Description |
|---|---|---|
| `loadRawGraph()` | `raw: unknown` | Load and transform raw XcodeGraph JSON |

## Data Shape

The component accepts two arrays: nodes and edges. Each node represents a target, framework, or package in your Xcode project. Each edge represents a dependency between two nodes.

### `GraphNode`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier |
| `name` | `string` | Yes | Display name |
| `type` | [`NodeType`](/reference/data-types#nodetype) | Yes | Category (app, framework, library, etc.) |
| `platform` | [`Platform`](/reference/data-types#platform) | Yes | Target platform (iOS, macOS, etc.) |
| `origin` | [`Origin`](/reference/data-types#origin) | Yes | `local` or `external` |
| `project` | `string` | No | Parent project or package name |
| `targetCount` | `number` | No | Number of targets in this node |
| `bundleId` | `string` | No | Bundle identifier for the target |
| `productName` | `string` | No | Product name for the target |
| `deploymentTargets` | [`DeploymentTargets`](/reference/data-types#deploymenttargets) | No | Min version per platform |
| `destinations` | [`Destination[]`](/reference/data-types#destination) | No | Supported device destinations |
| `sourcePaths` | `string[]` | No | Source file paths |
| `tags` | `string[]` | No | Metadata tags |
| `path` | `string` | No | Path to the target or project |
| `isRemote` | `boolean` | No | Whether this is a remote dependency |
| `buildSettings` | [`BuildSettings`](/reference/data-types#buildsettings) | No | Curated build settings |
| `sourceCount` | `number` | No | Total source file count |
| `resourceCount` | `number` | No | Total resource file count |
| `notableResources` | `string[]` | No | Notable resources (privacy manifests, storyboards, etc.) |
| `foreignBuild` | [`ForeignBuildInfo`](/reference/data-types#foreignbuildinfo) | No | Foreign build info (Bazel, CMake, KMP/Gradle) |

### `GraphEdge`

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | `string` | Yes | ID of the source node (the one that depends on target) |
| `target` | `string` | Yes | ID of the target node (the dependency) |
| `kind` | [`DependencyKind`](/reference/data-types#dependencykind) | No | Type of dependency |
| `platformConditions` | [`Platform[]`](/reference/data-types#platform) | No | Platforms this dependency applies to |

### `GraphData`

The convenience wrapper used internally:

```ts
interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

See [Data Types](/reference/data-types) for the full reference of all enums, interfaces, and type definitions.
