# Performance Monitoring Tools

## Active Monitoring

When running `pnpm dev`, you'll see:

### 1. FPS Counter (top-left corner)

- **Green**: 60 FPS (smooth)
- **Yellow**: 30-60 FPS (acceptable)
- **Red**: <30 FPS (slow - needs optimization)

### 2. Console Logs

**Web Vitals** (on page load):

```
[Web Vitals] LCP: { value: 1234, rating: 'good' }
[Web Vitals] INP: { value: 48, rating: 'good' }
[Web Vitals] CLS: { value: 0.02, rating: 'good' }
```

**Component Re-renders** (frequent updates):

```
[Lit Performance] GraphEdges rendered 15 times (42ms since last)
  changed: ["hoveredNode"]
  frequency: 24/sec
```

### 3. Debug Commands

In browser console:

```js
// Show component render stats
window.__logLitPerf__();
// Output:
// [Lit Performance Stats]
//   GraphEdges: { renders: 245, topChanges: ["hoveredNode: 180", "edges: 12"] }
//   ClusterGroup: { renders: 89, topChanges: ["isClusterHovered: 45"] }

// Performance logging (saves to localStorage + download)
window.__perfLog__.report(); // Print session report
window.__perfLog__.download(); // Download JSON log file
window.__perfLog__.current(); // Get current session object
window.__perfLog__.load(); // Load last session from localStorage
```

### 4. Performance Log Files

Downloaded logs include:

- **Session metadata**: sessionId, graph size, user agent
- **FPS samples**: logged every second
- **Web vitals**: LCP, INP, CLS, FCP, TTFB
- **Component renders**: which components re-render frequently
- **Interaction events**: user interactions and timing

Example log structure:

```json
{
  "sessionId": "session-1702234567890",
  "startTime": 1702234567890,
  "graphSize": { "nodes": 261, "edges": 1121 },
  "entries": [
    { "timestamp": 1234, "type": "fps", "data": { "fps": 58 } },
    {
      "timestamp": 1456,
      "type": "web-vital",
      "data": { "name": "LCP", "value": 234, "rating": "good" }
    },
    {
      "timestamp": 2345,
      "type": "component-render",
      "data": { "component": "GraphEdges", "frequencyPerSec": 24 }
    }
  ]
}
```

## Performance Optimizations Applied

### ✅ Hover Throttling (`graph.actions.ts`)

- RAF-based batching limits hover updates to 60fps max
- Prevents signal thrashing on rapid mouse movement

### ✅ Keyed Rendering (`repeat()` directive)

- Only changed edges/nodes update in DOM
- Stable keys prevent full re-render

### ✅ Node Map Pre-computation

- Changed `nodes.find()` (O(n)) → `nodeMap.get()` (O(1))
- Eliminates 2244 O(n) operations per render

## Target Performance

**Real Tuist Graph:**

- 261 nodes
- 1121 edges

**Expected:**

- FPS: 55-60 (smooth)
- Hover lag: <20ms
- Re-renders: Only on actual state change

## Note on `why-did-you-render`

⚠️ This is a React-specific library and **won't work with Lit components**.

Use `lit-performance-tracker.ts` instead - it provides similar functionality:

- Tracks component re-renders
- Logs which properties changed
- Identifies frequent update patterns
