import type { ClusterPosition } from '@shared/schemas';
import ELK, { type ElkExtendedEdge, type ElkNode } from 'elkjs/lib/elk.bundled.js';
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
  config: LayoutConfig,
): Promise<Map<string, ClusterPosition>> {
  const elk = new ELK();

  // 1. Build ELK Graph (Clusters as Atomic Nodes)
  const children: ElkNode[] = [];

  for (const cluster of clusterGraph.nodes) {
    const micro = microLayouts.get(cluster.id);

    // Determine hierarchy handling: cluster override > global config
    const hierarchyHandling = cluster.elkOptions?.hierarchyHandling ?? config.elkHierarchyHandling;

    children.push({
      id: cluster.id,
      // Dimensions fixed by Micro Layout
      width: micro?.width ?? config.minClusterSize,
      height: micro?.height ?? config.minClusterSize,
      // ELK options for cluster placement
      layoutOptions: {
        'org.eclipse.elk.nodeLabels.placement': 'OUTSIDE V_TOP H_CENTER',
        'elk.hierarchyHandling': hierarchyHandling,
      },
    });
  }
  const edges: ElkExtendedEdge[] = clusterGraph.edges.map((e) => ({
    id: `e_${e.source}_${e.target}`,
    sources: [e.source],
    targets: [e.target],
    layoutOptions: {
      // Prioritize high-weight edges for direction (cycle breaking) and shortness (layering)
      'elk.layered.priority.direction': String(Math.min(10, 1 + Math.log2(e.weight ?? 1))),
      'elk.layered.priority.shortness': String(Math.min(10, 1 + Math.log2(e.weight ?? 1))),
      'elk.edge.thickness': String(1 + Math.log2(e.weight ?? 1)),
    },
  }));

  // Fixed large width to ensure ELK doesn't constrain itself unnecessarily
  const elkWidthHint = 10000;

  // Decoupled packing width: Use a dynamic width for manual packing
  // This allows the compaction to grow horizontally with the ELK hint
  const packMaxWidth = elkWidthHint; // Match ELK's hint for compaction

  const root: ElkNode = {
    id: 'root',
    width: elkWidthHint, // Hint to ELK
    height: config.elkMaxHeight, // Hint for vertical space
    children,
    edges,
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': config.elkDirection, // DOWN or RIGHT
      'elk.spacing.nodeNode': String(config.elkNodeSpacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(config.elkLayerSpacing),
      'elk.edgeRouting': 'POLYLINE', // Avoid "bus lanes"
      'elk.hierarchyHandling': config.elkHierarchyHandling,

      // Wrapping configuration
      'elk.layered.wrapping.strategy': 'SINGLE_EDGE',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',

      // Force ELK to try to keep layers narrow to aid aspect ratio
      'elk.layered.layering.strategy': 'MIN_WIDTH',
      'elk.layered.layering.minWidth.upperBoundOnWidth': String(elkWidthHint),

      // Generate explicit layer IDs for stable post-processing
      'org.eclipse.elk.layered.generatePositionAndLayerIds': 'true',
    },
  };

  // 2. Run Layout
  const layout = await elk.layout(root);

  // 3. Post-Compaction & Centering
  if (layout.children) {
    // Group by Layer ID (from ELK) or Y-band (fallback)
    const bands = new Map<number, ElkNode[]>();
    const ySnap = config.elkLayerSpacing;

    for (const node of layout.children) {
      // Try to read explicit layer ID first
      let bandIndex = (node as any)['org.eclipse.elk.layered.layering.layerId'];

      if (typeof bandIndex !== 'number') {
        // Fallback to Y quantization
        const cy = (node.y ?? 0) + (node.height ?? 0) / 2;
        bandIndex = Math.floor(cy / ySnap);
      }

      if (!bands.has(bandIndex)) bands.set(bandIndex, []);
      bands.get(bandIndex)!.push(node);
    }

    // Sort bands by Index to place them sequentially
    const sortedBands = Array.from(bands.entries()).sort((a, b) => a[0] - b[0]);

    // Start cursor at the first band's original Y (or 0)
    let yCursor = 0;
    if (sortedBands.length > 0) {
      // If using Y-fallback, use original Y. If using IDs, use 0 or previous.
      // Let's reset to 0 to ensure clean stacking, or keep original Y offset?
      // Safest: Use layout children[0].y as starting point?
      // Or just 0. ELK gives relative coords.
      // Let's use 0 to pack tightly from top.
      yCursor = 0;
    }

    for (const [_, nodes] of sortedBands) {
      // Preserve ELK's X-order (or use positionId if available)
      nodes.sort((a, b) => {
        const posA = (a as any)['org.eclipse.elk.layered.crossingMinimization.positionId'];
        const posB = (b as any)['org.eclipse.elk.layered.crossingMinimization.positionId'];
        if (typeof posA === 'number' && typeof posB === 'number') {
          return posA - posB;
        }
        return (a.x ?? 0) - (b.x ?? 0);
      });

      const spacing = config.elkNodeSpacing;
      // Use stable packing width to prevent drift
      const maxWidth = packMaxWidth;

      // Organize into rows (wrapping)
      const rows: ElkNode[][] = [[]];
      let currentRowWidth = 0;

      for (const node of nodes) {
        // Use Effective Diameter for consistent wrapping/packing logic
        // Visual diameter = max(w,h) + buffer(60)
        const wEff = Math.max(node.width ?? 100, node.height ?? 100) + 60;

        // Accurate wrapping check using wEff
        const nextWidth =
          rows[rows.length - 1]!.length === 0 ? wEff : currentRowWidth + spacing + wEff;

        if (nextWidth > maxWidth && rows[rows.length - 1]!.length > 0) {
          rows.push([]);
          currentRowWidth = wEff;
        } else {
          currentRowWidth = nextWidth;
        }
        rows[rows.length - 1]!.push(node);
      }

      // Layout rows sequentially starting from yCursor
      let currentY = yCursor;

      for (const row of rows) {
        // Compute max height in this row for vertical spacing
        const maxRowH = row.reduce((max, n) => Math.max(max, n.height ?? 100), 0);

        // Define gaps explicitly
        const rowGap = 100; // Gap between sub-rows in same band

        // Compute layout using circular bounds for safety
        const rowItems = row.map((n) => ({
          node: n,
          // Use same wEff radius logic
          r: (Math.max(n.width ?? 0, n.height ?? 0) + 60) / 2,
        }));

        const totalWidth = rowItems.reduce((sum, item, i) => {
          // Diameter + Spacing (except last)
          return sum + item.r * 2 + (i < rowItems.length - 1 ? spacing : 0);
        }, 0);

        // Start X so the row is centered at 0
        let currentCX = -totalWidth / 2 + (rowItems[0]?.r ?? 0);

        for (let i = 0; i < rowItems.length; i++) {
          const { node, r } = rowItems[i]!;
          node.x = currentCX - (node.width ?? 0) / 2;
          // Center vertically on the current sub-row Y
          node.y = currentY - (node.height ?? 0) / 2;

          if (i < rowItems.length - 1) {
            const nextR = rowItems[i + 1]!.r;
            currentCX += r + spacing + nextR;
          }
        }
        // Advance Y for next ROW (use smaller gap)
        currentY += maxRowH + rowGap;
      }

      // Advance cursor for next BAND
      // Use bandGap to separate strata
      yCursor = currentY + (config.elkLayerSpacing - 100);
    }
  }

  // 4. Extract Positions
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
