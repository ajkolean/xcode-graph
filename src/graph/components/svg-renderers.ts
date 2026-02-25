/**
 * SVG Render Functions
 *
 * Pure functions that render SVG content using Lit's svg template literal.
 * These are used instead of custom elements inside SVG because custom elements
 * in the SVG namespace don't work as web components.
 */

import type { RoutedEdge } from '@graph/layout/types';
import { getConnectedNodes } from '@graph/utils/connections';
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.schema';
import { generateColor } from '@ui/utils/color-generator';
import { getNodeTypeColor } from '@ui/utils/node-colors';
import { generateBezierPath, generatePortRoutedPath } from '@ui/utils/paths';
import { getNodeSize } from '@ui/utils/sizing';
import { isLineInViewport, type ViewportBounds } from '@ui/utils/viewport';
import { adjustColorForZoom, adjustOpacityForZoom } from '@ui/utils/zoom-colors';
import { nothing, svg, type TemplateResult } from 'lit';

// ========================================
// Cluster Card Renderer
// ========================================

export interface ClusterCardOptions {
  cluster: Cluster;
  x: number;
  y: number;
  width: number;
  height: number;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isSelected?: boolean;
  zoom?: number;
  onClick?: () => void;
}

export function renderClusterCard(options: ClusterCardOptions): TemplateResult {
  const {
    cluster,
    x,
    y,
    width,
    height,
    isHighlighted = false,
    isDimmed = false,
    isSelected = false,
    zoom = 1,
    onClick,
  } = options;

  const clusterColor = generateColor(cluster.name, cluster.type);
  const zoomAdjustedColor = adjustColorForZoom(clusterColor, zoom);
  const borderOpacity = adjustOpacityForZoom(0.5, zoom);

  const isActive = isHighlighted || isSelected;
  const cursorStyle = onClick ? 'pointer' : 'default';
  const strokeDasharray = cluster.type === 'project' ? '8 8' : '3 8';
  const fillAlpha = isActive ? '08' : '18';
  const textOpacity = isActive ? 1 : 0.6;
  const fontWeight = isActive ? 600 : 500;
  const textShadow = isActive
    ? `0 0 8px ${zoomAdjustedColor}40, 0 0 16px ${zoomAdjustedColor}20`
    : 'none';

  return svg`
    <g
      opacity="${isDimmed ? 0.3 : 1}"
      @click=${onClick}
      style="cursor: ${cursorStyle}"
    >
      <!-- Background fill -->
      <rect
        x="${x}"
        y="${y}"
        width="${width}"
        height="${height}"
        rx="8"
        ry="8"
        fill="${zoomAdjustedColor}${fillAlpha}"
        stroke="none"
        style="transition: fill var(--durations-normal) ease-in-out"
      />

      <!-- Border -->
      <rect
        x="${x}"
        y="${y}"
        width="${width}"
        height="${height}"
        rx="8"
        ry="8"
        fill="none"
        stroke="${zoomAdjustedColor}"
        stroke-width="3.5"
        stroke-opacity="${isActive ? 0.9 : borderOpacity}"
        stroke-dasharray="${strokeDasharray}"
        stroke-linecap="round"
        style="
          transition: stroke-opacity var(--durations-normal) ease-in-out;
          ${isSelected ? 'animation: marchingAnts var(--durations-slower) linear infinite' : ''}
        "
      />

      <!-- Cluster label -->
      <text
        x="${x + 12}"
        y="${y + 20}"
        fill="${zoomAdjustedColor}"
        style="
          font-family: var(--fonts-body);
          font-size: var(--font-sizes-label);
          font-weight: ${fontWeight};
          pointer-events: none;
          opacity: ${textOpacity};
          text-shadow: ${textShadow};
          transition: opacity var(--durations-normal), font-weight var(--durations-normal), text-shadow var(--durations-normal);
        "
      >
        ${cluster.name}
      </text>

      <!-- Target count -->
      <text
        x="${x + width - 12}"
        y="${y + 20}"
        text-anchor="end"
        fill="${zoomAdjustedColor}"
        style="
          font-family: var(--fonts-body);
          font-size: var(--font-sizes-sm);
          font-weight: ${fontWeight};
          pointer-events: none;
          opacity: ${textOpacity};
          text-shadow: ${textShadow};
          transition: opacity var(--durations-normal), font-weight var(--durations-normal), text-shadow var(--durations-normal);
        "
      >
        ${cluster.nodes.length} targets
      </text>
    </g>
  `;
}

