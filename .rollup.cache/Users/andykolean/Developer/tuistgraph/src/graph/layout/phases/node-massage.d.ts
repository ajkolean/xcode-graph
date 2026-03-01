import type { LayoutConfig } from '../config';
import type { MicroLayoutResult } from './micro-layout';
/**
 * Apply a gentle force-directed "massage" to nodes within a cluster.
 * This runs after the main "Solar System" layout to improve spacing
 * and resolve any local congestions while preserving the overall structure.
 */
export declare function applyNodeMassage(micro: MicroLayoutResult, config: LayoutConfig): MicroLayoutResult;
