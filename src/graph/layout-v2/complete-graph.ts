/**
 * Simple circular layout - NO force simulation
 */

export interface Node {
  id: string;
  radius: number;
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export interface LayoutOptions {
  idealDistance?: number;
  iterations?: number;
  maxRadius?: number;
}

/**
 * Arrange nodes in a circle - simple and guaranteed to work
 */
export function layoutCompleteGraph(nodes: Node[], options: LayoutOptions = {}): NodePosition[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) return [{ id: nodes[0]!.id, x: 0, y: 0 }];

  const SPACING = options.idealDistance ?? 40;

  // Arrange in circle
  const radius = options.maxRadius ?? (nodes.length * SPACING) / (2 * Math.PI);

  return nodes.map((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    return {
      id: node.id,
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  });
}