// ========================================
// Graph Node Renderer
// ========================================

export interface GraphNodeOptions {
  node: GraphNode;
  x: number;
  y: number;
  size: number;
  color: string;
  isSelected?: boolean;
  isHovered?: boolean;
  isDimmed?: boolean;
  zoom?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseDown?: (e: MouseEvent) => void;
  onClick?: (e: MouseEvent) => void;
}

export function renderGraphNode(options: GraphNodeOptions): TemplateResult {
  const {
    node,
    x,
    y,
    size,
    color,
    isSelected = false,
    isHovered = false,
    isDimmed = false,
    zoom = 1,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onClick,
  } = options;

  // Use reusable shape ID instead of inline path for performance
  const shapeId = `node-icon-${node.type}-${node.platform}`;
  const zoomAdjustedColor = adjustColorForZoom(color, zoom);
  const glowOpacity = adjustOpacityForZoom(0.3, zoom);
  // Keep scale for hover feedback, but make it subtle
  const scale = isHovered || isSelected ? 1.02 : 1;

  const maxLabelLength = 20;
  const displayName =
    node.name.length > maxLabelLength ? `${node.name.substring(0, maxLabelLength)}...` : node.name;
  const showTooltip = isHovered && node.name.length > 20;
  const fontWeight = isSelected ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)';

  const renderTooltip = () => svg`
    <rect
      x="${x - node.name.length * 3.5}"
      y="${y - size - 35}"
      width="${node.name.length * 7}"
      height="22"
      rx="4"
      fill="rgba(var(--colors-card-rgb), var(--opacity-95))"
      stroke="${zoomAdjustedColor}"
      stroke-width="1"
      filter="url(#glow)"
    />
    <text
      x="${x}"
      y="${y - size - 20}"
      fill="${zoomAdjustedColor}"
      text-anchor="middle"
      style="
        font-family: var(--fonts-body);
        font-size: var(--font-sizes-sm);
        font-weight: var(--font-weight-normal);
        pointer-events: none;
      "
    >
      ${node.name}
    </text>
  `;

  // Extract nested ternary to avoid nested conditional
  const tooltipContent = showTooltip ? renderTooltip() : nothing;

  return svg`
    <g
      @mouseenter=${onMouseEnter}
      @mouseleave=${onMouseLeave}
      @mousedown=${onMouseDown}
      @click=${onClick}
      style="cursor: pointer; transition: opacity var(--durations-slow) ease"
      opacity="${isDimmed ? 0.3 : 1}"
      transform="scale(${scale})"
      transform-origin="${x}px ${y}px"
    >
      ${
        isSelected
          ? svg`
        <!-- Sonar pulse rings -->
        <circle cx="${x}" cy="${y}" r="${size}" fill="none" stroke="${zoomAdjustedColor}" stroke-width="2" opacity="0">
          <animate attributeName="r" from="${size}" to="${size * 4}" dur="3.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.3;0" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="${x}" cy="${y}" r="${size}" fill="none" stroke="${zoomAdjustedColor}" stroke-width="2" opacity="0">
          <animate attributeName="r" from="${size}" to="${size * 4}" dur="3.5s" begin="0.875s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.3;0" dur="3.5s" begin="0.875s" repeatCount="indefinite" />
        </circle>
        <circle cx="${x}" cy="${y}" r="${size}" fill="none" stroke="${zoomAdjustedColor}" stroke-width="2" opacity="0">
          <animate attributeName="r" from="${size}" to="${size * 4}" dur="3.5s" begin="1.75s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.3;0" dur="3.5s" begin="1.75s" repeatCount="indefinite" />
        </circle>
        <circle cx="${x}" cy="${y}" r="${size}" fill="none" stroke="${zoomAdjustedColor}" stroke-width="2" opacity="0">
          <animate attributeName="r" from="${size}" to="${size * 4}" dur="3.5s" begin="2.625s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.3;0" dur="3.5s" begin="2.625s" repeatCount="indefinite" />
        </circle>
      `
          : nothing
      }

      <!-- Outer glow ring -->
      ${
        isSelected || isHovered
          ? svg`
        <circle
          cx="${x}"
          cy="${y}"
          r="${size + 8}"
          fill="none"
          stroke="${zoomAdjustedColor}"
          stroke-width="2"
          opacity="${glowOpacity}"
          filter="url(#glow-strong)"
        />
      `
          : nothing
      }

      <!-- Icon shape (using reusable def for performance) -->
      <g
        transform="translate(${x}, ${y})"
        filter="${isSelected || isHovered ? 'url(#glow)' : ''}"
      >
        <use
          href="#${shapeId}"
          fill="rgba(var(--colors-card-rgb), var(--opacity-95))"
          stroke="${zoomAdjustedColor}"
          stroke-width="${isSelected ? 2.5 : 2}"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="pointer-events: all"
        />
      </g>

      <!-- Label -->
      ${
        zoom >= 0.5
          ? svg`
        <g>
          <text
            x="${x}"
            y="${y + size + 22}"
            fill="${zoomAdjustedColor}"
            text-anchor="middle"
            style="
              font-family: var(--fonts-body);
              font-size: var(--font-sizes-sm);
              font-weight: ${fontWeight};
              pointer-events: none;
              filter: drop-shadow(0 0 8px rgba(var(--colors-card-rgb), var(--opacity-90))) drop-shadow(0 0 4px rgba(var(--colors-card-rgb), 1)) drop-shadow(0 1px 2px rgba(0, 0, 0, var(--opacity-80)));
            "
          >
            ${displayName}
          </text>

          ${tooltipContent}
        </g>
      `
          : nothing
      }
    </g>
  `;
}

