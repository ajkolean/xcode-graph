# Modular Architecture Guide

## Overview

The codebase follows a **highly modular architecture** with small, focused files that each have a single responsibility. This makes the code easier to understand, test, and maintain.

## Design Principles

### 1. **Single Responsibility**
Each file/component does ONE thing well:
- ✅ `GraphControls.tsx` - Only renders zoom/stats overlay
- ✅ `collisionForces.ts` - Only handles collision physics
- ✅ `nodeCategories.ts` - Only categorizes nodes

### 2. **Small File Size**
Target: **30-100 lines per file** (excluding comments)
- If a file exceeds ~150 lines, consider splitting it
- Extract reusable logic into utilities
- Extract UI into sub-components

### 3. **Clear Dependencies**
- Imports at top show exactly what each file needs
- No circular dependencies
- Domain-specific modules grouped in folders

### 4. **Design System Compliance**
- All styling uses CSS custom properties from `/styles/globals.css`
- Typography: **DM Sans** (headings), **Inter** (body)
- Colors, spacing, borders all use `var(--*)` variables

## File Organization

### Component Structure

```
/components/
├── GraphVisualization.tsx          ← Main orchestrator (160 lines)
├── /graph/
│   ├── useGraphInteraction.ts     ← Pan/zoom/drag hook (90 lines)
│   ├── GraphSVGDefs.tsx           ← SVG filters/markers (50 lines)
│   ├── GraphEdges.tsx             ← Edge rendering (80 lines)
│   ├── GraphOverlays.tsx          ← UI overlays (85 lines)
│   ├── ClusterGroup.tsx           ← Cluster rendering (115 lines)
│   ├── ClusterCard.tsx            ← Cluster card visual
│   ├── GraphNode.tsx              ← Node visual
│   └── GraphEdge.tsx              ← Edge visual
```

**Before:** GraphVisualization was **408 lines** 😱  
**After:** Split into **7 focused modules** of 50-160 lines each ✅

### Layout Utilities Structure

```
/utils/layout/
├── deterministicClusterLayout.ts  ← Cluster positioning
├── deterministicNodeLayout.ts     ← Node positioning (now 155 lines)
├── layoutRelaxation.ts            ← Relaxation orchestrator (130 lines)
├── nodeCategories.ts              ← Node categorization (70 lines)
├── ringCalculations.ts            ← Ring math (50 lines)
├── angleSectors.ts                ← Angular positioning (75 lines)
└── /forces/
    ├── collisionForces.ts         ← Collision physics (85 lines)
    ├── linkForces.ts              ← Link attraction (50 lines)
    └── boundaryForces.ts          ← Boundary constraints (25 lines)
```

**Before:** `deterministicNodeLayout.ts` was **230 lines** with internal functions  
**After:** Split into **6 focused modules** of 25-85 lines each ✅

## Module Categories

### 1. **Custom Hooks** (`use*.ts`)
Encapsulate reusable stateful logic.

**Example: `useGraphInteraction.ts`**
```typescript
export function useGraphInteraction({
  svgRef,
  zoom,
  finalNodePositions,
  clusterPositions
}) {
  const [pan, setPan] = useState({ x: 400, y: 300 });
  const [isDragging, setIsDragging] = useState(false);
  // ... handlers
  return { pan, isDragging, handleMouseDown, ... };
}
```

**Benefits:**
- ✅ Reusable across components
- ✅ Testable in isolation
- ✅ Clear input/output contract

### 2. **Pure Utilities** (`*.ts`)
Stateless functions with no side effects.

**Example: `ringCalculations.ts`**
```typescript
export function calculateRingRadius(
  layer: number,
  nodeCount: number,
  config: ClusterLayoutConfig
): number {
  const baseRadius = config.layerSpacing * layer;
  const minRadius = (nodeCount * config.minNodeSpacing) / (2 * Math.PI);
  return Math.max(baseRadius, minRadius);
}
```

**Benefits:**
- ✅ Easy to test (pure function)
- ✅ No hidden dependencies
- ✅ Predictable behavior

