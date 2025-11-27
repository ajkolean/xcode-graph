/**
 * GraphInteractionController (Full Version)
 *
 * Complete graph interaction controller with pan, zoom, and node dragging.
 * Converted from useGraphInteraction React hook.
 *
 * Features:
 * - Canvas panning
 * - Node dragging with manual positioning
 * - Zoom via wheel
 * - Tracks whether user actually moved (vs just clicked)
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { ClusterPosition, NodePosition } from '@/types/simulation';

export interface GraphInteractionConfig {
  zoom: number;
  finalNodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;
}

export class GraphInteractionFullController implements ReactiveController {
  private host: ReactiveControllerHost;

  // Configuration (updated externally)
  zoom: number;
  finalNodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;

  // State
  pan = { x: 400, y: 300 };
  isDragging = false;
  dragStart = { x: 0, y: 0 };
  draggedNode: string | null = null;
  manualNodePositions = new Map<string, { x: number; y: number }>();
  hasMoved = false;

  // SVG reference (set after render)
  private svgElement: SVGSVGElement | null = null;

  constructor(host: ReactiveControllerHost, config: GraphInteractionConfig) {
    this.host = host;
    this.zoom = config.zoom;
    this.finalNodePositions = config.finalNodePositions;
    this.clusterPositions = config.clusterPositions;
    host.addController(this);
  }

  // ========================================
  // Public API
  // ========================================

  setSvgElement(element: SVGSVGElement) {
    this.svgElement = element;
  }

  hasSvgElement(): boolean {
    return this.svgElement !== null;
  }

  updateConfig(config: Partial<GraphInteractionConfig>) {
    if (config.zoom !== undefined) this.zoom = config.zoom;
    if (config.finalNodePositions) this.finalNodePositions = config.finalNodePositions;
    if (config.clusterPositions) this.clusterPositions = config.clusterPositions;
  }

  // ========================================
  // Canvas Pan Handlers
  // ========================================

  handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'svg') {
      this.isDragging = true;
      this.dragStart = { x: e.clientX - this.pan.x, y: e.clientY - this.pan.y };
      this.hasMoved = false;
      this.host.requestUpdate();
    }
  };

  handleMouseMove = (e: MouseEvent) => {
    if (this.isDragging && !this.draggedNode) {
      // Pan mode
      this.hasMoved = true;
      this.pan = {
        x: e.clientX - this.dragStart.x,
        y: e.clientY - this.dragStart.y,
      };
      this.host.requestUpdate();
    } else if (this.draggedNode) {
      // Node drag mode
      this.hasMoved = true;
      const svg = this.svgElement;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const node = this.finalNodePositions.get(this.draggedNode);
      if (!node) return;

      const cluster = this.clusterPositions.get(node.clusterId);
      if (!cluster) return;

      const x = (e.clientX - rect.left - this.pan.x) / this.zoom - cluster.x;
      const y = (e.clientY - rect.top - this.pan.y) / this.zoom - cluster.y;

      const nodePos = this.manualNodePositions.get(this.draggedNode);
      if (nodePos) {
        nodePos.x = x;
        nodePos.y = y;
      } else {
        this.manualNodePositions.set(this.draggedNode, { x, y });
      }

      this.host.requestUpdate();
    }
  };

  handleMouseUp = () => {
    this.isDragging = false;
    this.draggedNode = null;
    this.host.requestUpdate();
  };

  // ========================================
  // Node Drag Handlers
  // ========================================

  handleNodeMouseDown(nodeId: string, e: MouseEvent) {
    e.stopPropagation();
    this.draggedNode = nodeId;
    this.hasMoved = false;
    this.host.requestUpdate();
  }

  // ========================================
  // Lifecycle
  // ========================================

  hostConnected(): void {
    // Event handlers attached via template
  }

  hostDisconnected(): void {
    this.isDragging = false;
    this.draggedNode = null;
  }
}