// ========================================
// Graph Edge Renderer
// ========================================

export interface GraphEdgeOptions {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  isHighlighted?: boolean;
  isDependent?: boolean;
  opacity?: number;
  zoom?: number;
  animated?: boolean;
}

export function renderGraphEdge(options: GraphEdgeOptions): TemplateResult {
  const {
    x1,
    y1,
    x2,
    y2,
    color,
    isHighlighted = false,
    isDependent = false,
    opacity: opacityMultiplier = 1,
    zoom = 1,
    animated = false,
  } = options;

  // Calculate distance to determine if we should use bezier curve
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.hypot(dx, dy);
  const useBezier = distance > 150;

  // Adjust color based on zoom level
  const zoomAdjustedColor = adjustColorForZoom(color, zoom);

  // Base opacity: highlighted (0.8), normal (0.3)
  const baseOpacity = isHighlighted ? 0.8 : 0.3;
  const zoomOpacity = adjustOpacityForZoom(baseOpacity, zoom);
  const finalOpacity = zoomOpacity * opacityMultiplier;

  // Cross-cluster = long dashes "8,4", Regular = short dashes "4,2"
  const dashPattern = isDependent ? '8,4' : '4,2';

  // Generate path (bezier curve or straight line)
  const path = useBezier ? generateBezierPath(x1, y1, x2, y2) : `M ${x1},${y1} L ${x2},${y2}`;
  const animationClass = animated ? 'flow-animation' : '';

  return svg`
    <g class="graph-edge" style="transition: opacity var(--durations-slow) ease">
      ${
        isHighlighted
          ? svg`
        <path
          d="${path}"
          stroke="${zoomAdjustedColor}"
          stroke-width="3"
          fill="none"
          opacity="${adjustOpacityForZoom(0.3, zoom) * opacityMultiplier}"
          filter="url(#glow-strong)"
          stroke-dasharray="${dashPattern}"
          class="${animationClass}"
          shape-rendering="geometricPrecision"
        />
      `
          : nothing
      }
      <path
        d="${path}"
        stroke="${zoomAdjustedColor}"
        stroke-width="${isHighlighted ? 2 : 1}"
        fill="none"
        opacity="${finalOpacity}"
        stroke-dasharray="${dashPattern}"
        class="${animated ? 'flow-animation' : ''}"
        shape-rendering="geometricPrecision"
        style="transition: opacity var(--durations-slow) ease, stroke-width var(--durations-normal) ease"
      />
    </g>
  `;
}

