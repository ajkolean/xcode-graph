import type { ClusterPosition } from '@shared/schemas';
import type { ClusterGraph } from '../cluster-graph';
import type { LayoutConfig } from '../config';
/**
 * Apply a short force-directed simulation to "massage" cluster positions.
 * This helps to relax the rigid grid/layer structure from ELK and reduce
 * overlaps or awkward gaps while maintaining the general relative positions.
 */
export declare function applyForceMassage(clusterPositions: Map<string, ClusterPosition>, clusterGraph: ClusterGraph, config: LayoutConfig): Map<string, ClusterPosition>;
//# sourceMappingURL=force-massage.d.ts.map