### 3. **Presentational Components** (`*.tsx`)
Pure UI components with no business logic.

**Example: `GraphControls.tsx`**
```typescript
export function GraphControls({ zoom, nodeCount, edgeCount }) {
  return (
    <div style={{ /* design system vars */ }}>
      {Math.round(zoom * 100)}% · {nodeCount} nodes · {edgeCount} edges
    </div>
  );
}
```

**Benefits:**
- ✅ Easy to style/modify
- ✅ No logic to debug
- ✅ Composable

### 4. **Container Components** (`*.tsx`)
Orchestrate child components, handle state/logic.

**Example: `GraphVisualization.tsx`**
```typescript
export function GraphVisualization({ nodes, edges, ... }) {
  // Use hooks for logic
  const { nodePositions, ... } = useDeterministicLayout(nodes, edges);
  const { pan, handleMouseDown, ... } = useGraphInteraction({ ... });
  
  // Render presentational components
  return (
    <div>
      <GraphBackground />
      <svg>
        <GraphSVGDefs />
        <GraphEdges ... />
        {clusters.map(cluster => <ClusterGroup ... />)}
      </svg>
      <GraphControls ... />
    </div>
  );
}
```

**Benefits:**
- ✅ Clear separation: logic vs UI
- ✅ Easy to understand flow
- ✅ Composable architecture

## When to Extract

### ✅ Extract to Custom Hook When:
- [ ] Logic is reused in multiple components
- [ ] Component has complex stateful interactions
- [ ] You want to test logic separately from UI

### ✅ Extract to Utility Function When:
- [ ] Function is pure (no side effects)
- [ ] Logic is used multiple places
- [ ] Function has clear input/output

### ✅ Extract to Component When:
- [ ] UI block appears multiple times
- [ ] Component file exceeds ~150 lines
- [ ] A section of JSX has clear purpose (controls, header, card)

### ✅ Extract to Subdirectory When:
- [ ] You have 5+ related utilities
- [ ] Domain logic is complex (e.g., `forces/`)
- [ ] Need to organize by feature

## Example Refactoring

### Before: Monolithic Component
```typescript
// GraphVisualization.tsx (408 lines)
export function GraphVisualization({ ... }) {
  // 50 lines of state
  const [pan, setPan] = useState(...);
  const [isDragging, setIsDragging] = useState(...);
  // ... 10 more state variables
  
  // 100 lines of handlers
  const handleMouseDown = (e) => { ... };
  const handleMouseMove = (e) => { ... };
  // ... 8 more handlers
  
  // 250 lines of JSX
  return (
    <div>
      {/* Inline background */}
      {/* Inline SVG defs */}
      {/* Inline edge rendering */}
      {/* Inline node rendering */}
      {/* Inline overlays */}
    </div>
  );
}
```

### After: Modular Architecture
```typescript
// GraphVisualization.tsx (160 lines)
export function GraphVisualization({ ... }) {
  const { nodePositions, ... } = useDeterministicLayout(nodes, edges);
  const { pan, handleMouseDown, ... } = useGraphInteraction({ ... });
  
  return (
    <div>
      <GraphBackground />
      <svg>
        <GraphSVGDefs />
        <GraphEdges ... />
        {clusters.map(c => <ClusterGroup ... />)}
      </svg>
      <GraphControls ... />
      <GraphInstructions />
    </div>
  );
}

// useGraphInteraction.ts (90 lines)
export function useGraphInteraction({ ... }) { ... }

// GraphOverlays.tsx (85 lines)
export function GraphControls({ ... }) { ... }
export function GraphInstructions() { ... }
export function GraphBackground() { ... }

// GraphSVGDefs.tsx (50 lines)
export function GraphSVGDefs() { ... }

// GraphEdges.tsx (80 lines)
export function GraphEdges({ ... }) { ... }

// ClusterGroup.tsx (115 lines)
export function ClusterGroup({ ... }) { ... }
```

