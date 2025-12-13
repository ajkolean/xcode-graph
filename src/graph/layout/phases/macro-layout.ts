import ELK, { type ElkNode, type ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import type { ClusterPosition } from '@shared/schemas';
import type { ClusterGraph } from '../cluster-graph';
import type { LayoutConfig } from '../config';
import type { MicroLayoutResult } from './micro-layout';

/**
 * Compute macro-layout (inter-cluster) using ELK Layered algorithm
 * "Tectonic Plates" stage
 */
export async function computeMacroLayout(
  clusterGraph: ClusterGraph,
  microLayouts: Map<string, MicroLayoutResult>,
  config: LayoutConfig
): Promise<Map<string, ClusterPosition>> {
  const elk = new ELK();

  // 1. Build ELK Graph (Clusters as Atomic Nodes)
  const children: ElkNode[] = [];
  
  for (const cluster of clusterGraph.nodes) {
    const micro = microLayouts.get(cluster.id);
    children.push({
      id: cluster.id,
      // Dimensions fixed by Micro Layout
      width: micro?.width ?? config.minClusterSize,
      height: micro?.height ?? config.minClusterSize,
      // Add label for ELK to manage spacing
      labels: [{ 
        text: cluster.name || cluster.id,
        width: 100, // Estimate
        height: 20 
      }],
      // ELK options for cluster placement
      layoutOptions: {
        'elk.portConstraints': 'FIXED_SIDE', // Ports on sides
        'org.eclipse.elk.nodeLabels.placement': 'OUTSIDE V_TOP H_CENTER',
      },
    });
  }

  const edges: ElkExtendedEdge[] = clusterGraph.edges.map(e => ({
    id: `e_${e.source}_${e.target}`,
    sources: [e.source],
    targets: [e.target],
    // Pass weight to ELK? ELK Layered doesn't use edge weights for attraction directly in the same way D3 does,
    // but it uses them for crossing minimization and layering.
    // 'priority' might be relevant.
  }));

  const root: ElkNode = {
    id: 'root',
    children,
    edges,
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': config.elkDirection, // DOWN or RIGHT
      'elk.spacing.nodeNode': String(config.elkNodeSpacing * 3), // More spacing between clusters
      'elk.layered.spacing.nodeNodeBetweenLayers': String(config.elkLayerSpacing * 2),
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN', // Though we treat them atomic here
    },
  };

  // 2. Run Layout
  const layout = await elk.layout(root);

  // 3. Extract Positions
  const positions = new Map<string, ClusterPosition>();
  
  if (layout.children) {
    for (const node of layout.children) {
      // ELK returns Top-Left. Convert to Center.
      const cx = (node.x ?? 0) + (node.width ?? 0) / 2;
      const cy = (node.y ?? 0) + (node.height ?? 0) / 2;

      positions.set(node.id, {
        id: node.id,
        x: cx,
        y: cy,
        width: node.width ?? 100,
        height: node.height ?? 100,
        nodeCount: 0, // Will be filled later or irrelevant
        vx: 0, 
        vy: 0,
      });
    }
  }

  return positions;
}
