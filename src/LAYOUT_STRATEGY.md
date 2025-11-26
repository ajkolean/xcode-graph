# Layout Strategy: Deterministic vs Force Simulation

## The Problem with Continuous Force Simulation

### What We Had Before
- Continuous force simulation running every frame
- Nodes would "shake" and drift unpredictably
- No guarantee of stable positions
- Generic physics engine trying to "guess" good architecture
- Initial snap-in effect where nodes appeared wrong, then corrected

### Why It Was Wrong
For a **structured architectural graph** like Xcode/Tuist dependencies:
- We know the semantic meaning of nodes (apps, frameworks, tests)
- We know the relationships (dependencies flow)
- We want **intentional, stable positioning** that reflects architecture
- We don't want "shiny chaos simulator"

## The New Approach: Deterministic Layout

### Philosophy
**"A few hundred lines of boring geometry"** beats hoping physics discovers architecture.

### Two-Phase System

#### Phase 1: Deterministic Calculation (ONCE)
Calculate positions based on:
1. **Cluster-level**: Dependency-aware radial/grid placement
2. **Node-level**: Ring-based positioning with role sectors
3. **Test nodes**: Satellite positioning around subjects

#### Phase 2: Optional Short Relaxation (30 iterations, then FREEZE)
- Light collision avoidance
- Minor position refinement
- **Then STOP** - no continuous simulation

### Benefits
✅ **Stable positions** - No shaking or drifting  
✅ **Predictable** - Same input = same output  
✅ **Intentional** - Layout reflects semantic meaning  
✅ **Fast** - Calculate once, not every frame  
✅ **Debuggable** - Clear algorithm, not black box physics  

## Implementation Details

### Cluster Layout (`/utils/layout/deterministicClusterLayout.ts`)

**Scoring System:**
```typescript
score = inbound_edges * 2 + outbound_edges
```

- **High inbound** = Core/central (many depend on it)
- **High outbound** = Leaf/peripheral (depends on many)

**Radial Placement:**
1. Sort clusters by score (descending)
2. Most connected → inner rings
3. Least connected → outer rings
4. 4-6 clusters per ring for spacing

**Alternative: Grid Placement:**
- Sort by score
- Place in grid rows
- Core at top, leaves at bottom

### Node Layout (`/utils/layout/deterministicNodeLayout.ts`)

**Step 1: Identify Anchors**
```typescript
anchors = apps | CLIs | frameworks with external dependents
```

**Step 2: Assign Layers (Rings)**
```typescript
layer = shortest_path_to_anchor
Clamp to 0-2 (we don't need 8 rings)
```

**Step 3: Position on Rings**
```typescript
radius = baseRadius + layer * spacing
Adjusted for node count (ensure no overlap)

Role sectors:
- Entry: Top (270° to 30°)
- Frameworks: Right (30° to 120°)
- Libraries: Bottom (120° to 210°)
- Utilities: Left (210° to 270°)
- Tools: Left-top (270° to 360°)
```

**Step 4: Test Satellites**
```typescript
For each test:
  1. Find subject (by metadata or name heuristic)
  2. Orbit at small radius (~40px)
  3. Distribute: Top, Right, Bottom, Left
```

### Relaxation Pass (`/utils/layout/layoutRelaxation.ts`)

**Purpose:** Smooth out any remaining overlaps

**Configuration:**
- **30 iterations** (not infinite!)
- Collision strength: 0.8
- Link strength: 0.1 (very weak)
- Alpha decay: 1.0 → 0.0 over iterations

**Forces Applied:**
1. Node collision (label-aware spacing)
2. Cluster collision
3. Mild link force (keep connected nodes closer)
4. Boundary constraints (stay in cluster)

**After 30 iterations: FREEZE**
- Zero all velocities
- No further updates
- Positions are final

## Usage

### Basic Usage
```typescript
const { nodePositions, clusterPositions, clusters } = useDeterministicLayout(nodes, edges, {
  enableRelaxation: true,
  relaxationIterations: 30
});
```

