/**
 * Node List Event Handlers Mixin
 *
 * Provides shared event forwarding logic for node list components.
 * Used by GraphNodeList, GraphClusterTargetsList, and similar components.
 *
 * @module components/ui/node-list-events
 */

import { LitElement } from 'lit';
import type { GraphNode } from '@/schemas/graph.schema';

// Type for the mixin constructor
type Constructor<T = object> = new (...args: unknown[]) => T;

/**
 * Mixin that adds node list event handling methods
 *
 * Provides:
 * - handleNodeSelect: Forwards row-select events as node-select
 * - handleNodeHover: Forwards row-hover events as node-hover
 * - handleHoverEnd: Dispatches node-hover with null nodeId
 */
export function NodeListEventsMixin<T extends Constructor<LitElement>>(Base: T) {
	return class NodeListEvents extends Base {
		/**
		 * Forward node selection event
		 */
		protected handleNodeSelect(e: CustomEvent<{ node: GraphNode }>) {
			this.dispatchEvent(
				new CustomEvent('node-select', {
					detail: { node: e.detail.node },
					bubbles: true,
					composed: true,
				}),
			);
		}

		/**
		 * Forward node hover event
		 */
		protected handleNodeHover(e: CustomEvent<{ nodeId: string }>) {
			this.dispatchEvent(
				new CustomEvent('node-hover', {
					detail: { nodeId: e.detail.nodeId },
					bubbles: true,
					composed: true,
				}),
			);
		}

		/**
		 * Handle hover end - dispatch with null nodeId
		 */
		protected handleHoverEnd() {
			this.dispatchEvent(
				new CustomEvent('node-hover', {
					detail: { nodeId: null },
					bubbles: true,
					composed: true,
				}),
			);
		}
	};
}
