# Canvas Renderer Performance Optimization

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve canvas rendering performance for large graphs (303 nodes, 1905 edges) by eliminating per-frame redundant work, reducing allocations, and adding spatial indexing for hit testing.

**Architecture:** Five targeted optimizations in `canvas-scene.ts`: (1) dirty-flag edge metadata caching, (2) numeric bezier path cache keys, (3) aggressive label LOD culling, (4) bounded arc label bitmap cache, (5) quadtree-based hit testing using the existing `spatial-index.ts` module.

**Tech Stack:** Canvas2D, d3-quadtree (already a dependency), TypeScript

---

### Task 1: Edge Metadata Dirty Tracking

**Files:**
- Modify: `src/graph/components/canvas/canvas-scene.ts:180-181` (add dirty tracking fields)
- Modify: `src/graph/components/canvas/canvas-scene.ts:855-866` (conditional recompute)
- Modify: `src/graph/components/canvas/canvas-scene.ts:267-310` (set dirty on data changes)

**Problem:** `precomputeEdgeMeta()` is called every frame (lines 885, 899), rebuilding metadata for all 1905 edges even when nothing changed. Each call does `isCycleEdge()`, `isEdgeHighlighted()`, `isEdgeInActiveChain()` lookups per edge.

**Step 1: Add dirty tracking state**

Add these fields after line 181 (`edgeMetaMap`):

```typescript
// Dirty tracking for edge metadata — only recompute when inputs change
private edgeMetaDirty = true;
private cachedSelectedNode: GraphNode | null = null;
private cachedSelectedCluster: string | null = null;
private cachedShowDirectDeps = false;
private cachedShowTransitiveDeps = false;
private cachedShowDirectDependents = false;
private cachedShowTransitiveDependents = false;
private cachedTransitiveDepsRef: TransitiveResult | undefined = undefined;
private cachedTransitiveDependentsRef: TransitiveResult | undefined = undefined;
```

**Step 2: Add dirty detection in updateCaches**

Add this block at the end of `updateCaches()` (after the zoom color block, ~line 309):

```typescript
// Mark edge metadata dirty when selection/chain inputs change
const edgeInputsChanged =
  positionsChanged ||
  config.selectedNode !== this.cachedSelectedNode ||
  config.selectedCluster !== this.cachedSelectedCluster ||
  config.showDirectDeps !== this.cachedShowDirectDeps ||
  config.showTransitiveDeps !== this.cachedShowTransitiveDeps ||
  config.showDirectDependents !== this.cachedShowDirectDependents ||
  config.showTransitiveDependents !== this.cachedShowTransitiveDependents ||
  config.transitiveDeps !== this.cachedTransitiveDepsRef ||
  config.transitiveDependents !== this.cachedTransitiveDependentsRef;

if (edgeInputsChanged) {
  this.edgeMetaDirty = true;
  this.cachedSelectedNode = config.selectedNode;
  this.cachedSelectedCluster = config.selectedCluster;
  this.cachedShowDirectDeps = config.showDirectDeps;
  this.cachedShowTransitiveDeps = config.showTransitiveDeps;
  this.cachedShowDirectDependents = config.showDirectDependents;
  this.cachedShowTransitiveDependents = config.showTransitiveDependents;
  this.cachedTransitiveDepsRef = config.transitiveDeps;
  this.cachedTransitiveDependentsRef = config.transitiveDependents;
}
```

**Step 3: Make precomputeEdgeMeta conditional**

Replace the body of `precomputeEdgeMeta()` (lines 855-866):

```typescript
private precomputeEdgeMeta(edges: GraphEdge[], isChainActive: boolean): void {
  if (!this.edgeMetaDirty) return;
  this.edgeMetaDirty = false;

  this.edgeMetaMap.clear();
  for (const edge of edges) {
    const key = `${edge.source}->${edge.target}`;
    const isCycle = this.isCycleEdge(edge);
    const isHighlighted = this.isEdgeHighlighted(edge);
    const inChain = isChainActive ? this.isEdgeInActiveChain(key) : false;
    const isSpecial = isCycle || isHighlighted || inChain;
    const endpoints = this.resolveEdgeEndpointsCached(edge);
    this.edgeMetaMap.set(edge, { key, isCycle, isHighlighted, inChain, isSpecial, endpoints });
  }
}
```

**Step 4: Run tests**

```bash
pnpm test:run
```

**Step 5: Commit**

```bash
git add src/graph/components/canvas/canvas-scene.ts
git commit -m "perf: Add dirty tracking for edge metadata to skip redundant per-frame recomputation"
```

---

### Task 2: Bezier Path Cache Key Optimization

**Files:**
- Modify: `src/graph/components/canvas/canvas-scene.ts:1236-1262` (drawEdgePath)

**Problem:** `drawEdgePath()` calls `generateBezierPath()` which creates a string key, then a path string, then the Path2D cache uses that path string as key. This means two string allocations per edge per frame even on cache hit. We can use a numeric key instead.

