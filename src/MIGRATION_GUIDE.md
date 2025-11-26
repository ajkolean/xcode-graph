# Migration Guide: Force Simulation → Deterministic Layout

## Why Migrate?

### Problems with Old Approach (Continuous Force Simulation)
- ❌ **Shaking nodes** - Never truly stable
- ❌ **Snap-in effect** - Nodes appeared wrong, then corrected
- ❌ **Unpredictable** - Same data, different layouts
- ❌ **Performance** - 60 FPS force calculations forever
- ❌ **Hard to debug** - Black box physics

### Benefits of New Approach (Deterministic + Short Relaxation)
- ✅ **Rock solid** - Positions calculated once, frozen
- ✅ **Instant correct** - No snap-in effect
- ✅ **Predictable** - Same input = same output
- ✅ **Fast** - Calculate once (~500ms), then zero CPU
- ✅ **Clear algorithm** - Boring geometry you can debug

## Changes at a Glance

| Aspect | Old (Force Sim) | New (Deterministic) |
|--------|-----------------|---------------------|
| **Hook** | `useRadialClusterSimulation` | `useDeterministicLayout` |
| **Calculation** | Every frame (infinite) | Once, then freeze |
| **Stability** | Shaky | Rock solid |
| **Duration** | Never ends | ~500ms then done |
| **CPU Usage** | Continuous | Burst then idle |
| **Predictability** | Random jitter | Deterministic |

## Step-by-Step Migration

### 1. Update GraphVisualization Import

**Before:**
```typescript
import { useRadialClusterSimulation } from './graph/useRadialClusterSimulation';
```

**After:**
```typescript
import { useDeterministicLayout } from './graph/useDeterministicLayout';
```

### 2. Update Hook Usage

**Before:**
```typescript
const { nodePositions, clusterPositions, clusters, setNodePositions } = 
  useRadialClusterSimulation({
    nodes,
    edges,
    draggedNode
  });
```

**After:**
```typescript
const { nodePositions, clusterPositions, clusters, isCalculating } = 
  useDeterministicLayout(nodes, edges, {
    enableRelaxation: true,
    relaxationIterations: 30
  });
```

### 3. Handle Manual Node Dragging

The old hook had `setNodePositions` for dragging. The new approach needs separate state.

**Add manual position state:**
```typescript
const [manualNodePositions, setManualNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());

// Merge manual with calculated
const finalNodePositions = useMemo(() => {
  const merged = new Map(nodePositions);
  manualNodePositions.forEach((pos, id) => {
    const nodePos = merged.get(id);
    if (nodePos) {
      nodePos.x = pos.x;
      nodePos.y = pos.y;
    }
  });
  return merged;
}, [nodePositions, manualNodePositions]);
```

**Update drag handler:**
```typescript
// Old way
setNodePositions(prev => {
  const next = new Map(prev);
  const nodePos = next.get(draggedNode);
  if (nodePos) {
    nodePos.x = x;
    nodePos.y = y;
  }
  return next;
});

// New way
setManualNodePositions(prev => {
  const next = new Map(prev);
  next.set(draggedNode, { x, y });
  return next;
});
```

### 4. Update Position References

Replace all references to `nodePositions` with `finalNodePositions` in your render code.

**Before:**
```typescript
const pos = nodePositions.get(node.id);
```

**After:**
```typescript
const pos = finalNodePositions.get(node.id);
```

### 5. Optional: Add Loading State

The new hook provides `isCalculating` flag:

```typescript
{isCalculating && (
  <div className="absolute top-4 right-4 px-3 py-2 bg-zinc-900 rounded">
    Calculating layout...
  </div>
)}
```

## Configuration Options

### Default Configuration
```typescript
useDeterministicLayout(nodes, edges, {
  enableRelaxation: true,
  relaxationIterations: 30
});
```

### No Relaxation (Pure Deterministic)
```typescript
useDeterministicLayout(nodes, edges, {
  enableRelaxation: false
});
```

