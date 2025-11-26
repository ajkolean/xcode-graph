# Migration Guide: Using New Services

## Quick Start

This guide shows how to migrate existing code to use the new service layer for cleaner, more maintainable code.

---

## 🎯 GraphDataService Migration

### Before (Direct Data Access)

```typescript
// ❌ Old way - accessing data directly
const dependencies = edges.filter(e => e.source === nodeId);
const dependents = edges.filter(e => e.target === nodeId);
const nodeData = nodes.find(n => n.id === nodeId);

// ❌ Manual transitive dependency calculation
const visited = new Set<string>();
const queue = [nodeId];
while (queue.length > 0) {
  const current = queue.shift()!;
  const deps = edges.filter(e => e.source === current);
  // ... more complex logic
}
```

### After (Using Service)

```typescript
// ✅ New way - using service
import { GraphDataService } from './services';

const dataService = new GraphDataService(nodes, edges);

// Simple, readable, efficient
const dependencies = dataService.getOutgoingEdges(nodeId);
const dependents = dataService.getIncomingEdges(nodeId);
const nodeData = dataService.getNodeById(nodeId); // O(1) lookup!

// One line for transitive dependencies
const transitive = dataService.getTransitiveDependencies(nodeId);
// Returns: { nodes: Set<string>, edges: Set<string>, depths: Map<string, number> }
```

---

## 🎨 ColorService Migration

### Before (Scattered Color Logic)

```typescript
// ❌ Old way - imports from multiple files
import { generateColor } from '../utils/colorGenerator';
import { getNodeTypeColor } from '../utils/filterHelpers';
import { PLATFORM_COLOR } from '../utils/platformIcons';
import { adjustColorForZoom } from '../utils/zoomColorUtils';

// ❌ Multiple function calls
const baseColor = generateColor(name, type);
const nodeColor = getNodeTypeColor(type);
const platformColor = PLATFORM_COLOR[platform];
const zoomedColor = adjustColorForZoom(baseColor, zoom);
```

### After (Using Service)

```typescript
// ✅ New way - single import
import { colorService } from './services';

// ✅ Clean, consistent API
const baseColor = colorService.generateColor(name, type);
const nodeColor = colorService.getNodeTypeColor(type);
const platformColor = colorService.getPlatformColor(platform);
const zoomedColor = colorService.adjustColorForZoom(baseColor, zoom);

// ✅ Batch operations
const projectColors = colorService.generateColorMap(projects, 'project');
```

---

## 📦 Constants Migration

### Before (Inline Constants)

```typescript
// ❌ Old way - magic strings everywhere
const TAB_LABELS: Record<string, string> = {
  'overview': 'Overview',
  'builds': 'Builds',
  // ... repeated in multiple files
};

const nodeTypes = new Set(['app', 'framework', 'library', ...]);
const platforms = new Set(['iOS', 'macOS', 'tvOS', ...]);
```

### After (Using Constants)

```typescript
// ✅ New way - centralized, type-safe
import { 
  TAB_LABELS, 
  NODE_TYPES, 
  DEFAULT_NODE_TYPES,
  PLATFORMS,
  DEFAULT_PLATFORMS 
} from './constants';

const label = TAB_LABELS['graph'];
const type = NODE_TYPES.APP; // Autocomplete support!
const nodeTypes = DEFAULT_NODE_TYPES; // Pre-defined sets
```

---

## 🪝 Composition Hooks Migration

### Before (Scattered State)

```typescript
// ❌ Old way - many useState calls
function App() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [zoom, setZoom] = useState(1);
  const [enableAnimation, setEnableAnimation] = useState(false);
  const [previewFilter, setPreviewFilter] = useState(null);
  
  // ... 230 lines of component code
}
```

### After (Using Composition Hooks)

```typescript
// ✅ New way - clean, organized
import { useGraphState, useGraphHandlers } from './hooks';

function App() {
  // Single line for all state
  const graphState = useGraphState();
  
  // Single line for all handlers
  const handlers = useGraphHandlers({
    selectedNode: graphState.selectedNode,
    viewMode: graphState.viewMode,
    setSelectedNode: graphState.setSelectedNode,
    setSelectedCluster: graphState.setSelectedCluster,
    setViewMode: graphState.setViewMode
  });
  
  // Access state easily
  const { selectedNode, zoom, viewMode } = graphState;
  
  // Use handlers
  <button onClick={() => handlers.handleFocusNode(node)}>
    Focus
  </button>
}
```

---

## 📋 Component Refactoring Examples

### Example 1: Node Details Component