// ========================================
// Routed Graph Edge Renderer (port-based routing)
// ========================================

export interface RoutedGraphEdgeOptions {
  routedEdge: RoutedEdge;
  sourceClusterPosition: ClusterPosition;
  targetClusterPosition: ClusterPosition;
  layoutNodePositions: Map<string, NodePosition>;
  color: string;
  isHighlighted?: boolean;
  opacity?: number;
  zoom?: number;
  animated?: boolean;
}

export function renderRoutedGraphEdge(
  options: RoutedGraphEdgeOptions,
): TemplateResult | typeof nothing {
  const {
    routedEdge,
    sourceClusterPosition,
    targetClusterPosition,
    layoutNodePositions,
    color,
    isHighlighted = false,
    opacity: opacityMultiplier = 1,
    zoom = 1,
    animated = false,
  } = options;

  // Get node positions (relative to cluster center)
  const sourceNodePos = layoutNodePositions.get(routedEdge.sourceNodeId);
  const targetNodePos = layoutNodePositions.get(routedEdge.targetNodeId);

  if (!sourceNodePos || !targetNodePos) return nothing;

  // Generate port-routed path
  const path = generatePortRoutedPath(
    { x: sourceNodePos.x, y: sourceNodePos.y },
    { x: routedEdge.sourcePort.x, y: routedEdge.sourcePort.y },
    { x: routedEdge.targetPort.x, y: routedEdge.targetPort.y },
    { x: targetNodePos.x, y: targetNodePos.y },
    routedEdge.waypoints,
    { x: sourceClusterPosition.x, y: sourceClusterPosition.y },
    { x: targetClusterPosition.x, y: targetClusterPosition.y },
  );

  // Adjust color based on zoom level
  const zoomAdjustedColor = adjustColorForZoom(color, zoom);

  // Base opacity: highlighted (0.8), normal (0.35) - slightly higher for routed edges
  const baseOpacity = isHighlighted ? 0.8 : 0.35;
  const zoomOpacity = adjustOpacityForZoom(baseOpacity, zoom);
  const finalOpacity = zoomOpacity * opacityMultiplier;

  // Routed edges use longer dashes to indicate highway routing
  const dashPattern = '10,5';
  const animationClass = animated ? 'flow-animation' : '';

  return svg`
    <g class="graph-edge routed-edge" style="transition: opacity var(--durations-slow) ease">
      ${
        isHighlighted
          ? svg`
        <path
          d="${path}"
          stroke="${zoomAdjustedColor}"
          stroke-width="4"
          fill="none"
          opacity="${adjustOpacityForZoom(0.3, zoom) * opacityMultiplier}"
          filter="url(#glow-strong)"
          stroke-dasharray="${dashPattern}"
          class="${animationClass}"
          shape-rendering="geometricPrecision"
        />
      `
          : nothing
      }
      <path
        d="${path}"
        stroke="${zoomAdjustedColor}"
        stroke-width="${isHighlighted ? 2.5 : 1.5}"
        fill="none"
        opacity="${finalOpacity}"
        stroke-dasharray="${dashPattern}"
        class="${animated ? 'flow-animation' : ''}"
        shape-rendering="geometricPrecision"
        style="transition: opacity var(--durations-slow) ease, stroke-width var(--durations-normal) ease"
      />
    </g>
  `;
}

