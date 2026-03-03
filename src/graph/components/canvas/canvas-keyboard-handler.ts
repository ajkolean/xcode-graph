import type { GraphNode } from '@shared/schemas/graph.types';

/** Map of canvas custom event names to their detail payloads. */
export interface CanvasEventMap {
  /** Fired when a node is selected or deselected */
  'node-select': { node: GraphNode | null };
  /** Fired when a cluster is selected or deselected */
  'cluster-select': { clusterId: string | null };
  /** Fired when a node is hovered or unhovered */
  'node-hover': { nodeId: string | null };
  /** Fired when a cluster is hovered or unhovered */
  'cluster-hover': { clusterId: string | null };
}

/** Dependencies required by the canvas keyboard handler. */
export interface KeyboardContext {
  /** Pan the viewport by a delta in screen pixels */
  panBy: (dx: number, dy: number) => void;
  /** ID of the currently hovered node, or null */
  hoveredNodeId: string | null;
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
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      ctx.panBy(0, PAN_STEP);
      return true;
    case 'ArrowDown':
      e.preventDefault();
      ctx.panBy(0, -PAN_STEP);
      return true;
    case 'ArrowLeft':
      e.preventDefault();
      ctx.panBy(PAN_STEP, 0);
      return true;
    case 'ArrowRight':
      e.preventDefault();
      ctx.panBy(-PAN_STEP, 0);
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
      if (ctx.hoveredNodeId) {
        const node = ctx.nodes.find((n) => n.id === ctx.hoveredNodeId);
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
