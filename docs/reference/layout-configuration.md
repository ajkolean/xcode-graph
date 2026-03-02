---
title: Layout Configuration
---

# Layout Configuration

The `<xcode-graph>` component uses a two-phase hierarchical layout:

1. **Macro layout** (ELK) — positions clusters (groups of related nodes) using the ELK layered algorithm
2. **Micro layout** (D3-force) — positions nodes within each cluster using force-directed simulation

You can customize both phases via the `layoutOptions` property.

## `LayoutOptions`

```ts
interface LayoutOptions {
  configOverrides?: Partial<LayoutConfig>;
  hooks?: LayoutHooks;
}
```

| Field | Type | Description |
|---|---|---|
| `configOverrides` | `Partial<LayoutConfig>` | Override any layout configuration parameter |
| `hooks` | `LayoutHooks` | Lifecycle hooks for observing or reacting to layout stages |

### Usage

```js
const app = document.querySelector('xcode-graph');

app.layoutOptions = {
  configOverrides: {
    elkDirection: 'RIGHT',
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

## `LayoutConfig`

All available configuration parameters with their default values. Pass any subset of these as `configOverrides`.

### ELK Macro Layout

These parameters control the cluster-level layout computed by ELK.js.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `elkDirection` | `'DOWN' \| 'RIGHT'` | `'DOWN'` | Direction of flow. `'DOWN'` = top-to-bottom, `'RIGHT'` = left-to-right. |
| `elkAlgorithm` | `string` | `'layered'` | ELK layout algorithm. `'layered'` is best for dependency graphs. |
| `elkEdgeRouting` | `'ORTHOGONAL' \| 'SPLINES'` | `'ORTHOGONAL'` | Edge routing style. `'ORTHOGONAL'` = rectilinear, `'SPLINES'` = curved. |
| `elkNodeSpacing` | `number` | `200` | Spacing between nodes in the same layer (pixels). |
| `elkLayerSpacing` | `number` | `300` | Spacing between layers/ranks (pixels). |
| `elkPadding` | `number` | `100` | Padding around clusters (pixels). |
| `elkMergeEdges` | `boolean` | `true` | Simplify edge routing by merging ports. |
| `elkMaxWidth` | `number` | `2000` | Maximum width target for wrapping. |
| `elkMaxHeight` | `number` | `2000` | Maximum height target for wrapping. |
| `elkHierarchyHandling` | `'INHERIT' \| 'INCLUDE_CHILDREN' \| 'SEPARATE_CHILDREN'` | `'SEPARATE_CHILDREN'` | How ELK handles hierarchy within clusters. |

### D3-Force Micro Layout

These parameters control the per-cluster interior node positioning using D3 force simulation.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `nodeRadius` | `number` | `6` | Base node radius (pixels). |
| `nodeCollisionPadding` | `number` | `20` | Extra padding around nodes to prevent overlap. |
| `linkDistance` | `number` | `45` | Desired distance between linked nodes. |
| `linkStrength` | `number` | `0.35` | Strength of link forces (0–1). |
| `nodeCharge` | `number` | `-35` | Repulsion force between nodes. Negative = repel. |

### Cross-Cluster Links

| Parameter | Type | Default | Description |
|---|---|---|---|
| `crossClusterDistanceMul` | `number` | `3.5` | Multiplier for cross-cluster link distance. |
| `crossClusterStrengthMul` | `number` | `0.02` | Multiplier for cross-cluster link strength. |

### Cluster Forces

| Parameter | Type | Default | Description |
|---|---|---|---|
| `clusterStrength` | `number` | `0.3` | Attraction strength toward cluster center. |
| `clusterDistanceMin` | `number` | `20` | Minimum distance before cluster force activates. |
| `clusterRepulsionStrength` | `number` | `8000` | Repulsion strength between clusters. |
| `clusterPadding` | `number` | `120` | Padding inside cluster boundaries. |
| `clusterAttractionStrength` | `number` | `0.2` | Attraction strength between related clusters. |
| `clusterAttractionActivationDist` | `number` | `500` | Distance threshold for cluster attraction. |
| `clusterRepulsionYScale` | `number` | `0.2` | Y-axis scaling for cluster repulsion. |

### Cluster Strata

| Parameter | Type | Default | Description |
|---|---|---|---|
| `clusterStrataSpacing` | `number` | `800` | Vertical spacing between cluster strata. |
| `clusterHorizontalSpacing` | `number` | `120` | Horizontal spacing between clusters in a row. |
| `clusterMaxRowWidth` | `number` | `900` | Maximum width before wrapping to next row. |
| `clusterStrataAnchorStrength` | `number` | `0.8` | Anchor strength pulling clusters to strata positions. |

### Layer/Stratum

| Parameter | Type | Default | Description |
|---|---|---|---|
| `layerSpacing` | `number` | `120` | Vertical spacing between node layers. |
| `layerStrength` | `number` | `0.35` | Force strength pushing nodes to their assigned layer. |

### Dependency Hang Force

| Parameter | Type | Default | Description |
|---|---|---|---|
| `hangGap` | `number` | `72` | Vertical gap for dependency hang positioning. |
| `hangStrength` | `number` | `0.08` | Strength of the dependency hang force. |

### Radial Force

| Parameter | Type | Default | Description |
|---|---|---|---|
| `radialStrength` | `number` | `0.25` | Strength of radial force pushing nodes toward cluster interior. |

### Simulation

| Parameter | Type | Default | Description |
|---|---|---|---|
| `iterations` | `number` | `300` | Number of force simulation iterations. Higher = more stable but slower. |

### Cluster Sizing

| Parameter | Type | Default | Description |
|---|---|---|---|
| `minClusterSize` | `number` | `60` | Minimum cluster size (pixels). |
| `clusterNodeSpacing` | `number` | `12` | Spacing between nodes within a cluster. |

### Edge Bundling

| Parameter | Type | Default | Description |
|---|---|---|---|
| `bundlingCycles` | `number` | `5` | Number of edge bundling cycles. |
| `bundlingIterations` | `number` | `80` | Iterations per bundling cycle. |
| `compatibilityThreshold` | `number` | `0.65` | Edge compatibility threshold for bundling (0–1). Higher = fewer bundles. |
| `bundlingBudget` | `number` | `40000` | Maximum edge pairs to consider for bundling. |

### Drift Prevention

| Parameter | Type | Default | Description |
|---|---|---|---|
| `clusterCenteringStrength` | `number` | `0.75` | Strength of force centering clusters. |
| `clusterBoundingRadius` | `number` | `1200` | Maximum bounding radius for cluster positions. |
| `clusterBoundingStrength` | `number` | `0.5` | Strength of bounding force. |
| `clusterStrataAlignmentStrength` | `number` | `0.45` | Strength of strata alignment force. |

### Port Routing

| Parameter | Type | Default | Description |
|---|---|---|---|
| `portRoutingEnabled` | `boolean` | `true` | Enable port-based edge routing for cross-cluster edges. |
| `portSpacing` | `number` | `20` | Minimum spacing between ports on a cluster boundary. |
| `portMargin` | `number` | `30` | Margin from cluster corners for port placement. |
| `maxPortsPerSide` | `number` | `8` | Maximum number of ports per side to prevent overcrowding. |

## `LayoutHooks`

Lifecycle hooks for observing or reacting to layout computation stages.

```ts
interface LayoutHooks {
  onBeforeLayout?: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  onAfterMicroLayout?: (clusters: Cluster[]) => void;
  onLayoutComplete?: (result: HierarchicalLayoutResult) => void;
}
```

| Hook | Parameters | Description |
|---|---|---|
| `onBeforeLayout` | `nodes: GraphNode[], edges: GraphEdge[]` | Called before layout computation starts. Useful for logging or pre-processing. |
| `onAfterMicroLayout` | `clusters: Cluster[]` | Called after per-cluster interior layout completes. |
| `onLayoutComplete` | `result: HierarchicalLayoutResult` | Called when layout is fully complete. The result contains all node/cluster positions, routed edges, and cycle detection data. |

### Example: Logging Layout Performance

```js
const start = performance.now();

app.layoutOptions = {
  hooks: {
    onBeforeLayout: (nodes, edges) => {
      console.log(`Starting layout: ${nodes.length} nodes, ${edges.length} edges`);
    },
    onLayoutComplete: (result) => {
      const elapsed = performance.now() - start;
      console.log(`Layout complete in ${elapsed.toFixed(0)}ms`);
      console.log(`Clusters: ${result.clusters.length}`);
      if (result.cycleNodes?.size) {
        console.warn(`Circular dependencies: ${result.cycleNodes.size} nodes in cycles`);
      }
    },
  },
};
```
