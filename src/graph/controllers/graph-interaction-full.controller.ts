/**
 * Graph Interaction Full Controller - Complete pan, zoom, and drag
 *
 * Complete graph interaction controller with pan, zoom, and node dragging.
 * Converted from useGraphInteraction React hook.
 *
 * **Features:**
 * - Canvas panning via background drag
 * - Node dragging with manual positioning
 * - Zoom via wheel (external callback)
 * - Movement tracking (distinguish click from drag)
 *
 * @module controllers/graph-interaction-full
 */

import type { ClusterPosition, NodePosition } from '@shared/schemas';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Configuration for full interaction controller
 */
export interface GraphInteractionConfig {
  zoom: number;
  finalNodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;
}

/**
 * Reactive controller for complete graph interactions
 *
 * Supports canvas pan, zoom, and individual node dragging.
 * Tracks manual node positions for user-overridden layouts.
 */
export class GraphInteractionFullController implements ReactiveController {
  private readonly host: ReactiveControllerHost;

  // Configuration (updated externally)
  zoom: number;
  finalNodePositions: Map<string, NodePosition>;
  clusterPositions: Map<string, ClusterPosition>;

  // State
  pan = { x: 400, y: 300 };
  isDragging = false;
  dragStart = { x: 0, y: 0 };
  draggedNode: string | null = null;
  manualNodePositions: Map<string, { x: number; y: number }> = new Map<
    string,
    { x: number; y: number }
  >();
  hasMoved = false;

  // SVG reference (set after render)
  private svgElement: SVGSVGElement | null = null;
  private readonly handleWindowMouseUp = () => this.handleMouseUp();

  constructor(host: ReactiveControllerHost, config: GraphInteractionConfig) {
    this.host = host;
    this.zoom = config.zoom;
    this.finalNodePositions = config.finalNodePositions;
    this.clusterPositions = config.clusterPositions;
    host.addController(this);
  }

  /** Sets the SVG element reference used for coordinate calculations during node dragging. */
  setSvgElement(element: SVGSVGElement): void {
    this.svgElement = element;
  }

  /** @returns Whether an SVG element reference has been set. */
  hasSvgElement(): boolean {
    return this.svgElement !== null;
  }

  /** Updates the interaction configuration with new zoom, node positions, or cluster positions. */
  updateConfig(config: Partial<GraphInteractionConfig>): void {
    if (config.zoom !== undefined) this.zoom = config.zoom;
    if (config.finalNodePositions) this.finalNodePositions = config.finalNodePositions;
    if (config.clusterPositions) this.clusterPositions = config.clusterPositions;
  }

  handleMouseDown = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'svg') {
      this.isDragging = true;
      this.dragStart = { x: e.clientX - this.pan.x, y: e.clientY - this.pan.y };
      this.hasMoved = false;
      this.host.requestUpdate();
    }
  };

  handleMouseMove = (e: MouseEvent): void => {
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

  handleMouseUp = (): void => {
    this.isDragging = false;
    this.draggedNode = null;
    // Reset hasMoved after a short delay to allow click handler to check it first
    setTimeout(() => {
      this.hasMoved = false;
      this.host.requestUpdate();
    }, 0);
    this.host.requestUpdate();
  };

  /**
   * Initiates dragging for a specific node.
   * @param nodeId - The ID of the node being dragged
   * @param e - The mouse event (propagation is stopped)
   */
  handleNodeMouseDown(nodeId: string, e: MouseEvent): void {
    e.stopPropagation();
    this.draggedNode = nodeId;
    this.hasMoved = false;
    this.host.requestUpdate();
  }

  /** Registers a global mouseup listener for drag release detection. */
  hostConnected(): void {
    window.addEventListener('mouseup', this.handleWindowMouseUp, { capture: true });
  }

  /** Removes the global mouseup listener and resets drag state on disconnect. */
  hostDisconnected(): void {
    try {
      this.isDragging = false;
      this.draggedNode = null;
      window.removeEventListener('mouseup', this.handleWindowMouseUp, { capture: true });
    } catch (error) {
      console.error('[GraphInteractionFullController] Error during cleanup:', error);
      // Ensure state is reset even if error occurs
      this.isDragging = false;
      this.draggedNode = null;
    }
  }
}
