# Elastic Shell Boundaries

## Overview

Each project cluster is surrounded by a **flexible elastic membrane** (the boundary circle) that automatically finds the optimal radius. The shell tries to stay small (compression) while nodes inside push outward (expansion) based on their mass and position.

**Result**: Tight clusters when nodes are few, expanded clusters for high-mass systems. No empty voids, no cramped overlaps.

## The Metaphor

```
Before Equilibrium (shell too tight):

           o   o
       o    ●      o      ← Targets pushing outward
          o     o

        .-------------.
       /    cluster    \    ← Shell compressing inward
      /     boundary    \
      '-----------------'


After Equilibrium (balanced):

             o     o
         o       ●      o     ← Balanced forces
             o         o

           .---------------------.
         /      elastic shell      \
        /         radius R          \
        '---------------------------'
        
Tight but not cramped. Symmetric. Natural.
```

## Why Elastic Shell vs. Alternatives

### ❌ Fixed Size
```typescript
radius = 250; // Always the same
```
**Problem**: Creates huge empty spaces in small clusters, cramped overlaps in large clusters.

### ❌ Simple MEC (Minimum Enclosing Circle)
```typescript
radius = max(distanceToNode) + padding;
```
**Problem**: Rigid. Doesn't account for mass or density. Treats all nodes equally.

### ✅ Elastic Shell
```typescript
radius = equilibrium between:
  - Inward compression (shell wants to shrink)
  - Outward pressure (nodes push based on mass)
```
**Benefit**: Self-adjusting. Dense clusters stay tight. High-mass clusters expand. Reflects architecture naturally.

## The Forces

### 1. Outward Pressure (Nodes → Shell)

Each node pushes outward with force proportional to:

```typescript
pressure = (mass × ringFactor) / (distance²)
```

**Components**:
- **Mass**: Heavier nodes push harder (fan-in × 3 + fan-out + depth + centrality)
- **Ring Factor**: `1 + (ring × 0.3)` — Outer rings push more
- **Distance²**: Inverse square law (like gravity!)

**Example**:
```
Node: CoreFramework
  mass: 42.4 (high fan-in, deep in hierarchy)
  ring: 1
  distance: 80px from center

ringFactor = 1 + (1 × 0.3) = 1.3
pressure = (42.4 × 1.3) / (80²)
         = 55.12 / 6400
         = 0.0086 units
```

A heavy node close to the center pushes hard!

### 2. Inward Compression (Shell → Nodes)

The shell resists expansion:

```typescript
compression = (currentRadius - idealRadius) × compressionFactor
```

**Components**:
- **Ideal Radius**: Initial guess based on ring count (`baseRadius + maxRing × ringSpacing`)
- **Compression Factor**: `0.08` (tunable stiffness)
- **Delta**: How far the shell has stretched

**Example**:
```
idealRadius = 180 + (2 × 65) = 310px
currentRadius = 350px (stretched)
compressionFactor = 0.08

compression = (350 - 310) × 0.08
            = 40 × 0.08
            = 3.2 units
```

The shell is stretched 40px, so it pulls inward with force 3.2.

### 3. Equilibrium

Radius adjusts each iteration:

```typescript
netForce = totalOutwardPressure - inwardCompression
radius += netForce × alpha  // alpha = damping factor (0.12)
```

**Convergence**:
- If `netForce > 0`: Shell expands
- If `netForce < 0`: Shell contracts
- If `|netForce| < 0.5`: Equilibrium reached → stop

## Implementation

### File: `/utils/elasticShell.ts`

#### Main Function

```typescript
export function computeElasticShellRadius(
  nodes: NodeWithPosition[],
  masses: Map<string, NodeMass>,
  config: ElasticShellConfig = DEFAULT_CONFIG
): number
```

**Process**:
1. Initial guess: `radius = baseRadius + maxRing × ringSpacing`
2. Iterate 20 times:
   - Compute outward pressure from all nodes
   - Compute inward compression from shell
   - Adjust radius: `radius += (outward - compression) × alpha`
   - Check convergence: `|netForce| < 0.5` → break
3. Add padding: `radius += 40`
4. Clamp to bounds: `[minRadius, maxRadius]`

#### Configuration

