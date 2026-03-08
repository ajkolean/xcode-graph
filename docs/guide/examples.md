---
title: Examples
---

# Examples

Common usage patterns for the `<xcode-graph>` web component.

## Embedded with data

Pass `GraphNode[]` and `GraphEdge[]` arrays directly as properties:

```html
<script type="module">
  import 'xcode-graph';

  const graph = document.querySelector('xcode-graph');
  graph.nodes = [
    { id: 'app', name: 'MyApp', type: 'app', platform: 'iOS', origin: 'local' },
    { id: 'core', name: 'Core', type: 'framework', platform: 'iOS', origin: 'local' },
    { id: 'alamofire', name: 'Alamofire', type: 'package', platform: 'iOS', origin: 'external' },
  ];
  graph.edges = [
    { source: 'app', target: 'core' },
    { source: 'core', target: 'alamofire' },
  ];
</script>

<xcode-graph></xcode-graph>
```

## File upload

Use the `show-upload` attribute to enable drag-and-drop or file picker for graph JSON files:

```html
<xcode-graph show-upload></xcode-graph>
```

Users can drop a `graph.json` file exported from `tuist graph --format json` or the [XcodeGraph](https://github.com/nicklama/xcode-graph) Swift tool.

## Loading from API

Fetch graph JSON from a server and call `loadRawGraph()`:

```html
<script type="module">
  import 'xcode-graph';

  const res = await fetch('/api/graph.json');
  const raw = await res.json();

  const graph = document.querySelector('xcode-graph');
  graph.loadRawGraph(raw);
</script>

<xcode-graph></xcode-graph>
```

`loadRawGraph` validates and transforms the raw Tuist/XcodeGraph JSON into internal types automatically.

## CDN usage

No bundler required -- load directly from a CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://cdn.jsdelivr.net/npm/xcode-graph/dist/tuistgraph.js"></script>
  <style>
    xcode-graph { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  <xcode-graph show-upload></xcode-graph>
</body>
</html>
```

## Layout customization

Override the default ELK layout direction, node spacing, and other parameters:

```js
const graph = document.querySelector('xcode-graph');
graph.layoutOptions = {
  configOverrides: {
    elkDirection: 'RIGHT',    // 'DOWN' | 'RIGHT' | 'LEFT' | 'UP'
    elkNodeSpacing: 300,
    iterations: 50,
  },
};
```

See [Layout Configuration](/reference/layout-configuration) for all available options.

## Theming

Apply custom colors via CSS custom properties on the element or an ancestor:

```css
xcode-graph {
  --graph-bg: #1a1b26;
  --graph-text: #a9b1d6;
  --graph-accent: #7aa2f7;
  --graph-border: rgba(169, 177, 214, 0.1);

  /* Node type colors */
  --graph-node-app: #f7768e;
  --graph-node-framework: #7aa2f7;
  --graph-node-package: #e0af68;
}
```

Force a specific color scheme instead of following the system preference:

```html
<xcode-graph color-scheme="light"></xcode-graph>
```

See [Component API -- CSS Custom Properties](/reference/component-api#css-custom-properties) for the full list of themeable properties.