Positions will be perfectly geometric with no smoothing.

### More Relaxation (Smoother)
```typescript
useDeterministicLayout(nodes, edges, {
  enableRelaxation: true,
  relaxationIterations: 50
});
```

Takes longer but results in smoother positioning.

### Custom Layout Config
```typescript
useDeterministicLayout(nodes, edges, {
  enableRelaxation: true,
  relaxationIterations: 30,
  config: {
    layerSpacing: 150,        // More space between rings
    minNodeSpacing: 80,        // More space between nodes
    testOrbitRadius: 50,       // Tests further from subjects
    anchorNodeSize: 12,
    normalNodeSize: 8,
    testNodeSize: 6
  }
});
```

## Testing After Migration

### 1. Visual Stability Test
- Load the graph
- Wait 5 seconds
- **Expected:** Nodes should not move at all
- **Old behavior:** Nodes would continuously jitter

### 2. Consistency Test
- Reload the page multiple times
- **Expected:** Exact same layout every time
- **Old behavior:** Slightly different positions

### 3. Performance Test
- Open browser DevTools
- Check CPU usage after layout completes
- **Expected:** Near 0% when not interacting
- **Old behavior:** Continuous 5-10% for simulation

### 4. Snap-in Test
- Watch the initial load carefully
- **Expected:** Nodes appear in correct positions immediately
- **Old behavior:** Nodes appear outside clusters, then snap in

## Rollback Plan

If you need to revert temporarily:

1. Change import back to `useRadialClusterSimulation`
2. Restore old hook usage
3. Remove manual position state
4. The old hook is still available (marked deprecated but functional)

## Common Issues & Solutions

### Issue: Nodes Overlap
**Solution:** Increase relaxation iterations or adjust collision strength
```typescript
{
  enableRelaxation: true,
  relaxationIterations: 50  // Increased from 30
}
```

### Issue: Layout Feels Too Rigid
**Solution:** Enable relaxation if disabled
```typescript
{
  enableRelaxation: true  // Was false
}
```

### Issue: Calculation Too Slow
**Solution:** Reduce relaxation iterations
```typescript
{
  relaxationIterations: 20  // Reduced from 30
}
```

### Issue: Test Nodes Not Near Subjects
**Check:** Test subject metadata is correct
```typescript
// In cluster metadata
testSubjects: ['FrameworkTarget']
```

## Performance Comparison

### Before (Force Simulation)
```
Initial load: 200ms
Continuous: 60 FPS @ 8-15% CPU
Per frame: Force calculations for all nodes
Total CPU: Continuous drain
```

### After (Deterministic)
```
Initial load: 500ms (deterministic + 30 iterations)
Continuous: 0% CPU (frozen)
Per frame: 0 calculations (static positions)
Total CPU: Burst then idle
```

**Net result:** 500ms one-time cost for permanent stability

## Design System Compliance

Both old and new approaches use the same CSS custom properties:
- Colors: `var(--color-*)`
- Spacing: `var(--space-*)`
- Typography: DM Sans (headings), Inter (body)

No visual changes to the UI, only to layout stability.

## Next Steps After Migration

1. ✅ Test thoroughly with your actual project data
2. ✅ Adjust spacing/sizing config to your preference
3. ✅ Consider adding position caching (localStorage)
4. ✅ Add manual cluster arrangement if needed
5. ✅ Remove old `useRadialClusterSimulation` references

## Support

- See `/LAYOUT_STRATEGY.md` for algorithm details
- See `/MODULE_MAP.md` for file locations
- See `/ARCHITECTURE.md` for system overview

## Summary

The migration is straightforward:
1. Swap the hook
2. Add manual position state
3. Update references
4. Test

You'll immediately get:
- Rock-solid stability
- Predictable layouts
- Better performance
- Easier debugging

No more "shiny chaos simulator" – just intentional, stable graph layouts that reflect your architecture.