```typescript
interface ElasticShellConfig {
  baseRadius: 180;         // Starting point
  compressionFactor: 0.08; // Shell stiffness
  alpha: 0.12;             // Damping (convergence speed)
  iterations: 20;          // Max relaxation steps
  minRadius: 120;          // Floor
  maxRadius: 500;          // Ceiling
}
```

**Tuning Guide**:
- ↑ `compressionFactor` → Tighter clusters
- ↓ `compressionFactor` → Looser clusters
- ↑ `alpha` → Faster convergence (may overshoot)
- ↓ `alpha` → Slower convergence (more stable)

### Integration: `/utils/simpleClusterLayout.ts`

```typescript
export function computeMEC(
  positions: NodeCartesian[],
  centerX: number,
  centerY: number,
  masses?: Map<string, NodeMass>
): number {
  // If masses provided, use elastic shell
  if (masses && masses.size > 0) {
    return computeElasticShellRadius(nodesWithPos, masses);
  }
  
  // Fallback: simple MEC
  return maxDistance + padding;
}
```

### Integration: `/utils/hierarchicalLayout.ts`

```typescript
// Compute masses for nodes in cluster
const masses = computeNodeMasses(clusterNodes, internalEdges);

// Compute MEC using elastic shell
const mecRadius = computeMEC(positions, centerX, centerY, masses);
const clusterDimension = Math.max(300, mecRadius * 2 + 80);
```

## Visual Examples

### Example 1: Simple App (Few Nodes, Low Mass)

```
Nodes:
  - MyApp (mass: 5)
  - StringUtils (mass: 8)
  - DateUtils (mass: 7)

Total outward pressure: ~0.12 units
Inward compression: ~2.8 units (shell wants to shrink)

Result: radius = 140px (tight)

       o
    o  ●  o     ← Compact cluster
       
    .-------.
   /   small  \
   \  cluster /
    '---------'
```

### Example 2: Core Framework (Many Nodes, High Mass)

```
Nodes:
  - CoreFramework (mass: 42, anchor)
  - NetworkKit (mass: 25)
  - DatabaseKit (mass: 28)
  - UIKit (mass: 22)
  - LoggingKit (mass: 15)
  - StringUtils (mass: 8)
  - DateUtils (mass: 7)
  - + 8 more nodes

Total outward pressure: ~0.85 units
Inward compression: ~1.2 units

Result: radius = 380px (expanded)

          o     o
      o           o
    o      ●        o    ← High-mass anchor pushes hard
      o         o
          o     o
            o

      .-------------------.
     /    large cluster    \
    /      reflects busy    \
    \      architecture     /
     '-------------------'
```

### Example 3: Monorepo Package (Medium Density)

```
Nodes:
  - core-platform (mass: 35, anchor)
  - feature-auth (mass: 18)
  - feature-payments (mass: 16)
  - utils (mass: 10)

Total outward pressure: ~0.35 units
Inward compression: ~1.8 units

Result: radius = 240px (medium)

        o
     o  ●  o     ← Balanced
        o

      .----------.
     /  medium    \
    / complexity  \
     '----------'
```

## Benefits

### 1. Visual Density Reflects Complexity

```
Big cluster = Busy project (many nodes, high mass)
Small cluster = Simple project (few nodes, low mass)
```

The visual size **encodes architectural information**.

### 2. No Empty Voids

Unlike fixed-size clusters, the shell contracts when possible:

```
Fixed 400px:          Elastic Shell:
.-------------.       .-------.
|             |       |  o●o  |  ← Tight, no wasted space
|    o●o      |       '-------'
|             |
'-------------'
  ↑ Empty space
```

### 3. No Cramped Overlaps

The shell expands when nodes push outward:

```
Fixed 200px:        Elastic Shell:
.-------.           .-----------.
| o o o |           |  o   o   o |  ← Comfortable spacing
| o●o o |           |  o   ●   o |
| o o o |           |  o   o   o |
'-------'           '-----------'
  ↑ Overlaps
```

### 4. Mass-Aware Sizing

High-mass clusters naturally get more space:

```
Low Mass (total: 20):   High Mass (total: 150):
   .-----.                  .-------------.
   | o●o |                  |  o   o   o   |
   '-----'                  |  o   ●   o   |  ← More room for
  radius: 150px             |  o   o   o   |     important nodes
                            '-------------'
                            radius: 380px
```

