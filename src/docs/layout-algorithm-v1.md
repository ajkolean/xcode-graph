# Layout Algorithm v1: Practical Implementation

This document describes the **practical v1** layout algorithm that creates deterministic, hierarchical graph layouts without overengineering.

## Architecture

The layout uses a **two-graph model** with a **unified algorithm** for both levels:

1. **Cluster Graph** - Projects/packages with cross-project dependencies
2. **Intra-Cluster Graph** - Targets/nodes within each project

**Key insight:** Both levels use the **same ring-based algorithm**, creating consistent hierarchical structure throughout.

## Unified Ring Algorithm

The core algorithm (`unifiedRingLayout.ts`) works for any set of items with dependencies:

1. **Identify anchors** - Most important items (high coreScore or explicit markers)
2. **Compute ring assignment** - BFS from anchors, clamp depth to 0-2
3. **Order within rings** - Sort by edge count to previous ring
4. **Position radially** - Ring 0 at center, rings 1-2 radiate outward

This creates a **center → periphery** hierarchy with minimal edge crossings.

## Algorithm Flow

### Step 1: Group & Analyze

```
groupIntoClusters() → analyzeCluster()
```

- Groups nodes by project/package
- Identifies anchors (apps, frameworks with external dependents, CLIs)
- Determines node roles (entry, internal-framework, internal-lib, utility, test, tool)
- Calculates dependency metrics

### Step 2: Cluster Layout (Grid + CoreScore)

```
layoutClustersUnified(clusters, edges)
```

**Algorithm:**
1. Build cluster graph (cross-project dependencies)
2. Identify anchor clusters using `coreScore = fanIn * 2 + fanOut`
3. Apply unified ring layout to clusters
4. Core clusters in center ring, leaf clusters radiate outward

**Why this works:**
- Same algorithm as intra-cluster = consistent hierarchy
- Core projects naturally appear at center
- Deterministic and fast
- Creates radial structure at cluster level too

**Future v2:** Add DAG layering with crossing minimization if needed

### Step 3: Intra-Cluster Layout (Unified Rings)

```
layoutNodesInClusterUnified(cluster, edges, config)
```

**Ring Assignment (0, 1, or 2):**
- **Ring 0:** Anchors (center)
- **Ring 1:** Direct dependencies of anchors
- **Ring 2:** Everything else

Uses BFS from anchors to compute topological depth, clamped to 0-2.

**Angular Ordering:**
- For each ring, sort nodes by:
  1. Number of edges feeding previous ring (descending)
  2. Alphabetically (for determinism)
- This clusters related nodes and reduces edge crossings

**Test Satellites:**
- Tests orbit their subject nodes at fixed radius
- Offset angle based on test type (unit vs UI)

**Why this works:**
- Simple edge-count sorting gets 80% of spectral ordering benefits
- No linear algebra or complex solvers needed
- Deterministic and fast
- Clear hierarchical structure

**Future v2:** Add spectral ordering (Fiedler vector) if edge crossings are still bad

### Step 4: Bounds Calculation

```
calculateClusterBounds(positioned, config)
```

Calculates tight bounding box around positioned nodes.
No artificial minimum sizes - natural size variation!

### Step 5: Optional Relaxation

```
relaxNodePositions(nodes, clusters, edges, config, options)
```

Short relaxation pass (20-30 iterations) to:
- De-overlap nodes
- Smooth positions

**Constraints:**
- Nodes stay in their rings
- Tests stay in orbit
- Anchors pinned

Optional - can be disabled for pure determinism.

## Key Principles

### ✅ Do

- Use simple, practical algorithms
- Prioritize determinism
- Hard-clamp values (3 rings max)
- Sort by simple metrics (edge count, coreScore)
- Keep iteration counts low (20-30 max)

### ❌ Don't

- Overcomplicate with SCC/DAG layering in v1
- Add spectral ordering unless needed
- Run continuous force simulation
- Allow infinite ring depths
- Add features before measuring need

## Configuration

All spacing/sizing controlled by `ClusterLayoutConfig`:

```typescript
{
  ringRadius: 100,         // Base radius for rings
  layerSpacing: 75,        // Gap between rings
  testOrbitRadius: 40,     // Test satellite distance
  clusterPadding: 35,      // Inside padding
  clusterSpacing: 80,      // Between clusters
  // ... node sizes, force strengths
}
```

## Performance

- **Cluster layout:** O(C log C) where C = cluster count
- **Intra-cluster layout:** O(N log N + E) per cluster where N = nodes, E = edges
- **Total:** ~O(N log N + E) for entire graph
- **No continuous simulation** = instant layout

## Results

- **Deterministic:** Same graph = same layout every time
- **Hierarchical:** Clear center → periphery structure
- **Natural sizing:** Small clusters compact, large clusters spacious
- **Minimal crossings:** Edge-count ordering reduces crossings
- **Fast:** Computes in milliseconds

## Future Enhancements (v2)

Only add if measurements show they're needed:

1. **DAG layering** for cluster placement
2. **Spectral ordering** for angular placement
3. **Crossing minimization** (median heuristic)
4. **Community detection** for sectors
5. **Ring 3+** for monster projects

Ship v1 first, measure, then iterate!