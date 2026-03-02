---
title: Component API
---

# Component API

Complete API reference for the `<xcode-graph>` web component.

## `<xcode-graph>`

The root component that orchestrates the entire graph visualization. It renders an interactive canvas with a sidebar for filtering, search, and node details.

### Properties

Properties are set via JavaScript (not HTML attributes) using dot notation in Lit templates or direct assignment:

```js
const el = document.querySelector('xcode-graph');
el.nodes = myNodes;
el.edges = myEdges;
el.layoutOptions = { configOverrides: { elkDirection: 'RIGHT' } };
```

| Property | Type | Default | Description |
|---|---|---|---|
| `nodes` | [`GraphNode[]`](/reference/data-types#graphnode) | `undefined` | Graph nodes to visualize. Setting this (along with `edges`) triggers layout computation. |
| `edges` | [`GraphEdge[]`](/reference/data-types#graphedge) | `undefined` | Graph edges connecting the nodes. |
| `layoutOptions` | [`LayoutOptions`](/reference/layout-configuration) | `undefined` | Optional layout configuration. Override ELK parameters, force strengths, or hook into layout lifecycle. |
| `showUpload` | `boolean` | `undefined` | Whether to show the file upload overlay. Can also be set via the `show-upload` HTML attribute. |
| `colorScheme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color scheme preference. `'auto'` follows the user's system preference. Set to `'light'` or `'dark'` to force a specific mode. |

### Attributes

HTML attributes that can be set declaratively:

| Attribute | Type | Description |
|---|---|---|
| `show-upload` | `boolean` | Show the file upload button in the bottom-left corner. Presence of the attribute enables it. |
| `color-scheme` | `'light' \| 'dark' \| 'auto'` | Force a color scheme. Defaults to `'auto'` (follows system preference). |

```html
<!-- Enable file upload via attribute -->
<xcode-graph show-upload></xcode-graph>

<!-- Force light mode -->
<xcode-graph color-scheme="light"></xcode-graph>
```

### Methods

#### `loadRawGraph(raw: unknown): void`

Load raw XcodeGraph JSON and transform it into the internal graph format. This is the easiest way to populate the component — pass the JSON output from `tuist graph --format json` or any tool that produces XcodeGraph-compatible JSON.

```js
const res = await fetch('/my-graph.json');
const raw = await res.json();

const app = document.querySelector('xcode-graph');
app.loadRawGraph(raw);
```

**Behavior:**
- Validates and transforms the raw JSON into `GraphNode[]` / `GraphEdge[]`
- Sets `nodes` and `edges` automatically on success
- Shows a warning toast if the transform produces compatibility warnings (e.g., unknown enum values)
- Shows an error toast if the data contains no nodes
- Shows a critical error toast if the JSON format is incompatible
- Never throws — all errors are handled internally via toast notifications

### Events

The root component does not dispatch custom events directly. Internal child components communicate via events that are handled within the component tree.

### CSS Custom Properties

The component is fully themeable via `--graph-*` CSS custom properties. Set these on the `<xcode-graph>` element or any ancestor to customize the appearance.

#### Core Theme Properties

| Property | Default (Dark) | Default (Light) | Description |
|---|---|---|---|
| `--graph-bg` | `#161617` | `#f5f5f7` | Background color |
| `--graph-bg-secondary` | `#1c1c1e` | `#ffffff` | Card/sidebar background |
| `--graph-text` | `rgba(225, 228, 232, 1)` | `rgba(28, 28, 30, 1)` | Primary text color |
| `--graph-text-muted` | `rgba(225, 228, 232, 0.5)` | `rgba(28, 28, 30, 0.5)` | Muted/secondary text |
| `--graph-accent` | `rgba(124, 58, 237, 1)` | `rgba(111, 44, 255, 1)` | Accent/brand color |
| `--graph-accent-dim` | `rgba(124, 58, 237, 0.15)` | `rgba(111, 44, 255, 0.1)` | Dimmed accent for backgrounds |
| `--graph-border` | `rgba(255, 255, 255, 0.08)` | `rgba(0, 0, 0, 0.1)` | Border color |
| `--graph-canvas-bg` | Inherits from `--graph-bg` | Inherits from `--graph-bg` | Canvas background |
| `--graph-radius` | `0.375rem` | `0.375rem` | Base border radius |

#### Node Type Colors

| Property | Default (Dark) | Description |
|---|---|---|
| `--graph-node-app` | `#F59E0B` | App target nodes |
| `--graph-node-framework` | `#0EA5E9` | Framework nodes |
| `--graph-node-library` | `#22C55E` | Library nodes |
| `--graph-node-test` | `#EC4899` | Test target nodes |
| `--graph-node-cli` | `#3B82F6` | CLI tool nodes |
| `--graph-node-package` | `#EAB308` | Package dependency nodes |

#### Platform Colors

| Property | Default (Dark) | Default (Light) | Description |
|---|---|---|---|
| `--graph-platform-ios` | `#007AFF` | `#0064D2` | iOS platform accent |
| `--graph-platform-macos` | `#64D2FF` | `#0891B2` | macOS platform accent |
| `--graph-platform-tvos` | `#B87BFF` | `#7C3AED` | tvOS platform accent |
| `--graph-platform-watchos` | `#5AC8FA` | `#0284C7` | watchOS platform accent |
| `--graph-platform-visionos` | `#7D7AFF` | `#6366F1` | visionOS platform accent |

#### Typography

| Property | Default | Description |
|---|---|---|
| `--graph-font` | `system-ui, -apple-system, sans-serif` | Body and heading font family |
| `--graph-font-mono` | `ui-monospace, monospace` | Monospace font family |

#### Example: Custom Theme

```html
<style>
  xcode-graph {
    --graph-bg: #0d1117;
    --graph-bg-secondary: #161b22;
    --graph-text: #c9d1d9;
    --graph-accent: #58a6ff;
    --graph-border: rgba(240, 246, 252, 0.1);
    --graph-node-app: #f78166;
    --graph-node-framework: #79c0ff;
    --graph-node-package: #d2a8ff;
  }
</style>

<xcode-graph show-upload></xcode-graph>
```

### Color Scheme

By default (`color-scheme="auto"`), the component adapts to light and dark mode via the system's `prefers-color-scheme`. All internal tokens have both dark and light variants.

To force a specific mode regardless of system preference:

```html
<xcode-graph color-scheme="light"></xcode-graph>
<xcode-graph color-scheme="dark"></xcode-graph>
```

The component sets a `data-theme` attribute on its host element (`data-theme="light"` or `data-theme="dark"`) and the CSS `color-scheme` property so native browser elements (scrollbars, form controls) match the chosen mode.

You can override individual colors using the `--graph-*` properties above. Your overrides apply in both modes.

### Sizing

The component fills its parent container. Set a width and height on the element or its container:

```html
<xcode-graph style="width: 100%; height: 600px;"></xcode-graph>
```

```css
xcode-graph {
  display: block;
  width: 100vw;
  height: 100vh;
}
```

## `<xcode-graph-file-upload>`

An internal sub-component that renders a file upload button. It is automatically included when `show-upload` is set on the root component. You do not need to use this directly.

### Behavior

- Renders a button in the bottom-left corner of the canvas
- Click to open a native file picker (`.json` files only)
- Drag-and-drop a JSON file onto the canvas
- Dispatches `graph-file-loaded` event with the parsed JSON
- Shows error toast notifications for invalid JSON files

### Events

| Event | Detail | Description |
|---|---|---|
| `graph-file-loaded` | `{ raw: unknown }` | Dispatched when a valid JSON file is loaded. `raw` is the parsed JSON value. |
