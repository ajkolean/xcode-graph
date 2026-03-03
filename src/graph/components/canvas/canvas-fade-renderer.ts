import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import { resolveNodeWorldPosition } from '@graph/utils/canvas-positions';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { GraphNode } from '@shared/schemas/graph.types';
import { getNodeTypeColorFromTheme } from '@ui/utils/node-colors';
import { getNodeSize } from '@ui/utils/sizing';
import { adjustColorForZoom } from '@ui/utils/zoom-colors';

/** Duration in milliseconds for the node fade-out animation. */
export const FADE_OUT_DURATION = 250;

/** A node that is animating its removal from the canvas. */
export interface FadingNode {
  node: GraphNode;
  startTime: number;
}

/** Dependencies required to render fading-out nodes. */
export interface FadeRenderContext {
  ctx: CanvasRenderingContext2D;
  theme: CanvasTheme;
  layout: GraphLayoutController;
  zoom: number;
  manualNodePositions: Map<string, { x: number; y: number }>;
  manualClusterPositions: Map<string, { x: number; y: number }>;
  getPathForNode: (node: GraphNode) => Path2D;
}

/**
 * Renders nodes that are fading out after removal. Mutates the fadingOutNodes map
 * by removing entries whose animation has completed.
 */
export function renderFadingNodes(
  renderCtx: FadeRenderContext,
  fadingOutNodes: Map<string, FadingNode>,
): void {
  if (fadingOutNodes.size === 0) return;

  const { ctx, theme, layout, zoom, getPathForNode } = renderCtx;
  const now = performance.now();
  const toRemove: string[] = [];

  for (const [nodeId, { node, startTime }] of fadingOutNodes) {
    const elapsed = now - startTime;
    if (elapsed >= FADE_OUT_DURATION) {
      toRemove.push(nodeId);
      continue;
    }

    const alpha = 1 - elapsed / FADE_OUT_DURATION;
    const clusterId = node.project || 'External';
    const pos = resolveNodeWorldPosition(
      nodeId,
      clusterId,
      layout,
      renderCtx.manualNodePositions,
      renderCtx.manualClusterPositions,
    );
    if (!pos) {
      toRemove.push(nodeId);
      continue;
    }

    const { x, y } = pos;
    const size = getNodeSize(node);

    ctx.globalAlpha = alpha * 0.5;
    const color = adjustColorForZoom(getNodeTypeColorFromTheme(node.type, theme), zoom);
    const scale = (size / 12) * 1.0;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const path = getPathForNode(node);
    ctx.fillStyle = theme.tooltipBg;
    ctx.fill(path);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 / scale;
    ctx.stroke(path);
    ctx.restore();
  }

  for (const id of toRemove) {
    fadingOutNodes.delete(id);
  }

  ctx.globalAlpha = 1.0;
}
