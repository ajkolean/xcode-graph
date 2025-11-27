/**
 * SVG Render Functions
 *
 * Pure functions that render SVG content using Lit's svg template literal.
 * These are used instead of custom elements inside SVG because custom elements
 * in the SVG namespace don't work as web components.
 */

import { svg, nothing } from 'lit';
import type { GraphEdge, GraphNode } from '@/data/mockGraphData';
import type { Cluster } from '@/types/cluster';
import type { ClusterPosition, NodePosition } from '@/types/simulation';
import { generateColor } from '@/utils/colorGenerator';
import { adjustColorForZoom, adjustOpacityForZoom } from '@/utils/zoomColorUtils';
import { getNodeIconPath } from '@/utils/nodeIcons';
import { getConnectedNodes, getNodeSize, getNodeTypeColor } from '@/components/graph/graphUtils';

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

export function renderClusterCard(options: ClusterCardOptions) {
  const {
    cluster,
    x,
    y,
    width,
    height,
    isHighlighted = false,
    isDimmed = false,
    isSelected = false,
    zoom = 1.0,
    onClick,
  } = options;

  const clusterColor = generateColor(cluster.name, cluster.type);
  const zoomAdjustedColor = adjustColorForZoom(clusterColor, zoom);
  const borderOpacity = adjustOpacityForZoom(0.5, zoom);

  const isActive = isHighlighted || isSelected;
  const cursorStyle = onClick ? 'pointer' : 'default';
  const strokeDasharray = cluster.type === 'project' ? '8 8' : '3 8';
  const fillAlpha = isActive ? '08' : '18';
  const textOpacity = isActive ? 1.0 : 0.6;
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
        style="transition: fill 0.2s ease-in-out"
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
          transition: stroke-opacity 0.2s ease-in-out;
          ${isSelected ? 'animation: marchingAnts 0.8s linear infinite' : ''}
        "
      />

      <!-- Cluster label -->
      <text
        x="${x + 12}"
        y="${y + 20}"
        fill="${zoomAdjustedColor}"
        style="
          font-family: DM Sans, sans-serif;
          font-size: 12px;
          font-weight: ${fontWeight};
          pointer-events: none;
          opacity: ${textOpacity};
          text-shadow: ${textShadow};
          transition: opacity 0.2s, font-weight 0.2s, text-shadow 0.2s;
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
          font-family: Inter, sans-serif;
          font-size: 11px;
          font-weight: ${fontWeight};
          pointer-events: none;
          opacity: ${textOpacity};
          text-shadow: ${textShadow};
          transition: opacity 0.2s, font-weight 0.2s, text-shadow 0.2s;
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

export function renderGraphNode(options: GraphNodeOptions) {
  const {
    node,
    x,
    y,
    size,
    color,
    isSelected = false,
    isHovered = false,
    isDimmed = false,
    zoom = 1.0,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onClick,
  } = options;

  const iconPath = getNodeIconPath(node.type, node.platform);
  const zoomAdjustedColor = adjustColorForZoom(color, zoom);
  const glowOpacity = adjustOpacityForZoom(0.3, zoom);
  const scale = isHovered || isSelected ? 1.05 : 1;

  const maxLabelLength = 20;
  const displayName = node.name.length > maxLabelLength
    ? `${node.name.substring(0, maxLabelLength)}...`
    : node.name;
  const showTooltip = isHovered && node.name.length > 20;

  return svg`
    <g
      @mouseenter=${onMouseEnter}
      @mouseleave=${onMouseLeave}
      @mousedown=${onMouseDown}
      @click=${onClick}
      style="cursor: pointer; transition: opacity 0.3s ease, transform 0.2s ease"
      opacity="${isDimmed ? 0.3 : 1}"
      transform="scale(${scale})"
      transform-origin="${x}px ${y}px"
    >
      ${isSelected ? svg`
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
      ` : nothing}

      <!-- Outer glow ring -->
      ${isSelected || isHovered ? svg`
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
      ` : nothing}

      <!-- Icon shape -->
      <g
        transform="translate(${x}, ${y})"
        filter="${isSelected || isHovered ? 'url(#glow)' : ''}"
      >
        <path
          d="${iconPath}"
          fill="rgba(15, 15, 20, 0.95)"
          stroke="${zoomAdjustedColor}"
          stroke-width="${isSelected ? 2.5 : 2}"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="pointer-events: all"
        />
      </g>

      <!-- Label -->
      ${zoom >= 0.5 ? svg`
        <g>
          <text
            x="${x}"
            y="${y + size + 22}"
            fill="${zoomAdjustedColor}"
            text-anchor="middle"
            style="
              font-family: Inter, sans-serif;
              font-size: 11px;
              font-weight: ${isSelected ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)'};
              pointer-events: none;
              filter: drop-shadow(0 0 8px rgba(15, 15, 20, 0.9)) drop-shadow(0 0 4px rgba(15, 15, 20, 1)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
            "
          >
            ${displayName}
          </text>

          ${showTooltip ? svg`
            <rect
              x="${x - node.name.length * 3.5}"
              y="${y - size - 35}"
              width="${node.name.length * 7}"
              height="22"
              rx="4"
              fill="rgba(15, 15, 20, 0.95)"
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
                font-family: Inter, sans-serif;
                font-size: 11px;
                font-weight: var(--font-weight-normal);
                pointer-events: none;
              "
            >
              ${node.name}
            </text>
          ` : nothing}
        </g>
      ` : nothing}
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

function generateBezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Control point offset (creates gentle curve)
  const offset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.3;

  // Control points for smooth S-curve
  const cx1 = x1 + offset;
  const cy1 = y1;
  const cx2 = x2 - offset;
  const cy2 = y2;

  return `M ${x1},${y1} C ${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;
}

export function renderGraphEdge(options: GraphEdgeOptions) {
  const {
    x1,
    y1,
    x2,
    y2,
    color,
    isHighlighted = false,
    isDependent = false,
    opacity: opacityMultiplier = 1.0,
    zoom = 1.0,
    animated = false,
  } = options;

  // Calculate distance to determine if we should use bezier curve
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
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

  return svg`
    <g class="graph-edge" style="transition: opacity 0.3s ease">
      ${isHighlighted ? svg`
        <path
          d="${path}"
          stroke="${zoomAdjustedColor}"
          stroke-width="3"
          fill="none"
          opacity="${adjustOpacityForZoom(0.3, zoom) * opacityMultiplier}"
          filter="url(#glow-strong)"
          stroke-dasharray="${dashPattern}"
          class="${animated ? 'flow-animation' : ''}"
          shape-rendering="geometricPrecision"
        />
      ` : nothing}
      <path
        d="${path}"
        stroke="${zoomAdjustedColor}"
        stroke-width="${isHighlighted ? 2 : 1}"
        fill="none"
        opacity="${finalOpacity}"
        stroke-dasharray="${dashPattern}"
        class="${animated ? 'flow-animation' : ''}"
        shape-rendering="geometricPrecision"
        style="transition: opacity 0.3s ease, stroke-width 0.2s ease"
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
  finalNodePositions: Map<string, NodePosition>;
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
}

function getEdgeOpacity(
  edge: GraphEdge,
  viewMode: string,
  transitiveDeps?: GraphEdgesOptions['transitiveDeps'],
  transitiveDependents?: GraphEdgesOptions['transitiveDependents']
): number {
  const edgeKey = `${edge.source}->${edge.target}`;
  const inDepsChain = transitiveDeps?.edges.has(edgeKey);
  const inDependentsChain = transitiveDependents?.edges.has(edgeKey);

  if (viewMode === 'focused' && inDepsChain && transitiveDeps) {
    const depth = transitiveDeps.edgeDepths.get(edgeKey) || 0;
    const maxDepth = transitiveDeps.maxDepth || 1;
    return 1.0 - (depth / maxDepth) * 0.7;
  }

  if (viewMode === 'dependents' && inDependentsChain && transitiveDependents) {
    const depth = transitiveDependents.edgeDepths.get(edgeKey) || 0;
    const maxDepth = transitiveDependents.maxDepth || 1;
    return 1.0 - (depth / maxDepth) * 0.7;
  }

  if (viewMode === 'both' && (inDepsChain || inDependentsChain)) {
    if (inDepsChain && transitiveDeps) {
      const depth = transitiveDeps.edgeDepths.get(edgeKey) || 0;
      const maxDepth = transitiveDeps.maxDepth || 1;
      return 1.0 - (depth / maxDepth) * 0.7;
    }
    if (inDependentsChain && transitiveDependents) {
      const depth = transitiveDependents.edgeDepths.get(edgeKey) || 0;
      const maxDepth = transitiveDependents.maxDepth || 1;
      return 1.0 - (depth / maxDepth) * 0.7;
    }
  }

  return 1.0;
}

export function renderGraphEdges(options: GraphEdgesOptions) {
  const {
    edges,
    nodes,
    finalNodePositions,
    clusterPositions,
    selectedNode,
    hoveredNode,
    clusterId,
    hoveredClusterId,
    viewMode = 'full',
    transitiveDeps,
    transitiveDependents,
    zoom = 1.0,
  } = options;

  return svg`
    ${edges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return nothing;

      const sourceClusterId = sourceNode.project || 'External';
      const targetClusterId = targetNode.project || 'External';

      // Filter based on cluster context
      if (clusterId) {
        if (sourceClusterId !== clusterId || targetClusterId !== clusterId) return nothing;
      } else {
        if (sourceClusterId === targetClusterId) return nothing;
      }

      const sourcePos = finalNodePositions.get(edge.source);
      const targetPos = finalNodePositions.get(edge.target);
      const sourceCluster = clusterPositions.get(sourceClusterId);
      const targetCluster = clusterPositions.get(targetClusterId);

      if (!sourcePos || !targetPos || !sourceCluster || !targetCluster) return nothing;

      const x1 = sourceCluster.x + sourcePos.x;
      const y1 = sourceCluster.y + sourcePos.y;
      const x2 = targetCluster.x + targetPos.x;
      const y2 = targetCluster.y + targetPos.y;

      const isHighlighted =
        selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);
      const isFocused = hoveredNode === edge.source || hoveredNode === edge.target;

      const isConnectedToHoveredCluster =
        hoveredClusterId &&
        (sourceClusterId === hoveredClusterId || targetClusterId === hoveredClusterId);

      const shouldDim = hoveredClusterId && !isConnectedToHoveredCluster;
      const edgeColor = getNodeTypeColor(targetNode.type);
      const isCrossCluster = !clusterId;
      const shouldAnimate = isFocused || isHighlighted;

      const opacity = shouldDim
        ? getEdgeOpacity(edge, viewMode, transitiveDeps, transitiveDependents) * 0.08
        : getEdgeOpacity(edge, viewMode, transitiveDeps, transitiveDependents);

      return renderGraphEdge({
        x1,
        y1,
        x2,
        y2,
        color: edgeColor,
        isHighlighted: isHighlighted || isFocused,
        isDependent: isCrossCluster,
        opacity,
        zoom,
        animated: shouldAnimate,
      });
    })}
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
  finalNodePositions: Map<string, NodePosition>;
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

export function renderClusterGroup(options: ClusterGroupOptions) {
  const {
    cluster,
    clusterPosition,
    nodes,
    edges,
    finalNodePositions,
    selectedNode,
    hoveredNode,
    isClusterHovered = false,
    isClusterSelected = false,
    searchQuery = '',
    zoom = 1.0,
    previewFilter,
    onClusterClick,
    onClusterMouseEnter,
    onClusterMouseLeave,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onNodeMouseDown,
    onNodeClick,
  } = options;

  const connectedNodes = selectedNode ? getConnectedNodes(selectedNode.id, edges) : new Set<string>();
  const clusterNodes = cluster.nodes;

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
        onClick: onClusterClick,
      })}

      <!-- Nodes -->
      <g class="nodes">
        ${clusterNodes.map((node) => {
          const pos = finalNodePositions.get(node.id);
          if (!pos) return nothing;

          const isSelectedNode = selectedNode?.id === node.id;
          const isHovered = hoveredNode === node.id;
          const isConnected = selectedNode && connectedNodes.has(node.id);
          const isSearchMatch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesPreview =
            !previewFilter ||
            (previewFilter.type === 'nodeType' && node.type === previewFilter.value) ||
            (previewFilter.type === 'platform' && node.platform === previewFilter.value) ||
            (previewFilter.type === 'origin' && node.origin === previewFilter.value) ||
            (previewFilter.type === 'project' && node.project === previewFilter.value) ||
            (previewFilter.type === 'package' && node.type === 'package' && node.name === previewFilter.value);

          const isDimmed =
            (searchQuery && !isSearchMatch) ||
            (selectedNode && !isSelectedNode && !isConnected) ||
            (previewFilter && !matchesPreview);

          const size = getNodeSize(node, edges);
          const color = getNodeTypeColor(node.type);
          const x = clusterPosition.x + pos.x;
          const y = clusterPosition.y + pos.y;

          return renderGraphNode({
            node,
            x,
            y,
            size,
            color,
            isSelected: isSelectedNode,
            isHovered,
            isDimmed,
            zoom,
            onMouseEnter: () => onNodeMouseEnter?.(node.id),
            onMouseLeave: onNodeMouseLeave,
            onMouseDown: (e) => onNodeMouseDown?.(node.id, e),
            onClick: (e) => onNodeClick?.(node, e),
          });
        })}
      </g>
    </g>
  `;
}
