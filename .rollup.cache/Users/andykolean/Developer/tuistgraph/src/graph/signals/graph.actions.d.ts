/**
 * Graph Actions - State mutation functions for graph signals
 *
 * Contains all actions for modifying graph selection and view state.
 * Actions are standalone functions that operate on imported signals.
 *
 * @module signals/graph.actions
 */
import type { GraphNode } from '@shared/schemas/graph.types';
export type HighlightCard = 'direct-deps' | 'transitive-deps' | 'direct-dependents' | 'transitive-dependents';
/**
 * Select a node (clears cluster selection)
 * @param node - The node to select, or null to deselect
 */
export declare function selectNode(node: GraphNode | null): void;
/**
 * Select a cluster (clears node selection)
 * @param clusterId - The cluster ID to select, or null to deselect
 */
export declare function selectCluster(clusterId: string | null): void;
export declare function setHoveredNode(nodeId: string | null): void;
/**
 * Update detected circular dependencies
 * @param cycles - Array of circular dependency paths
 */
export declare function setCircularDependencies(cycles: string[][]): void;
/**
 * Toggle a highlight card on/off
 * @param card - Which highlight card to toggle
 */
export declare function toggleHighlight(card: HighlightCard): void;
/**
 * Reset all highlight toggles to false
 */
export declare function resetHighlightToggles(): void;
/**
 * Reset to full view with no selection
 */
export declare function resetView(): void;
