# Space Ballet Animation

## Overview

The "Space Ballet" is an optional animated settling effect that brings the dependency graph to life. When enabled, the graph starts with gentle motion and gracefully settles into its final stable positions within ~30 animation ticks.

## Visual Effect

### Static Mode (Default)
- Instant layout calculation
- Nodes appear in final positions immediately  
- Clean, professional, architectural diagram
- **Use case**: Presentations, documentation, screenshots

### Animated Mode (Space Ballet)
- Graph starts with deterministic positions
- Gentle forces create organic motion
- Clusters drift into balanced spacing
- Nodes within clusters flex slightly
- Tests orbit their targets like moons
- Everything settles and freezes after ~30 ticks
- **Use case**: Exploration, demonstrations, visual appeal

## The Metaphor

```
Beginning:
  Clusters float apart
  Rings inside them "soften"
  Tests swing slightly around targets
  Gentle cosmic drift

After ~30 ticks:
  Clusters settle into constellation positions
  Rings hold stable orbital shapes
  Tests lock into satellite positions
  Motion ceases → frozen architecture map
```

## Technical Implementation

### Architecture

```typescript
// File: /components/graph/useAnimatedLayout.ts

1. Compute DETERMINISTIC layout first
   - Cluster DAG positioning
   - Ring-based intra-cluster layout  
   - Test satellite positioning
   ↓
2. Add velocities to positions (vx, vy = 0)
   ↓
3. Run animation loop (30 ticks via requestAnimationFrame)
   - Apply gentle forces (alpha decay 1.0 → 0.0)
   - Update positions
   - Render frame
   ↓
4. Freeze (zero velocities, cancel animation)
```

### Forces Applied

All forces are **very gentle** - just polish, not rearrangement:

1. **Node Collision** (`strength: 0.3 * alpha`)
   - Prevents overlaps within clusters
   - Only activates if distance < minSeparation

2. **Cluster Spacing** (`strength: 0.4 * alpha`)
   - Prevents cluster overlaps
   - Creates breathing room between solar systems

3. **Link Attraction** (`strength: 0.05 * alpha`)
   - Smooths edge paths
   - Only for internal cluster edges
   - Very weak - just gentle tugging

### Key Parameters

```typescript
{
  enableAnimation: boolean,     // Toggle on/off
  animationTicks: 30,           // Duration (30 frames = ~500ms at 60fps)
  
  // Force strengths (all gentle)
  nodeCollisionStrength: 0.3,   // Prevent overlaps
  clusterSpacingStrength: 0.4,  // Separate clusters
  linkAttractionStrength: 0.05, // Smooth edges
  
  // Damping
  velocityDamping: 0.7          // Strong damping = quick settling
}
```

## UI Toggle

Located in the top-left graph controls:

```
[100%] | [Zoom In] [Zoom Out] [Reset] | [🌙 Static/Animated]
```

**Static (default)**:
- Gray border
- Gray text "Static"
- No animation

**Animated (enabled)**:
- Purple border (`rgba(111, 44, 255, 0.5)`)
- Purple text "Animated"
- Purple background glow
- Orbit icon active

## Visual Comparison

### Static Mode
```
Clusters appear: ✓ Instant
Motion:          ✗ None
Settling:        ✗ N/A
Final state:     ✓ Immediate
```

### Animated Mode
```
Clusters appear: ✓ Instant (deterministic positions)
Motion:          ✓ Gentle drift (~30 frames)
Settling:        ✓ Alpha decay 1.0 → 0.0
Final state:     ✓ Frozen after animation
```

## Why Both Modes?

### Use Static When:
- Taking screenshots
- Recording demos (no jitter)
- Presenting to stakeholders
- Exporting diagrams
- Maximum performance needed

### Use Animated When:
- Exploring the graph
- Demonstrating the tool
- Understanding cluster relationships
- Showing the "cosmic" metaphor
- Adding visual appeal

## Performance

**Static Mode:**
- O(N + E) layout computation
- No continuous rendering
- Instant result

**Animated Mode:**
- O(N + E) layout computation (same)
- 30 × force calculation (gentle O(N²) per cluster)
- 30 × render frames (~500ms total)
- Then frozen (no ongoing cost)

Both modes produce the **same final positions** (within floating-point precision).

## Design System Compliance

All styling uses CSS variables:

```css
/* Toggle button */
border: 1px solid var(--color-primary);  /* When active */
color: var(--color-primary);
backgroundColor: rgba(111, 44, 255, 0.1);

/* Icon */
stroke: currentColor;  /* Inherits button color */

/* Font */
fontFamily: 'Inter, sans-serif';
fontSize: var(--text-label);
```

## Code Flow

```typescript
// App.tsx
const [enableAnimation, setEnableAnimation] = useState(false);

// GraphTab.tsx
<GraphVisualization
  enableAnimation={enableAnimation}
  onToggleAnimation={setEnableAnimation}
  // ...
/>

// GraphVisualization.tsx
const deterministicLayout = useDeterministicLayout(nodes, edges);
const animatedLayout = useAnimatedLayout(nodes, edges, { enableAnimation });

// Switch based on toggle
const { nodePositions, clusterPositions, clusters } = 
  enableAnimation ? animatedLayout : deterministicLayout;

// GraphControls.tsx
<button onClick={() => onToggleAnimation(!enableAnimation)}>
  <OrbitIcon />
  <span>{enableAnimation ? 'Animated' : 'Static'}</span>
</button>
```

## Future Enhancements

Possible improvements:

1. **Adjustable duration** - Slider for 15-60 ticks
2. **Spring physics** - More natural motion curves
3. **Cluster choreography** - Stagger cluster animations
4. **Particle trails** - Show motion paths
5. **Audio feedback** - Subtle cosmic sounds
6. **Auto-trigger** - Animate on first load, then freeze

## Result

The Space Ballet animation brings the "galaxy of solar systems" metaphor to life:

- Clusters drift like celestial bodies
- Rings flex like orbital planes
- Tests orbit like moons
- Everything settles into cosmic harmony
- Then freezes into a professional architecture diagram

**The vision becomes visible.**