// ========================================
// Graph Edges Renderer (renders multiple edges)
// ========================================

export interface GraphEdgesOptions {
  edges: GraphEdge[];
  nodes: GraphNode[];
  nodeMap?: Map<string, GraphNode>;
  layoutNodePositions: Map<string, NodePosition>;
  manualNodePositions?: Map<string, { x: number; y: number }>;
  clusterPositions: Map<string, ClusterPosition>;
  selectedNode: GraphNode | null;
  hoveredNode: string | null;
  clusterId?: string | null;
  hoveredClusterId?: string | null;
  viewMode?: string;
  transitiveDeps?: {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
  };
  transitiveDependents?: {
    nodes: Set<string>;
    edges: Set<string>;
    edgeDepths: Map<string, number>;
    maxDepth: number;
  };
  zoom?: number;
  viewportBounds?: ViewportBounds; // Optional viewport culling
  routedEdges?: RoutedEdge[]; // Port-routed edges for cross-cluster rendering
}

// Helper types for edge rendering
interface EdgeEndpoints {
  sourceNode: GraphNode;
  targetNode: GraphNode;
  sourceClusterId: string;
  targetClusterId: string;
}

interface EdgePositions {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface EdgeVisualState {
  isHighlighted: boolean;
  isFocused: boolean;
  shouldDim: boolean;
  shouldAnimate: boolean;
  isCrossCluster: boolean;
}

/**
 * Resolves source and target nodes for an edge
 */
function resolveEdgeEndpoints(
  edge: GraphEdge,
  nodes: GraphNode[],
  nodeMap?: Map<string, GraphNode>,
): EdgeEndpoints | null {
  const sourceNode = nodeMap ? nodeMap.get(edge.source) : nodes.find((n) => n.id === edge.source);
  const targetNode = nodeMap ? nodeMap.get(edge.target) : nodes.find((n) => n.id === edge.target);

  if (!sourceNode || !targetNode) return null;

  return {
    sourceNode,
    targetNode,
    sourceClusterId: sourceNode.project || 'External',
    targetClusterId: targetNode.project || 'External',
  };
}

/**
 * Determines if an edge should be rendered based on cluster context
 */
function shouldRenderEdge(endpoints: EdgeEndpoints, clusterId?: string): boolean {
  const { sourceClusterId, targetClusterId } = endpoints;

  if (clusterId) {
    // When viewing a specific cluster, only show intra-cluster edges
    return sourceClusterId === clusterId && targetClusterId === clusterId;
  }
  // When viewing all clusters, only show cross-cluster edges
  return sourceClusterId !== targetClusterId;
}

/**
 * Calculates edge positions with viewport culling
 */
function calculateEdgePositions(
  edge: GraphEdge,
  endpoints: EdgeEndpoints,
  layoutNodePositions: Map<string, NodePosition>,
  clusterPositions: Map<string, ClusterPosition>,
  manualNodePositions?: Map<string, { x: number; y: number }>,
  viewportBounds?: ViewportBounds,
): EdgePositions | null {
  const { sourceClusterId, targetClusterId } = endpoints;

  const layoutSourcePos = layoutNodePositions.get(edge.source);
  const layoutTargetPos = layoutNodePositions.get(edge.target);
  const sourceCluster = clusterPositions.get(sourceClusterId);
  const targetCluster = clusterPositions.get(targetClusterId);

  if (!layoutSourcePos || !layoutTargetPos || !sourceCluster || !targetCluster) return null;

  // Resolve positions (manual overrides layout)
  const sourceManual = manualNodePositions?.get(edge.source);
  const targetManual = manualNodePositions?.get(edge.target);

  const sourceX = sourceManual?.x ?? layoutSourcePos.x;
  const sourceY = sourceManual?.y ?? layoutSourcePos.y;
  const targetX = targetManual?.x ?? layoutTargetPos.x;
  const targetY = targetManual?.y ?? layoutTargetPos.y;

  const x1 = sourceCluster.x + sourceX;
  const y1 = sourceCluster.y + sourceY;
  const x2 = targetCluster.x + targetX;
  const y2 = targetCluster.y + targetY;

  // Viewport culling: skip edges outside visible area
  if (viewportBounds && !isLineInViewport({ x: x1, y: y1 }, { x: x2, y: y2 }, viewportBounds)) {
    return null;
  }

  return { x1, y1, x2, y2 };
}

/**
 * Determines the visual state of an edge
 */
function getEdgeVisualState(
  edge: GraphEdge,
  endpoints: EdgeEndpoints,
  selectedNode: GraphNode | null,
  hoveredNode: string | null,
  hoveredClusterId: string | null,
  clusterId?: string,
): EdgeVisualState {
  const { sourceClusterId, targetClusterId } = endpoints;

  const isHighlighted = !!(
    selectedNode &&
    (edge.source === selectedNode.id || edge.target === selectedNode.id)
  );
  const isFocused = hoveredNode === edge.source || hoveredNode === edge.target;
  const isConnectedToHoveredCluster =
    hoveredClusterId &&
    (sourceClusterId === hoveredClusterId || targetClusterId === hoveredClusterId);
  const shouldDim = !!(hoveredClusterId && !isConnectedToHoveredCluster);
  const isCrossCluster = !clusterId;
  const shouldAnimate = isFocused || isHighlighted;

  return { isHighlighted, isFocused, shouldDim, shouldAnimate, isCrossCluster };
}

function computeChainDepthOpacity(
  edgeKey: string,
  chain: { edgeDepths: Map<string, number>; maxDepth: number },
): number {
  const depth = chain.edgeDepths.get(edgeKey) || 0;
  const maxDepth = chain.maxDepth || 1;
  return 1 - (depth / maxDepth) * 0.7;
}

function getEdgeOpacity(
  edge: GraphEdge,
  viewMode: string,
  transitiveDeps?: GraphEdgesOptions['transitiveDeps'],
  transitiveDependents?: GraphEdgesOptions['transitiveDependents'],
): number {
  const edgeKey = `${edge.source}->${edge.target}`;
  const inDepsChain = transitiveDeps?.edges.has(edgeKey);
  const inDependentsChain = transitiveDependents?.edges.has(edgeKey);

  if (viewMode === 'focused' && inDepsChain && transitiveDeps) {
    return computeChainDepthOpacity(edgeKey, transitiveDeps);
  }

  if (viewMode === 'dependents' && inDependentsChain && transitiveDependents) {
    return computeChainDepthOpacity(edgeKey, transitiveDependents);
  }

  if (viewMode === 'both') {
    if (inDepsChain && transitiveDeps) {
      return computeChainDepthOpacity(edgeKey, transitiveDeps);
    }
    if (inDependentsChain && transitiveDependents) {
      return computeChainDepthOpacity(edgeKey, transitiveDependents);
    }
  }

  return 1;
}

function renderSingleEdge(
  edge: GraphEdge,
  options: GraphEdgesOptions,
  routedEdgeMap: Map<string, RoutedEdge>,
): TemplateResult | typeof nothing {
  const {
    nodes,
    nodeMap,
    layoutNodePositions,
    manualNodePositions,
    clusterPositions,
    selectedNode,
    hoveredNode,
    clusterId,
    hoveredClusterId,
    viewMode = 'full',
    transitiveDeps,
    transitiveDependents,
    zoom = 1,
    viewportBounds,
  } = options;

  const endpoints = resolveEdgeEndpoints(edge, nodes, nodeMap);
  if (!endpoints) return nothing;

  if (!shouldRenderEdge(endpoints, clusterId ?? undefined)) return nothing;

  const visualState = getEdgeVisualState(
    edge,
    endpoints,
    selectedNode,
    hoveredNode,
    hoveredClusterId ?? null,
    clusterId ?? undefined,
  );

  const baseOpacity = getEdgeOpacity(edge, viewMode, transitiveDeps, transitiveDependents);
  const opacity = visualState.shouldDim ? baseOpacity * 0.25 : baseOpacity;

  // Check if this is a cross-cluster edge with routing data
  const routedEdge = routedEdgeMap.get(`${edge.source}->${edge.target}`);

  if (routedEdge && visualState.isCrossCluster) {
    return renderRoutedCrossClusterEdge(
      routedEdge,
      endpoints,
      clusterPositions,
      layoutNodePositions,
      opacity,
      zoom,
      visualState,
    );
  }

  // Fall back to direct bezier for intra-cluster edges or edges without routing
  const positions = calculateEdgePositions(
    edge,
    endpoints,
    layoutNodePositions,
    clusterPositions,
    manualNodePositions,
    viewportBounds,
  );
  if (!positions) return nothing;

  return renderGraphEdge({
    ...positions,
    color: getNodeTypeColor(endpoints.targetNode.type),
    isHighlighted: visualState.isHighlighted || visualState.isFocused,
    isDependent: visualState.isCrossCluster,
    opacity,
    zoom,
    animated: false,
  });
}

function renderRoutedCrossClusterEdge(
  routedEdge: RoutedEdge,
  endpoints: EdgeEndpoints,
  clusterPositions: Map<string, ClusterPosition>,
  layoutNodePositions: Map<string, NodePosition>,
  opacity: number,
  zoom: number,
  visualState: EdgeVisualState,
): TemplateResult | typeof nothing {
  const sourceClusterPos = clusterPositions.get(endpoints.sourceClusterId);
  const targetClusterPos = clusterPositions.get(endpoints.targetClusterId);

  if (!sourceClusterPos || !targetClusterPos) return nothing;

  return renderRoutedGraphEdge({
    routedEdge,
    sourceClusterPosition: sourceClusterPos,
    targetClusterPosition: targetClusterPos,
    layoutNodePositions,
    color: getNodeTypeColor(endpoints.targetNode.type),
    isHighlighted: visualState.isHighlighted || visualState.isFocused,
    opacity,
    zoom,
    animated: false,
  });
}

export function renderGraphEdges(options: GraphEdgesOptions): TemplateResult {
  const { edges, routedEdges } = options;

  // Build a lookup map for routed edges: "sourceId->targetId" -> RoutedEdge
  const routedEdgeMap = new Map<string, RoutedEdge>();
  if (routedEdges) {
    for (const re of routedEdges) {
      routedEdgeMap.set(`${re.sourceNodeId}->${re.targetNodeId}`, re);
    }
  }

  return svg`
    ${edges.map((edge) => renderSingleEdge(edge, options, routedEdgeMap))}
  `;
}

// ========================================
// Cluster Group Renderer (combines card + nodes + edges)
// ========================================

export interface ClusterGroupOptions {
  cluster: Cluster;
  clusterPosition: ClusterPosition;
  nodes: GraphNode[];
  edges: GraphEdge[];
  layoutNodePositions: Map<string, NodePosition>;
  manualNodePositions?: Map<string, { x: number; y: number }>;
  selectedNode: GraphNode | null;
  hoveredNode: string | null;
  isClusterHovered?: boolean;
  isClusterSelected?: boolean;
  searchQuery?: string;
  zoom?: number;
  previewFilter?: { type: string; value: string } | null;
  onClusterClick?: () => void;
  onClusterMouseEnter?: () => void;
  onClusterMouseLeave?: () => void;
  onNodeMouseEnter?: (nodeId: string) => void;
  onNodeMouseLeave?: () => void;
  onNodeMouseDown?: (nodeId: string, e: MouseEvent) => void;
  onNodeClick?: (node: GraphNode, e: MouseEvent) => void;
}

function matchesPreviewFilter(
  node: GraphNode,
  previewFilter: { type: string; value: string } | null | undefined,
): boolean {
  if (!previewFilter) return true;
  if (previewFilter.type === 'nodeType' && node.type === previewFilter.value) return true;
  if (previewFilter.type === 'platform' && node.platform === previewFilter.value) return true;
  if (previewFilter.type === 'origin' && node.origin === previewFilter.value) return true;
  if (previewFilter.type === 'project' && node.project === previewFilter.value) return true;
  if (
    previewFilter.type === 'package' &&
    node.type === 'package' &&
    node.name === previewFilter.value
  )
    return true;
  return false;
}

function renderClusterNode(
  node: GraphNode,
  options: ClusterGroupOptions,
  connectedNodes: Set<string>,
): TemplateResult | typeof nothing {
  const {
    clusterPosition,
    edges,
    layoutNodePositions,
    manualNodePositions,
    selectedNode,
    hoveredNode,
    searchQuery = '',
    zoom = 1,
    previewFilter,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onNodeMouseDown,
    onNodeClick,
  } = options;

  const layoutPos = layoutNodePositions.get(node.id);
  if (!layoutPos) return nothing;

  // Resolve position (manual overrides layout)
  const manualPos = manualNodePositions?.get(node.id);
  const posX = manualPos?.x ?? layoutPos.x;
  const posY = manualPos?.y ?? layoutPos.y;

  const isSelectedNode = selectedNode?.id === node.id;
  const isHovered = hoveredNode === node.id;
  const isConnected = selectedNode && connectedNodes.has(node.id);
  const isSearchMatch =
    searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

  const isDimmed =
    (searchQuery && !isSearchMatch) ||
    (selectedNode && !isSelectedNode && !isConnected) ||
    (previewFilter && !matchesPreviewFilter(node, previewFilter));

  return renderGraphNode({
    node,
    x: clusterPosition.x + posX,
    y: clusterPosition.y + posY,
    size: getNodeSize(node, edges),
    color: getNodeTypeColor(node.type),
    isSelected: isSelectedNode,
    isHovered,
    isDimmed: isDimmed ?? false,
    zoom,
    ...(onNodeMouseEnter ? { onMouseEnter: () => onNodeMouseEnter(node.id) } : {}),
    ...(onNodeMouseLeave ? { onMouseLeave: onNodeMouseLeave } : {}),
    ...(onNodeMouseDown ? { onMouseDown: (e: MouseEvent) => onNodeMouseDown(node.id, e) } : {}),
    ...(onNodeClick ? { onClick: (e: MouseEvent) => onNodeClick(node, e) } : {}),
  });
}

export function renderClusterGroup(options: ClusterGroupOptions): TemplateResult {
  const {
    cluster,
    clusterPosition,
    edges,
    selectedNode,
    isClusterHovered = false,
    isClusterSelected = false,
    zoom = 1,
    onClusterClick,
    onClusterMouseEnter,
    onClusterMouseLeave,
  } = options;

  const connectedNodes = selectedNode
    ? getConnectedNodes(selectedNode.id, edges)
    : new Set<string>();

  return svg`
    <g
      @mouseenter=${onClusterMouseEnter}
      @mouseleave=${onClusterMouseLeave}
    >
      <!-- Cluster card background -->
      ${renderClusterCard({
        cluster,
        x: clusterPosition.x - clusterPosition.width / 2,
        y: clusterPosition.y - clusterPosition.height / 2,
        width: clusterPosition.width,
        height: clusterPosition.height,
        isHighlighted: isClusterHovered,
        isSelected: isClusterSelected,
        zoom,
        ...(onClusterClick ? { onClick: onClusterClick } : {}),
      })}

      <!-- Nodes -->
      <g class="nodes">
        ${cluster.nodes.map((node) => renderClusterNode(node, options, connectedNodes))}
      </g>
    </g>
  `;
}
