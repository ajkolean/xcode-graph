import type { ClusterPosition } from '@shared/schemas';
import type { ClusterGraph } from '../cluster-graph';
import type { LayoutConfig } from '../config';
import type { MicroLayoutResult } from './micro-layout';
/**
 * Compute macro-layout (inter-cluster) using ELK Layered algorithm
 * "Tectonic Plates" stage
 */
export declare function computeMacroLayout(clusterGraph: ClusterGraph, microLayouts: Map<string, MicroLayoutResult>, config: LayoutConfig): Promise<Map<string, ClusterPosition>>;
