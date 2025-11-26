# Mass-Based Anchor Selection

## Overview

Each project cluster is a "solar system" with a central "sun" determined by **gravitational mass**, not just node type. The target with the greatest architectural mass becomes the center, with other targets orbiting in rings based on dependency depth.

## Mass Calculation

### Formula

```typescript
mass = (fanIn × 3) + (fanOut × 1) + ((maxDepth - depth) × 2) + (centrality × 0.5)
```

### Components

| Factor | Weight | Rationale |
|--------|--------|-----------|
| **Fan-in** | 3× | Being depended upon = architectural importance |
| **Fan-out** | 1× | Dependencies contribute to mass, but less |
| **Inverse Depth** | 2× | Deeper nodes are more foundational |
| **Centrality** | 0.5× | Nodes on many paths are structurally important |

### Example Calculations

**Scenario 1: Core Framework**
```
Node: CoreFramework
Fan-in: 12 targets depend on it
Fan-out: 2 dependencies
Depth: 1 (deep in hierarchy)
Centrality: 0.8 (on many paths)

Mass = (12 × 3) + (2 × 1) + ((3 - 1) × 2) + (0.8 × 0.5)
     = 36 + 2 + 4 + 0.4
     = 42.4 ← HIGH MASS = Likely anchor
```

**Scenario 2: Leaf App**
```
Node: MyApp
Fan-in: 0 (nothing depends on it)
Fan-out: 8 dependencies
Depth: 0 (top level)
Centrality: 0.1 (leaf node)

Mass = (0 × 3) + (8 × 1) + ((3 - 0) × 2) + (0.1 × 0.5)
     = 0 + 8 + 6 + 0.05
     = 14.05 ← Lower mass
```

**Scenario 3: Utility Library**
```
Node: StringUtils
Fan-in: 5 targets depend on it
Fan-out: 0 dependencies
Depth: 3 (very deep)
Centrality: 0.3

Mass = (5 × 3) + (0 × 1) + ((3 - 3) × 2) + (0.3 × 0.5)
     = 15 + 0 + 0 + 0.15
     = 15.15 ← Medium mass
```

**Result**: CoreFramework (mass 42.4) becomes the sun ⭐

## Implementation

### File: `/utils/massCalculation.ts`

#### 1. Compute Node Masses

```typescript
export function computeNodeMasses(
  nodes: Array<{ id: string; type: string }>,
  edges: Array<{ from: string; to: string }>
): Map<string, NodeMass>
```

