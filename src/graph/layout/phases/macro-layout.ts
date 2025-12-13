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
            // ELK options for cluster placement
            layoutOptions: {
              'org.eclipse.elk.nodeLabels.placement': 'OUTSIDE V_TOP H_CENTER',
            },
          });
        }
  const edges: ElkExtendedEdge[] = clusterGraph.edges.map(e => ({
    id: `e_${e.source}_${e.target}`,
    sources: [e.source],
    targets: [e.target],
    layoutOptions: {
      // Prioritize high-weight edges
      'elk.priority': String(Math.min(10, 1 + Math.log2(e.weight ?? 1))),
      'elk.edge.thickness': String(1 + Math.log2(e.weight ?? 1)),
    },
  }));

  // Dynamically calculate width based on AREA heuristic (more stable than sum widths)
  // Packing efficiency ~60%
  const totalArea = children.reduce((sum, c) => sum + (c.width ?? 0) * (c.height ?? 0), 0);
  const targetAspect = 1.6;
  const areaWidth = Math.sqrt(totalArea * targetAspect / 0.6) + 1000;
  const elkWidthHint = Math.max(config.elkMaxWidth, areaWidth);

  // Decoupled packing width: ELK gets freedom, but we force structure
  const packMaxWidth = 2500; 

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
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      
      // Wrapping configuration
      'elk.layered.wrapping.strategy': 'SINGLE_EDGE',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    },
  };

  // 2. Run Layout
  const layout = await elk.layout(root);

  // 3. Post-Compaction & Centering
  if (layout.children) {
    // Group by Y-band using layer spacing as quantization
    const bands = new Map<number, ElkNode[]>();
    const ySnap = config.elkLayerSpacing; 
    
    for (const node of layout.children) {
      const cy = (node.y ?? 0) + (node.height ?? 0) / 2;
      // Quantize to nearest layer grid (Floor ensures gravity down)
      const bandY = Math.floor(cy / ySnap) * ySnap;
      if (!bands.has(bandY)) bands.set(bandY, []);
      bands.get(bandY)!.push(node);
    }

    // Sort bands by Y to place them sequentially (preventing overlap)
    const sortedBands = Array.from(bands.entries()).sort((a, b) => a[0] - b[0]);
    
    // Start cursor at the first band's original Y (or 0)
    let yCursor = sortedBands.length > 0 ? sortedBands[0]![0] : 0;

    for (const [_, nodes] of sortedBands) {
      // Preserve ELK's X-order
      nodes.sort((a, b) => (a.x ?? 0) - (b.x ?? 0));

      const spacing = config.elkNodeSpacing;
      // Use stable packing width to prevent drift
      const maxWidth = packMaxWidth;
      
      // Organize into rows (wrapping)
      const rows: ElkNode[][] = [[]];
      let currentRowWidth = 0;
      
      for (const node of nodes) {
        const w = node.width ?? 100;
        // Accurate wrapping check
        const nextWidth = rows[rows.length - 1]!.length === 0 
          ? w 
          : currentRowWidth + spacing + w;

        if (nextWidth > maxWidth && rows[rows.length - 1]!.length > 0) {
          rows.push([]);
          currentRowWidth = w;
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
        const bandGap = config.elkLayerSpacing; // Gap between strata bands

        // Compute layout using circular bounds for safety
        const rowItems = row.map(n => ({ 
          node: n, 
          // Visual radius (approx half max dim) + Label/Border Buffer (30px)
          r: Math.max(n.width ?? 0, n.height ?? 0) / 2 + 30
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
      
      // Advance cursor for next BAND: Current Y points to start of next row.
      // Add extra padding to separate from next stratum.
      // But currentY already includes rowGap. 
      // Let's ensure minimum band gap.
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