**Result:**
- ✅ Main component: 408 → 160 lines (60% reduction)
- ✅ 6 focused sub-modules (50-115 lines each)
- ✅ Each module has single responsibility
- ✅ Easy to test, modify, and understand

## Benefits of This Architecture

### 1. **Easier to Understand**
- Small files are easier to read
- Clear file names tell you what code does
- Less cognitive load

### 2. **Easier to Maintain**
- Change one file without affecting others
- Find bugs faster (clear boundaries)
- Onboard new developers quicker

### 3. **Easier to Test**
- Test pure functions in isolation
- Test components without complex setup
- Mock dependencies easily

### 4. **Easier to Refactor**
- Move utilities between projects
- Replace implementations without breaking API
- Experiment with alternatives

### 5. **Easier to Collaborate**
- Less merge conflicts (smaller files)
- Clear ownership boundaries
- Parallel development possible

## Anti-Patterns to Avoid

### ❌ God File
```typescript
// utils/everything.ts (2000 lines)
export function calculateLayout() { ... }
export function renderGraph() { ... }
export function handleEvents() { ... }
// ... 50 more unrelated functions
```

**Problem:** No organization, hard to find anything

### ❌ Circular Dependencies
```typescript
// fileA.ts
import { funcB } from './fileB';

// fileB.ts
import { funcA } from './fileA'; // ❌ Circular!
```

**Problem:** Can cause runtime errors, hard to test

### ❌ Kitchen Sink Component
```typescript
// Component.tsx (500 lines)
export function Component() {
  // 100 lines state
  // 200 lines handlers
  // 200 lines JSX
}
```

**Problem:** Hard to understand, impossible to test

### ❌ Tight Coupling
```typescript
// ComponentA.tsx
import { ComponentB } from './ComponentB';
import { someInternalHelper } from './ComponentB/internal'; // ❌ Reaching into internals
```

**Problem:** Breaks encapsulation, fragile

## Current File Sizes

### ✅ Well-Sized Files (30-100 lines)
- `GraphSVGDefs.tsx` - 50 lines
- `GraphControls` - 25 lines
- `ringCalculations.ts` - 50 lines
- `boundaryForces.ts` - 25 lines
- `nodeCategories.ts` - 70 lines

### ✅ Medium Files (100-160 lines)
- `GraphVisualization.tsx` - 160 lines
- `deterministicNodeLayout.ts` - 155 lines
- `ClusterGroup.tsx` - 115 lines

### ⚠️ Watch These (approaching limit)
- `App.tsx` - Likely ~200+ lines (could extract filter/search hooks)
- `NodeDetailsPanel.tsx` - Already split into 5 sub-components ✅

## Next Refactoring Opportunities

If you want to modularize further:

### 1. **App.tsx**
Could extract:
```typescript
useFilterState()      // Filter logic
useSearchState()      // Search logic
useSidebarState()     // Sidebar toggle logic
useKeyboardShortcuts() // Keyboard handlers
```

### 2. **Sidebar Components**
```typescript
/components/sidebar/
├── FilterSection.tsx
├── LegendSection.tsx
├── SearchSection.tsx
└── ExportSection.tsx
```

### 3. **Cluster Analysis**
```typescript
/utils/analysis/
├── roleDetection.ts
├── layerCalculation.ts
├── anchorIdentification.ts
└── dependencyScoring.ts
```

## Summary

**Key Takeaways:**
1. ✅ Keep files small (30-100 lines ideal)
2. ✅ Single responsibility per file
3. ✅ Extract reusable logic to hooks/utilities
4. ✅ Presentational vs container components
5. ✅ Group related files in subdirectories
6. ✅ Use design system CSS variables
7. ✅ No circular dependencies

**Result:**
- Clean, maintainable codebase
- Easy to understand and modify
- Testable in isolation
- Design system compliant
- Team-friendly architecture

The refactoring reduced `GraphVisualization.tsx` from **408 lines to 160 lines** and extracted layout utilities into **9 focused modules**. This is the level of modularity to maintain going forward! 🎯