#### Before
```typescript
function NodeDetails({ node, edges }) {
  // ❌ Manual calculation
  const deps = edges.filter(e => e.source === node.id);
  const dependents = edges.filter(e => e.target === node.id);
  
  const color = generateColor(node.name, node.type);
  const zoomedColor = adjustColorForZoom(color, zoom);
  
  return <div style={{ color: zoomedColor }}>...</div>;
}
```

#### After
```typescript
import { GraphDataService, colorService } from './services';

function NodeDetails({ node, dataService }) {
  // ✅ Clean service calls
  const deps = dataService.getOutgoingEdges(node.id);
  const dependents = dataService.getIncomingEdges(node.id);
  
  const color = colorService.generateColor(node.name, node.type);
  const zoomedColor = colorService.adjustColorForZoom(color, zoom);
  
  return <div style={{ color: zoomedColor }}>...</div>;
}
```

---

### Example 2: Filter Component

#### Before
```typescript
function FilterPanel({ nodes }) {
  // ❌ Manual counting
  const appCount = nodes.filter(n => n.type === 'app').length;
  const frameworkCount = nodes.filter(n => n.type === 'framework').length;
  
  // ❌ Magic strings
  const types = ['app', 'framework', 'library'];
  
  return (
    <div>
      {types.map(type => (
        <div key={type}>
          {type}: {nodes.filter(n => n.type === type).length}
        </div>
      ))}
    </div>
  );
}
```

#### After
```typescript
import { NODE_TYPES } from './constants';
import { GraphDataService } from './services';

function FilterPanel({ dataService }) {
  // ✅ Type-safe constants
  const types = Object.values(NODE_TYPES);
  
  return (
    <div>
      {types.map(type => {
        // ✅ Clean service call
        const nodes = dataService.getNodesByType(type);
        return (
          <div key={type}>
            {type}: {nodes.length}
          </div>
        );
      })}
    </div>
  );
}
```

---

## 🔄 Step-by-Step Migration Process

### Step 1: Create Service Instances

```typescript
// In your main App component or data provider
import { GraphDataService } from './services';
import { mockGraphData } from './data/mockGraphData';

function App() {
  // Create service instance
  const dataService = useMemo(
    () => new GraphDataService(mockGraphData.nodes, mockGraphData.edges),
    []
  );
  
  // Pass to child components via props or context
  return (
    <GraphProvider dataService={dataService}>
      <YourComponents />
    </GraphProvider>
  );
}
```

### Step 2: Replace Direct Data Access

Find and replace patterns:

#### Pattern 1: Node Lookups
```typescript
// ❌ Before
const node = nodes.find(n => n.id === nodeId);

// ✅ After
const node = dataService.getNodeById(nodeId);
```

#### Pattern 2: Filtering
```typescript
// ❌ Before
const appNodes = nodes.filter(n => n.type === 'app');

// ✅ After
const appNodes = dataService.getNodesByType('app');
```

#### Pattern 3: Edge Queries
```typescript
// ❌ Before
const outgoing = edges.filter(e => e.source === nodeId);

// ✅ After
const outgoing = dataService.getOutgoingEdges(nodeId);
```

### Step 3: Update Color Usage

```typescript
// ❌ Before
import { generateColor } from '../utils/colorGenerator';
import { getNodeTypeColor } from '../utils/filterHelpers';

// ✅ After
import { colorService } from './services';

const color = colorService.generateColor(name, type);
const typeColor = colorService.getNodeTypeColor(type);
```

### Step 4: Use Constants

```typescript
// ❌ Before
if (node.type === 'app') { ... }

// ✅ After
import { NODE_TYPES } from './constants';
if (node.type === NODE_TYPES.APP) { ... }
```

---

## 🎓 Advanced Patterns

### Pattern 1: Service Context

Create a context for easy service access:

```typescript
// contexts/GraphContext.tsx
import { createContext, useContext } from 'react';
import { GraphDataService } from '../services';

const GraphContext = createContext<GraphDataService | null>(null);

export function useGraphData() {
  const service = useContext(GraphContext);
  if (!service) throw new Error('useGraphData must be used within GraphProvider');
  return service;
}

export function GraphProvider({ children, nodes, edges }) {
  const service = useMemo(
    () => new GraphDataService(nodes, edges),
    [nodes, edges]
  );
  
  return (
    <GraphContext.Provider value={service}>
      {children}
    </GraphContext.Provider>
  );
}
```

Usage:
```typescript
function MyComponent() {
  const dataService = useGraphData();
  const node = dataService.getNodeById('my-id');
  return <div>{node.name}</div>;
}
```