**Step 1: Replace string-keyed bezier cache with numeric key**

Replace `drawEdgePath()` (lines 1236-1262) with:

```typescript
private drawEdgePath(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  if (distance > 150) {
    // Use rounded integer coords as numeric cache key to avoid string allocation
    const rx1 = Math.round(x1);
    const ry1 = Math.round(y1);
    const rx2 = Math.round(x2);
    const ry2 = Math.round(y2);
    const numericKey = `${rx1},${ry1},${rx2},${ry2}`;

    let path = this.bezierPathCache.get(numericKey);
    if (!path) {
      const pathStr = generateBezierPath(x1, y1, x2, y2);
      path = new Path2D(pathStr);
      if (this.bezierPathCache.size >= CanvasScene.MAX_BEZIER_CACHE_SIZE) {
        const firstKey = this.bezierPathCache.keys().next().value;
        if (firstKey) this.bezierPathCache.delete(firstKey);
      }
      this.bezierPathCache.set(numericKey, path);
    }
    ctx.stroke(path);
  } else {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
```

This avoids calling `generateBezierPath()` just to check the cache — the path string is only generated on cache miss.

**Step 2: Run tests**

```bash
pnpm test:run
```

**Step 3: Commit**

```bash
git add src/graph/components/canvas/canvas-scene.ts
git commit -m "perf: Avoid bezier path string generation on cache hit"
```

---

### Task 3: Aggressive Label LOD Culling

**Files:**
- Modify: `src/graph/components/canvas/canvas-scene.ts:334-354` (drawNodes)
- Modify: `src/graph/components/canvas/canvas-scene.ts:605-642` (drawNodeLabel)

**Problem:** `drawNodeLabel()` is called for every visible node, checks zoom inside, then does 2 text draw ops (strokeText + fillText). At low zoom these are wasted calls. Also, label truncation allocates a new string per frame for long names.

**Step 1: Hoist label LOD check out of per-node loop**

In `drawNodes()` (line 334), add a flag before the loop and pass it through:

```typescript
private drawNodes(ctx: CanvasRenderingContext2D, config: SceneConfig): void {
  const viewport = this.cachedViewport ?? this.computeViewportBounds(config);
  const drawLabels = config.zoom >= LOD_THRESHOLDS.NODE_LABELS;

  for (const node of config.nodes) {
    const pos = resolveNodeWorldPosition(
      node.id,
      node.project || 'External',
      config.layout,
      config.manualNodePositions,
      config.manualClusterPositions,
    );
    if (!pos) continue;

    const size = getNodeSize(node);
    if (!isCircleInViewport({ x: pos.x, y: pos.y }, size * 3, viewport)) continue;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    this.drawNode(ctx, node.id, drawLabels);
    ctx.restore();
  }
}
```

**Step 2: Update drawNode to accept drawLabels param**

Find `drawNode()` method and add the parameter. It should skip `drawNodeLabel()` entirely when `drawLabels` is false. Locate `drawNode()` and add the parameter:

```typescript
private drawNode(ctx: CanvasRenderingContext2D, nodeId: string, drawLabels = true): void {
```

Then wrap the `drawNodeLabel` call inside `drawNode` with:

```typescript
if (drawLabels) {
  this.drawNodeLabel(ctx, node, size, adjustedColor, theme, alpha, isSelected, isConnected, isInChain, isHovered);
}
```

**Step 3: Remove redundant zoom check from drawNodeLabel**

Remove line 617 (`if ((this.config?.zoom ?? 1) < LOD_THRESHOLDS.NODE_LABELS) return;`) since the caller now handles this.

**Step 4: Cache truncated label strings**

Replace the truncation logic in `drawNodeLabel()` (lines 619-622) with a cached version:

```typescript
const labelText =
  node.name.length > 20 && !isHovered && !isConnected
    ? (this.truncatedLabelCache.get(node.id) ??
        (() => {
          const t = `${node.name.substring(0, 20)}...`;
          this.truncatedLabelCache.set(node.id, t);
          return t;
        })())
    : node.name;
```

Add the cache field near the other caches (~line 152):

```typescript
private truncatedLabelCache = new Map<string, string>();
```

Clear it in `updateCaches` when nodes change (inside the `if (nodesChanged)` block):

```typescript
this.truncatedLabelCache.clear();
```

**Step 5: Run tests**

```bash
pnpm test:run
```

**Step 6: Commit**

```bash
git add src/graph/components/canvas/canvas-scene.ts
git commit -m "perf: Skip label rendering entirely at low zoom and cache truncated labels"
```

---

### Task 4: Arc Label Bitmap Cache Cap

**Files:**
- Modify: `src/graph/components/canvas/canvas-scene.ts:155-158` (arcLabelBitmapCache)
- Modify: `src/graph/components/canvas/canvas-scene.ts:766-771` (drawClusterLabel cache insert)