**Process**:
1. Filter out test nodes (they don't participate)
2. Build adjacency lists (forward + reverse)
3. Compute depth from roots (BFS)
4. Compute betweenness centrality (path counting)
5. Calculate mass for each node
6. Return Map of nodeId → NodeMass

#### 2. Select Mass-Based Anchor

```typescript
export function selectMassBasedAnchor(
  nodes: Array<{ id: string; type: string }>,
  edges: Array<{ from: string; to: string }>
): string | null
```

**Returns**: Node ID with highest mass

#### 3. Select Multiple Anchors

```typescript
export function selectMultipleMassBasedAnchors(
  nodes: Array<{ id: string; type: string }>,
  edges: Array<{ from: string; to: string }>,
  maxAnchors: number = 3
): string[]
```

**Use case**: Large clusters with multiple root-like nodes

### File: `/utils/simpleClusterLayout.ts`

#### Integration

```typescript
function selectAnchors(
  nodes: Array<{ id: string; type: string }>,
  edges: Array<{ from: string; to: string }>
): string[] {
  // Use mass-based selection
  const anchor = selectMassBasedAnchor(nodes, edges);
  
  if (anchor) {
    return [anchor];
  }
  
  // Fallback 1: Nodes with no incoming edges
  // Fallback 2: First non-test node
  // ...
}
```

**Fallback strategy**:
1. **Primary**: Mass-based selection (highest mass)
2. **Fallback 1**: Roots (no incoming edges)
3. **Fallback 2**: First non-test node

## Visual Result

### Before (Type-Based)

```
Solar System: MobileApp Project

Center: MobileApp ⭐ (because type === 'app')
Ring 1: CoreFramework, NetworkKit, UIKit
Ring 2: StringUtils, DateUtils
Ring 3: LoggingKit
```

**Problem**: App might just be a thin shell. CoreFramework is the real architectural center.

### After (Mass-Based)

```
Solar System: MobileApp Project

Center: CoreFramework ⭐ (mass = 42.4)
  ↑ Fan-in: 12
  ↑ Centrality: 0.8
  
Ring 1: NetworkKit, UIKit, MobileApp
  ↑ MobileApp moved to ring 1 (it depends on CoreFramework)
  
Ring 2: StringUtils, DateUtils
Ring 3: LoggingKit
```

**Result**: The true architectural center becomes the sun!

## Centrality Calculation

### Betweenness Centrality (Simplified)

Measures how often a node appears on shortest paths between other nodes.

**Algorithm**:
1. For each node as source:
   - BFS to all reachable nodes
   - Count paths through each node
2. Accumulate path counts across all sources
3. Normalize to 0-1 range

**Why it matters**: Nodes with high centrality are "bridges" in the architecture. Removing them would fragment the graph.

```typescript
function computeCentrality(
  nodeIds: string[],
  adj: AdjacencyList
): Map<string, number>
```

## Depth Calculation

### From Roots

Depth = distance from nodes with no dependencies (roots).

**Algorithm**:
1. Find all roots (incoming edges = 0)
2. BFS from roots, incrementing depth
3. Unreachable nodes get max depth + 1

**Why it matters**: Foundational modules (deep in the hierarchy) are more architecturally important than leaf apps.

```
Depth 0: Apps, CLIs (top level)
Depth 1: Feature frameworks
Depth 2: Core frameworks
Depth 3: Utility libraries ← Higher mass weight
```

## Edge Cases

### 1. Cycle in Dependencies

**Handled by**: Cluster grouping already collapsed SCCs at cluster level.  
**Result**: Within a cluster, cycles are rare. If present, BFS handles them gracefully.

### 2. Multiple Roots

**Handled by**: `selectMultipleMassBasedAnchors(nodes, edges, 3)`  
**Result**: Up to 3 anchors in ring 0, evenly distributed.

### 3. No Clear Anchor

**Handled by**: Fallback to first non-test node  
**Result**: Arbitrary but deterministic anchor.

### 4. Test-Only Cluster

**Handled by**: Tests filtered out before mass calculation  
**Result**: If only tests exist, fallback selects first test (rare edge case).

## Benefits

### 1. Architectural Truth

The visual layout reflects the actual architecture:
- Core modules at center
- Leaf modules at edges
- Bridges have high centrality = visual prominence

### 2. Stable Across Refactors

As dependencies change, mass shifts naturally:
- Add deps to a module → mass increases
- Module becomes more depended upon → mass increases
- Visual layout adapts to reflect new reality

### 3. Multi-Platform Projects

In a cross-platform project:
```
SharedKit (mass: 50) → Center ⭐
  ↑ Used by iOS, macOS, watchOS, visionOS

iOSApp (mass: 12) → Ring 1
macOSApp (mass: 10) → Ring 1
watchOSApp (mass: 8) → Ring 1
visionOSApp (mass: 6) → Ring 1
```

The shared core becomes the sun, not an arbitrary app.

### 4. Monorepo Clarity

In a monorepo with many packages:
```
core-platform (mass: 80) → Center ⭐
  ↑ Depended on by 20+ packages
  ↑ High centrality

feature-payments (mass: 25) → Ring 1
feature-auth (mass: 22) → Ring 1
feature-analytics (mass: 18) → Ring 1

app-ios (mass: 5) → Ring 2
app-android (mass: 5) → Ring 2
```

## Performance

### Time Complexity

```
N = number of nodes in cluster
E = number of edges in cluster

Fan-in/Fan-out: O(E)
Depth (BFS): O(N + E)
Centrality (all-pairs BFS): O(N × (N + E)) = O(N² + NE)

Total: O(N² + NE)
```

**Acceptable because**:
- Computed once per cluster
- Clusters are typically small (5-20 nodes)
- Results are cached in layout

### Space Complexity

```
Adjacency lists: O(N + E)
Depth map: O(N)
Centrality map: O(N)
Mass map: O(N)

Total: O(N + E)
```

## Future Enhancements

### 1. Public API Weight

```typescript
mass += (publicAPICount × 0.8)
```

Could parse Swift code to detect `public` declarations.

### 2. Code Size Weight

```typescript
mass += (linesOfCode / 1000) × 0.2
```

Larger modules have more "gravitational pull".

### 3. Change Frequency

```typescript
mass += (commitsLast30Days × 0.1)
```

Active modules are architecturally important.

### 4. Test Coverage

```typescript
mass += (testCoverage × 0.3)
```

Well-tested modules are more stable = more mass.

## Design System Compliance

All styling in the visualization uses CSS variables:

```css
/* Anchor node (sun) */
fill: var(--color-primary);
stroke: var(--color-primary-foreground);
font-family: 'DM Sans', sans-serif; /* For labels */

/* Ring nodes */
fill: var(--color-accent);
font-family: 'Inter', sans-serif;

/* Test satellites */
fill: var(--color-muted);
opacity: 0.8;
```

Typography:
- **Headings (h1, h2)**: `'DM Sans'`
- **Body (labels, tooltips)**: `'Inter'`

All visual properties derive from `/styles/globals.css`.

## Summary

**Mass = Architectural Importance**

The "sun" of each solar system is determined by:
- ✅ How many targets depend on it (fan-in)
- ✅ How deep it is in the hierarchy (foundational)
- ✅ How central it is to the graph structure (bridge)
- ✅ NOT just its type (app/framework)

**Result**: The true architectural center becomes visually central.

**The geometry encodes the architecture.**
