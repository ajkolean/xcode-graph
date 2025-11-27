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
        style="transition: stroke-opacity 0.2s ease-in-out"
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
  edge: GraphEdge;
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  isHighlighted?: boolean;
  isDimmed?: boolean;
  zoom?: number;
  color?: string;
}

export function renderGraphEdge(options: GraphEdgeOptions) {
  const {
    edge,
    sourcePos,
    targetPos,
    isHighlighted = false,
    isDimmed = false,
    zoom = 1.0,
    color = '#666',
  } = options;

  const zoomAdjustedColor = adjustColorForZoom(color, zoom);
  const opacity = isDimmed ? 0.1 : isHighlighted ? 0.8 : 0.3;
  const strokeWidth = isHighlighted ? 2 : 1;

  // Calculate control point for curved edges
  const midX = (sourcePos.x + targetPos.x) / 2;
  const midY = (sourcePos.y + targetPos.y) / 2;
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const curvature = 0.2;
  const ctrlX = midX - dy * curvature;
  const ctrlY = midY + dx * curvature;

  const pathD = `M ${sourcePos.x} ${sourcePos.y} Q ${ctrlX} ${ctrlY} ${targetPos.x} ${targetPos.y}`;

  return svg`
    <path
      d="${pathD}"
      fill="none"
      stroke="${zoomAdjustedColor}"
      stroke-width="${strokeWidth}"
      stroke-opacity="${opacity}"
      stroke-linecap="round"
      marker-end="url(#arrowhead)"
      style="transition: stroke-opacity 0.3s"
    />
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
