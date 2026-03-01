import type { Cluster, NodePosition } from '@shared/schemas';
import type { LayoutConfig } from '../config';
export interface MicroLayoutResult {
    clusterId: string;
    width: number;
    height: number;
    relativePositions: Map<string, NodePosition>;
}
/**
 * Compute micro-layout for a single cluster using "Solar System" physics
 */
export declare function computeClusterInterior(cluster: Cluster, config: LayoutConfig): MicroLayoutResult;
