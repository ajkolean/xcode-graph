---
title: Architecture
---

# Architecture

High-level overview of how `<xcode-graph>` is structured internally.

## Component tree

```
<xcode-graph>                  Root Lit web component
  └─ <xcode-graph-tab>         Orchestrator (layout + state wiring)
       ├─ <xcode-graph-sidebar> Filters, search, details panels
       └─ <xcode-graph-canvas>  SVG rendering + zoom/pan
```

The root `<xcode-graph>` element accepts data (nodes, edges, or raw JSON) and delegates rendering to the `<xcode-graph-tab>` orchestrator, which coordinates the sidebar and canvas.

## Data flow

```
Raw Tuist JSON
  │
  ▼
XcodeGraphService          Validates and transforms raw JSON
  │
  ▼
GraphDataService           Indexes nodes/edges for O(1) lookups
  │
  ▼
Lit Signals                Reactive state broadcasts changes
  │
  ▼
Canvas + UI components     Re-render on signal changes
```

1. **Input**: Raw JSON from `tuist graph --format json` or pre-processed `GraphNode[]`/`GraphEdge[]` arrays
2. **Transform**: `XcodeGraphService` validates with Zod schemas and maps raw types to internal types
3. **Storage**: `GraphDataService` builds indexed maps for fast dependency queries
4. **Reactivity**: Lit Signals propagate state changes to all subscribed components
5. **Rendering**: The canvas renders nodes and edges as SVG, the sidebar renders filters and details

## Layout pipeline

Layout happens in two phases:

1. **Macro layout (ELK.js)** -- Positions clusters (project groups) relative to each other using a hierarchical layout algorithm. Configurable direction (`DOWN`, `RIGHT`, etc.) and spacing.

2. **Micro layout (D3-force)** -- Positions individual nodes within their clusters using force simulation. Handles collision avoidance and link forces between connected nodes.

This two-phase approach keeps related nodes grouped while maintaining readable edge routing across the full graph.

## Key services

| Service | Purpose |
|---|---|
| `GraphDataService` | O(1) indexed data layer with dependency queries |
| `GraphAnalysisService` | Cycle detection and transitive path finding |
| `XcodeGraphService` | Raw Tuist JSON validation and transformation |
| `ErrorService` | User-facing error and warning handling |

## Directory structure

```
src/
├── components/     Root web component entry point
├── graph/          Rendering, layout, signals, controllers
│   ├── components/ Canvas, nodes, edges, overlays
│   ├── layout/     ELK + D3-force layout algorithms
│   ├── signals/    Graph-specific reactive state
│   └── controllers/ Lit reactive controllers
├── services/       Data transformation, analysis, loading
├── shared/         Types, state machines, utilities
│   ├── schemas/    Zod schemas and TypeScript types
│   ├── signals/    Shared reactive state
│   └── machines/   Zag-js state machines
├── ui/             80+ UI components (sidebar, filters, panels)
└── styles/         Design tokens (CSS custom properties)
```

## State management

The component uses [Lit Signals](https://www.npmjs.com/package/@lit-labs/signals) for reactive state management. Signals are organized by domain:

- **Graph signals** -- Current graph data, selected node, hovered node
- **Filter signals** -- Active filters (node type, platform, origin, search query)
- **UI signals** -- Sidebar state, layout mode, zoom level

Components subscribe to the signals they need and automatically re-render when those signals change. This avoids prop-drilling through the component tree and keeps state updates efficient.
