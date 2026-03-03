import type { GraphNode } from '@shared/schemas/graph.types';
import type { CanvasEventMap, InteractionState } from './canvas-interaction-handler';

/** Dependencies required by the canvas keyboard handler. */
export interface KeyboardContext {
  /** Mutable interaction state for pan offset and hover tracking */
  state: InteractionState;
  /** Current visible nodes */
  nodes: GraphNode[];
  /** Currently selected node, or null */
  selectedNode: GraphNode | null;
  /** Dispatches a typed canvas custom event */
  dispatchCanvasEvent: <K extends keyof CanvasEventMap>(name: K, detail: CanvasEventMap[K]) => void;
  /** Dispatches a generic custom event (for zoom-in, zoom-out, zoom-reset) */
  dispatchEvent: (event: Event) => boolean;
}

const PAN_STEP = 50;

/**
 * Handles keydown events on the canvas for panning (arrow keys), zoom shortcuts,
 * node selection (Enter/Space), and deselection (Escape).
 *
 * @returns true if a pan occurred and the caller should request a render
 */
export function handleKeyDown(e: KeyboardEvent, ctx: KeyboardContext): boolean {
  const { state } = ctx;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      state.pan.y += PAN_STEP;
      return true;
    case 'ArrowDown':
      e.preventDefault();
      state.pan.y -= PAN_STEP;
      return true;
    case 'ArrowLeft':
      e.preventDefault();
      state.pan.x += PAN_STEP;
      return true;
    case 'ArrowRight':
      e.preventDefault();
      state.pan.x -= PAN_STEP;
      return true;
    case '+':
    case '=':
      e.preventDefault();
      ctx.dispatchEvent(new CustomEvent('zoom-in', { bubbles: true, composed: true }));
      return false;
    case '-':
      e.preventDefault();
      ctx.dispatchEvent(new CustomEvent('zoom-out', { bubbles: true, composed: true }));
      return false;
    case '0':
      e.preventDefault();
      ctx.dispatchEvent(new CustomEvent('zoom-reset', { bubbles: true, composed: true }));
      return false;
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (state.hoveredNode) {
        const node = ctx.nodes.find((n) => n.id === state.hoveredNode);
        if (node) {
          const newSelection = ctx.selectedNode?.id === node.id ? null : node;
          ctx.dispatchCanvasEvent('node-select', { node: newSelection });
        }
      }
      return false;
    case 'Escape':
      e.preventDefault();
      ctx.dispatchCanvasEvent('node-select', { node: null });
      ctx.dispatchCanvasEvent('cluster-select', { clusterId: null });
      return false;
    default:
      return false;
  }
}