---

### Pattern 2: Custom Hook with Service

```typescript
// hooks/useNodeDetails.ts
import { useGraphData } from '../contexts/GraphContext';

export function useNodeDetails(nodeId: string) {
  const dataService = useGraphData();
  
  const node = dataService.getNodeById(nodeId);
  const dependencies = dataService.getDirectDependencies(nodeId);
  const dependents = dataService.getDirectDependents(nodeId);
  const stats = dataService.getNodeStats(nodeId);
  
  return {
    node,
    dependencies,
    dependents,
    stats
  };
}
```

Usage:
```typescript
function NodeCard({ nodeId }) {
  const { node, dependencies, dependents, stats } = useNodeDetails(nodeId);
  
  return (
    <div>
      <h2>{node.name}</h2>
      <p>Dependencies: {stats.dependencies}</p>
      <p>Dependents: {stats.dependents}</p>
    </div>
  );
}
```

---

## 📊 Performance Benefits

### Before
```typescript
// ❌ O(n) lookups every time
nodes.find(n => n.id === id) // Searches entire array
edges.filter(e => e.source === id) // Searches entire array
```

### After
```typescript
// ✅ O(1) lookups with Map
dataService.getNodeById(id) // Instant lookup
dataService.getOutgoingEdges(id) // Efficient filtering
```

### Caching Benefits

```typescript
// Color service caches generated colors
const color1 = colorService.generateColor('MyProject', 'project');
const color2 = colorService.generateColor('MyProject', 'project');
// color1 === color2 (same instance, no recomputation)
```

---

## ✅ Migration Checklist

- [ ] Create GraphDataService instance in App.tsx
- [ ] Replace `nodes.find()` with `dataService.getNodeById()`
- [ ] Replace `nodes.filter()` with appropriate service method
- [ ] Replace `edges.filter()` with `getOutgoingEdges()` or `getIncomingEdges()`
- [ ] Update color imports to use `colorService`
- [ ] Replace magic strings with constants from `/constants`
- [ ] Consider using `useGraphState()` in App.tsx
- [ ] Consider using `useGraphHandlers()` for event handlers
- [ ] Add service context for easy access across components
- [ ] Test all functionality after migration
- [ ] Remove old utility imports that are now in services
- [ ] Update tests to mock services instead of utils

---

## 🚨 Common Pitfalls

### Pitfall 1: Forgetting to Create Service Instance
```typescript
// ❌ Wrong - no instance
import { GraphDataService } from './services';
const node = GraphDataService.getNodeById(id); // Error!

// ✅ Correct - create instance
const service = new GraphDataService(nodes, edges);
const node = service.getNodeById(id);
```

### Pitfall 2: Creating Multiple Service Instances
```typescript
// ❌ Wrong - creates new instance every render
function Component() {
  const service = new GraphDataService(nodes, edges);
  // ...
}

// ✅ Correct - memoize or use context
function Component() {
  const service = useMemo(
    () => new GraphDataService(nodes, edges),
    [nodes, edges]
  );
  // ...
}
```

### Pitfall 3: Not Updating Service When Data Changes
```typescript
// ❌ Wrong - service still has old data
const [nodes, setNodes] = useState(initialNodes);
const service = useMemo(() => new GraphDataService(nodes, edges), []); // Empty deps!

// ✅ Correct - recreate when data changes
const service = useMemo(
  () => new GraphDataService(nodes, edges),
  [nodes, edges]
);
```

---

## 🎉 Benefits Summary

**Code Quality:**
- ✅ Cleaner, more readable code
- ✅ Consistent API across codebase
- ✅ Type-safe operations
- ✅ Better error handling

**Performance:**
- ✅ O(1) lookups instead of O(n)
- ✅ Automatic caching
- ✅ Reduced redundant calculations
- ✅ Efficient batch operations

**Maintainability:**
- ✅ Single source of truth
- ✅ Easy to update logic
- ✅ Simple to test
- ✅ Clear dependencies

**Developer Experience:**
- ✅ Better autocomplete
- ✅ Clear documentation
- ✅ Consistent patterns
- ✅ Easier onboarding

---

## 📚 Additional Resources

- See `/REFACTORING_COMPLETE.md` for full implementation details
- See `/REFACTORING_OPPORTUNITIES.md` for original analysis
- See `/services/graphDataService.ts` for complete API
- See `/services/colorService.ts` for color utilities
- See `/constants/` for all available constants

**Happy Refactoring! 🚀**