### No Relaxation (Pure Deterministic)
```typescript
const layout = useDeterministicLayout(nodes, edges, {
  enableRelaxation: false
});
```

### Custom Relaxation
```typescript
const layout = useDeterministicLayout(nodes, edges, {
  enableRelaxation: true,
  relaxationIterations: 50 // More polish
});
```

## Comparison

### Before: Continuous Force Simulation
```
Calculate initial → Run force loop (forever)
                   ↓
              Nodes shake
                   ↓
           Never truly stable
```

### After: Deterministic + Short Relaxation
```
Calculate positions → Relax 30 iterations → FREEZE
         ↓                    ↓                ↓
   Intentional          Minor polish      Perfectly stable
```

## When to Use Each Approach

### Use Deterministic Layout When:
- ✅ Graph has semantic structure (like Xcode projects)
- ✅ You want stable, predictable positions
- ✅ You know what "good layout" means for your domain
- ✅ Users expect intentional positioning

### Use Force Simulation When:
- Graph has 1000+ unclustered nodes
- No semantic structure to exploit
- "Don't overlap" is the only requirement
- Exploratory visualization of unknown data

## For This Tuist Project:
**Deterministic layout is the RIGHT choice.**

### Reasons:
1. **Structured domain** - Xcode projects have clear architecture
2. **Role-based positioning** - Apps, frameworks, tests have meaning
3. **Dependency flow** - Want to show architectural layers
4. **Professional tool** - Developers expect intentional, stable layout
5. **Small-medium graphs** - 10-100 nodes per cluster, not 10,000

## Customization Points

### Adjust Cluster Spacing
```typescript
// In deterministicClusterLayout.ts
const clusterSpacing = 500; // Increase for more spread
```

### Adjust Ring Spacing
```typescript
// In cluster config
config.layerSpacing = 120; // Default, increase for more space
```

### Adjust Test Orbit
```typescript
config.testOrbitRadius = 40; // How far tests orbit subjects
```

### Adjust Relaxation Strength
```typescript
{
  iterations: 30,
  nodeCollisionStrength: 0.8,  // Higher = stronger repulsion
  clusterCollisionStrength: 1.0,
  linkStrength: 0.1            // Higher = stronger attraction
}
```

## Performance

### Before (Continuous Simulation)
- ⚠️ 60 FPS force calculation
- ⚠️ Never ends
- ⚠️ High CPU usage

### After (Deterministic + Short Relaxation)
- ✅ Calculate once on data change
- ✅ 30 iterations (~500ms)
- ✅ Then zero CPU (frozen)

## Migration Notes

### Old Hook
```typescript
useRadialClusterSimulation(nodes, edges, draggedNode)
```

### New Hook
```typescript
useDeterministicLayout(nodes, edges, options)
```

### Key Differences
1. No `draggedNode` prop needed (handled separately)
2. Returns `isCalculating` flag
3. Positions are final, not continuously updating
4. Can disable relaxation entirely

## Future Enhancements

### Position Caching
```typescript
localStorage.setItem(`layout-${projectId}`, JSON.stringify(positions));
```

### Manual Override
```typescript
// Store user-dragged positions
const [manualPositions, setManualPositions] = useState(new Map());

// Merge with calculated
const finalPositions = useMemo(() => {
  return mergePositions(calculatedPositions, manualPositions);
}, [calculatedPositions, manualPositions]);
```

### DAG Layout for Clusters
For truly DAG-structured projects:
```typescript
// Use Dagre or ELK for left→right flow
import dagre from 'dagre';
const g = new dagre.graphlib.Graph();
// ... configure and layout
```

## Summary

We've replaced:
- ❌ Continuous chaos
- ❌ Unpredictable shaking  
- ❌ Generic physics

With:
- ✅ Intentional positioning
- ✅ Stable results
- ✅ Domain-aware layout
- ✅ Optional polish (then freeze)

**Result:** A graph that looks designed, not simulated.