**Problem:** `arcLabelBitmapCache` has no size limit. Each entry is an OffscreenCanvas (GPU memory). Zooming creates new cache entries per zoom level per cluster, growing unbounded.

**Step 1: Add max size constant and eviction**

Add a constant near the existing `MAX_BEZIER_CACHE_SIZE` (line 145):

```typescript
private static readonly MAX_ARC_LABEL_CACHE_SIZE = 200;
```

**Step 2: Add eviction in drawClusterLabel**

Replace the cache insert block (lines 767-771) with:

```typescript
const bitmapKey = `${font}-${displayName}-${Math.round(arcRadius)}-${color}`;
let cached = this.arcLabelBitmapCache.get(bitmapKey);
if (!cached) {
  cached = this.renderArcLabelBitmap(ctx, displayName, arcRadius, font, color);
  if (this.arcLabelBitmapCache.size >= CanvasScene.MAX_ARC_LABEL_CACHE_SIZE) {
    const firstKey = this.arcLabelBitmapCache.keys().next().value;
    if (firstKey) this.arcLabelBitmapCache.delete(firstKey);
  }
  this.arcLabelBitmapCache.set(bitmapKey, cached);
}
```

**Step 3: Run tests**

```bash
pnpm test:run
```

**Step 4: Commit**

```bash
git add src/graph/components/canvas/canvas-scene.ts
git commit -m "perf: Cap arc label bitmap cache at 200 entries to prevent memory leak"
```

---

### Task 5: Quadtree-Based Hit Testing

**Files:**
- Modify: `src/graph/components/canvas/canvas-scene.ts:1467-1496` (hitTestNode)
- Modify: `src/graph/components/canvas/canvas-scene.ts:267-310` (updateCaches - rebuild quadtree)
- Import: `src/graph/utils/spatial-index.ts` (already exists with `buildNodeQuadtree`, `findNodeAt`)

**Problem:** `hitTestNode()` iterates all 303 nodes with `resolveNodeWorldPosition()` + `Math.sqrt()` on every mousemove. The spatial index module already exists but isn't used.

**Step 1: Add quadtree field and import**

Add import at top of file:

```typescript
import { type IndexedNode, buildNodeQuadtree, findNodeAt } from '@graph/utils/spatial-index';
import type { Quadtree } from 'd3-quadtree';
```

Add fields near the other caches (~line 178):

```typescript
// Quadtree spatial index for O(log n) hit testing
private nodeQuadtree: Quadtree<IndexedNode> | null = null;
```

**Step 2: Rebuild quadtree in updateCaches when positions change**

Add this inside the `if (positionsChanged)` block in `updateCaches()` (after line 300):

```typescript
// Rebuild spatial index
this.nodeQuadtree = null; // lazily rebuilt on first hit test
```

**Step 3: Add lazy quadtree builder**

Add a method:

```typescript
private ensureQuadtree(): Quadtree<IndexedNode> | null {
  if (this.nodeQuadtree) return this.nodeQuadtree;
  const config = this.config;
  if (!config) return null;

  const items: IndexedNode[] = [];
  for (const node of config.nodes) {
    const pos = resolveNodeWorldPosition(
      node.id,
      node.project || 'External',
      config.layout,
      config.manualNodePositions,
      config.manualClusterPositions,
    );
    if (!pos) continue;
    items.push({
      x: pos.x,
      y: pos.y,
      node,
      hitRadius: getNodeSize(node) * NODE_HIT_RADIUS_MULTIPLIER,
    });
  }

  this.nodeQuadtree = buildNodeQuadtree(items);
  return this.nodeQuadtree;
}
```

**Step 4: Replace hitTestNode with quadtree lookup**

Replace `hitTestNode()` (lines 1467-1496):

```typescript
private hitTestNode(worldX: number, worldY: number): GraphNode | null {
  const tree = this.ensureQuadtree();
  if (!tree) return null;

  // Search within a generous radius, findNodeAt verifies exact hit
  const maxSearchRadius = 50;
  return findNodeAt(tree, worldX, worldY, maxSearchRadius);
}
```

**Step 5: Run tests**

```bash
pnpm test:run
```

**Step 6: Commit**

```bash
git add src/graph/components/canvas/canvas-scene.ts
git commit -m "perf: Use quadtree spatial index for O(log n) hit testing on mousemove"
```

---

### Task 6: Verify and Measure

**Step 1: Run full test suite**

```bash
pnpm test:run
```

**Step 2: Run biome check**

```bash
pnpm check
```

**Step 3: Verify in browser**

Open `http://localhost:3000/` and check:
- FPS counter during zoom/pan interactions
- Hover tooltip appears correctly
- Node selection works
- Cluster selection works
- Edge highlighting on selection works
- Memory usage doesn't grow during zoom in/out cycles

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "perf: Fix any issues found during verification"
```
