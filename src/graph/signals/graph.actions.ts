/**
 * Graph Actions - State mutation functions for graph signals
 *
 * Contains all actions for modifying graph selection and view state.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/graph.actions
 */

import { ViewMode } from '@shared/schemas/app.schema';
import type { GraphNode } from '@shared/schemas/graph.schema';
import {
  circularDependencies,
  hoveredNode,
  selectedCluster,
  selectedNode,
  viewMode,
} from './graph.signals';

// ==================== Basic Actions ====================

/**
 * Select a node (clears cluster selection)
 * @param node - The node to select, or null to deselect
 */
export function selectNode(node: GraphNode | null): void {
  selectedNode.set(node);
  selectedCluster.set(null);
  if (!node) {
    viewMode.set(ViewMode.Full);
  }
}

/**
 * Select a cluster (clears node selection)
 * @param clusterId - The cluster ID to select, or null to deselect
 */
export function selectCluster(clusterId: string | null): void {
  selectedCluster.set(clusterId);
  selectedNode.set(null);
  viewMode.set(ViewMode.Full);
}

/**
 * Set the hovered node for highlighting (throttled via RAF)
 * @param nodeId - The node ID to highlight, or null to clear
 */
let pendingHoverUpdate: string | null | undefined;
let hoverRafId: number | null = null;

export function setHoveredNode(nodeId: string | null): void {
  // Store the pending update
  pendingHoverUpdate = nodeId;

  // Cancel previous RAF if pending
  if (hoverRafId !== null) return;

  // Schedule update for next frame
  hoverRafId = requestAnimationFrame(() => {
    hoveredNode.set(pendingHoverUpdate ?? null);
    hoverRafId = null;
    pendingHoverUpdate = undefined;
  });
}

/**
 * Change the view mode
 * @param mode - The new view mode
 */
export function setViewMode(mode: ViewMode): void {
  viewMode.set(mode);
}

/**
 * Update detected circular dependencies
 * @param cycles - Array of circular dependency paths
 */
export function setCircularDependencies(cycles: string[][]): void {
  circularDependencies.set(cycles);
}

// ==================== Complex Actions ====================

/**
 * Focus on a node with view mode cycling
 *
 * When clicking the same node repeatedly, cycles through:
 * focused -> full -> both (if coming from dependents)
 *
 * @param node - The node to focus on
 */
export function focusNode(node: GraphNode): void {
  const currentViewMode = viewMode.get();
  const currentSelectedNode = selectedNode.get();

  let newMode: ViewMode = ViewMode.Focused;

  if (currentSelectedNode?.id === node.id) {
    if (currentViewMode === ViewMode.Focused) newMode = ViewMode.Full;
    else if (currentViewMode === ViewMode.Both) newMode = ViewMode.Dependents;
    else if (currentViewMode === ViewMode.Dependents) newMode = ViewMode.Both;
  }

  selectedNode.set(node);
  selectedCluster.set(null);
  viewMode.set(newMode);
}

/**
 * Show dependents of a node with view mode cycling
 *
 * When clicking the same node repeatedly, cycles through:
 * dependents -> full -> both (if coming from focused)
 *
 * @param node - The node to show dependents for
 */
export function showDependents(node: GraphNode): void {
  const currentViewMode = viewMode.get();
  const currentSelectedNode = selectedNode.get();

  let newMode: ViewMode = ViewMode.Dependents;

  if (currentSelectedNode?.id === node.id) {
    if (currentViewMode === ViewMode.Dependents) newMode = ViewMode.Full;
    else if (currentViewMode === ViewMode.Both) newMode = ViewMode.Focused;
    else if (currentViewMode === ViewMode.Focused) newMode = ViewMode.Both;
  }

  selectedNode.set(node);
  selectedCluster.set(null);
  viewMode.set(newMode);
}

/**
 * Show impact analysis for a node
 * @param node - The node to analyze impact for
 */
export function showImpact(node: GraphNode): void {
  selectedNode.set(node);
  selectedCluster.set(null);
  viewMode.set(ViewMode.Impact);
}

/**
 * Reset to full view with no selection
 */
export function resetView(): void {
  selectedNode.set(null);
  selectedCluster.set(null);
  viewMode.set(ViewMode.Full);
}
