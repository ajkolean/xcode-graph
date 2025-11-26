# Architecture Overview

## Directory Structure

```
/
├── components/
│   ├── graph/                    # Core graph rendering components
│   │   ├── GraphNode.tsx
│   │   ├── GraphEdge.tsx
│   │   ├── GraphCluster.tsx
│   │   ├── ClusterCard.tsx
│   │   ├── useRadialClusterSimulation.ts
│   │   ├── useForceSimulation.ts
│   │   └── graphUtils.ts (deprecated)
│   │
│   ├── nodeDetails/              # Node details panel sub-components
│   │   ├── NodeHeader.tsx
│   │   ├── NodeActions.tsx
│   │   ├── MetricsSection.tsx
│   │   ├── DependenciesList.tsx
│   │   └── DependentsList.tsx
│   │
│   ├── ui/                       # Reusable UI components
│   │
│   ├── GraphVisualization.tsx    # Main graph canvas
│   ├── NodeDetailsPanel.tsx      # Details sidebar (refactored)
│   ├── FilterPanel.tsx
│   ├── LegendPanel.tsx
│   ├── RightSidebar.tsx
│   └── ExportModal.tsx
│
├── hooks/
│   ├── useGraphInteractions.ts   # Pan/zoom/drag logic
│   └── useNodeDependencies.ts    # Dependency queries
│
├── types/
│   ├── cluster.ts                # Cluster & layout types
│   └── simulation.ts             # Simulation types (NodePosition, ClusterPosition)
│
├── utils/
│   ├── simulation/               # Force simulation
│   │   ├── radialForces.ts       # Individual force functions
│   │   ├── clusterForces.ts      # Cluster-level forces
│   │   └── initializeSimulation.ts
│   │
│   ├── positioning/              # Node positioning
│   │   ├── nodeLayoutOrchestrator.ts  # Main layout orchestrator
│   │   ├── layerPositioning.ts
│   │   ├── angleCalculation.ts
│   │   └── testNodePositioning.ts
│   │
│   ├── analysis/                 # Cluster analysis
│   │   ├── testNodeAnalysis.ts
│   │   ├── dependencyMapping.ts
│   │   └── roleAssignment.ts
│   │
│   ├── graph/                    # Graph utilities
│   │   ├── nodeSizing.ts
│   │   ├── nodeColors.ts
│   │   ├── nodeConnections.ts
│   │   └── nodeVisibility.ts
│   │
│   ├── nodeDetails/              # Detail panel utilities
│   │   └── nodeTypeUtils.ts
│   │
│   ├── clusterLayout.ts          # Re-exports
│   ├── clusterPositioning.ts     # Core positioning (can be refactored further)
│   ├── clusterAnalysis.ts        # Core analysis (can be refactored further)
│   ├── clusterGrouping.ts
│   └── clusterRadialArrangement.ts
│
├── services/
│   └── graphService.ts           # Graph algorithms (paths, cycles)
│
└── data/
    └── mockGraphData.ts
```

## Component Responsibilities

### Main Components

**App.tsx**
- Application state management
- View mode coordination
- Filter state
- Top-level event handlers

**GraphVisualization.tsx**
- Canvas rendering
- SVG group management
- Delegates interactions to `useGraphInteractions`
- Renders clusters, nodes, and edges

**NodeDetailsPanel.tsx** (Refactored)
- Composed of smaller sub-components
- Uses `useNodeDependencies` hook
- Clean separation of concerns

### Node Details Sub-components

- **NodeHeader** - Title, icon, close button
- **NodeActions** - Action buttons (focus, show chains)
- **MetricsSection** - Fan-in/fan-out metrics
- **DependenciesList** - Dependency list
- **DependentsList** - Dependents list

## Hooks

**useGraphInteractions**
- Pan state management
- Node dragging
- Mouse event handlers
- Returns: pan, drag state, event handlers, svgRef

**useNodeDependencies**
- Memoized dependency/dependent queries
- Calculates metrics (fan-in, fan-out)
- Returns: dependencies, dependents, metrics

**useRadialClusterSimulation**
- Cluster grouping
- Node positioning
- Force simulation loop
- Uses modular force functions

## Utilities Organization

### Simulation (`/utils/simulation/`)
Individual, testable force functions and initialization logic

### Positioning (`/utils/positioning/`)
Node layout algorithms broken into:
- Layer radius calculation
- Angle distribution
- Role-based sectors
- Test node satellites
- Main orchestrator

### Analysis (`/utils/analysis/`)
Cluster analysis broken into:
- Test node identification
- Dependency mapping
- Role assignment

### Graph (`/utils/graph/`)
Graph-wide utilities:
- Node sizing
- Colors
- Connections
- Visibility/filtering

## Data Flow

```
mockGraphData
  ↓
useRadialClusterSimulation
  ├─→ clusterGrouping → Clusters
  ├─→ clusterAnalysis → Metadata
  ├─→ clusterPositioning → PositionedNodes
  ├─→ clusterRadialArrangement → Bullseye layout
  └─→ simulation forces → Final positions
      ↓
GraphVisualization
  ├─→ ClusterCard (for each cluster)
  ├─→ GraphEdge (for each edge)
  └─→ GraphNode (for each node)
      ↓
NodeDetailsPanel (when selected)
  ├─→ useNodeDependencies
  └─→ Sub-components
```

## Design Principles

1. **Single Responsibility** - Each file has one clear purpose
2. **Composability** - Small components compose into larger ones
3. **Testability** - Pure functions, isolated logic
4. **DRY** - Shared types, no duplication
5. **Design System First** - All styling uses CSS custom properties

## Design System Usage

All components use CSS variables from `/styles/globals.css`:
- **Colors**: `var(--color-*)`
- **Spacing**: `var(--space-*)`
- **Borders**: `var(--border-*)`
- **Radius**: `var(--radius-*)`
- **Typography**: DM Sans (headings), Inter (body)
- **Font sizes**: `var(--text-*)`
- **Font weights**: `var(--font-weight-*)`

## Performance Considerations

- Memoization in hooks (`useMemo`)
- RequestAnimationFrame for simulation
- Efficient collision detection
- Map-based lookups
- Alpha decay for simulation convergence

## Future Refactoring Opportunities

1. Further break down `clusterPositioning.ts` using the new positioning modules
2. Further break down `clusterAnalysis.ts` using the new analysis modules
3. Extract GraphVisualization edge rendering logic
4. Create a `useClusterLayout` hook
5. Split `App.tsx` state into context providers