### 5. Stable Across Refactors

As dependencies change, the shell adapts naturally:

```
Before (add dependency):
CoreKit depends on NetworkKit
mass(CoreKit) = 40
radius = 280px

After (add dependency):
CoreKit now depends on DatabaseKit too
mass(CoreKit) = 42 (slightly higher)
radius = 285px (slightly larger)
```

## Performance

### Time Complexity

```
N = nodes in cluster
I = iterations (typically 20)

Per iteration:
  - Compute outward pressure: O(N)
  - Compute compression: O(1)
  - Update radius: O(1)

Total: O(N × I) = O(20N) = O(N)
```

**Acceptable**: Linear in cluster size, typically 5-20 nodes per cluster.

### Space Complexity

```
O(N) for node positions and masses
```

### Convergence

Typically converges in **5-15 iterations**:

```
Iteration 0: netForce = 8.2  → radius += 0.98
Iteration 1: netForce = 4.1  → radius += 0.49
Iteration 2: netForce = 1.8  → radius += 0.22
Iteration 3: netForce = 0.7  → radius += 0.08
Iteration 4: netForce = 0.3  ✓ Converged!
```

Early exit saves computation.

## Tuning the Forces

### Make Clusters Tighter

```typescript
config.compressionFactor = 0.15; // Default: 0.08
// Shell pulls inward more aggressively
```

Result: Smaller, denser clusters.

### Make Clusters Looser

```typescript
config.compressionFactor = 0.04;
// Shell is more flexible
```

Result: Larger, airier clusters.

### Faster Convergence

```typescript
config.alpha = 0.2; // Default: 0.12
// Bigger steps per iteration
```

**Warning**: May overshoot and oscillate. Use with care.

### Slower Convergence

```typescript
config.alpha = 0.08;
config.iterations = 30;
// Smaller steps, more iterations
```

Result: Smoother convergence, no overshoot.

## Alternative Approaches (Included)

### Mass-Weighted Shell

```typescript
export function computeMassWeightedShellRadius(
  nodes: NodeWithPosition[],
  masses: Map<string, NodeMass>
): number
```

**Approach**: Base on MEC, then expand proportionally to total mass.

**Formula**:
```typescript
radius = maxDistance + log(1 + totalMass) × 15 + padding
```

**Use case**: When you want a simpler, non-iterative approach.

### Adaptive Density Shell

```typescript
export function computeAdaptiveShellRadius(
  nodes: NodeWithPosition[],
  masses: Map<string, NodeMass>
): number
```

**Approach**: Maintain target density (mass / area).

**Formula**:
```typescript
targetArea = totalMass / targetDensity
radius = sqrt(targetArea / π)
```

**Use case**: When you want consistent visual density across all clusters.

## Design System Compliance

All cluster boundaries rendered with CSS variables:

```css
/* Cluster circle stroke */
stroke: rgba(111, 44, 255, 0.2); /* --color-primary with opacity */
strokeWidth: 1px;
fill: none;

/* Cluster label */
font-family: 'Inter', sans-serif;
font-size: var(--text-label);
color: rgba(232, 234, 237, 0.6);
```

Typography:
- **Headings**: `'DM Sans'` (h1, h2)
- **Body**: `'Inter'` (labels, tooltips)

## Debug Mode

```typescript
export function computeElasticShellWithDebug(
  nodes: NodeWithPosition[],
  masses: Map<string, NodeMass>
): ShellDebugInfo
```

Returns:
```typescript
{
  radius: 285,
  outwardPressure: 0.65,
  inwardCompression: 1.2,
  netForce: -0.55,
  iterations: 20,
  converged: true
}
```

**Use case**: Debugging, visualization, understanding force balance.

## Summary

**Elastic Shell = Self-Adjusting Boundary**

The cluster boundary is a flexible membrane that finds equilibrium between:
- ✅ Inward compression (shell wants to stay small)
- ✅ Outward pressure (nodes push based on mass)

**Result**:
- Tight when nodes are few
- Expanded when mass is high
- No empty voids
- No cramped overlaps
- Visual size encodes architectural complexity

**The geometry breathes with the architecture.**
