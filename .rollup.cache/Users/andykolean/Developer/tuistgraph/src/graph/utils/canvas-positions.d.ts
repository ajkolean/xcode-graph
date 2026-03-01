/** Shared position resolution utilities for canvas renderers */
import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
/**
 * Resolve a node's world position by combining layout position with manual overrides.
 * Returns null if the node or its cluster has no layout position.
 */
export declare function resolveNodeWorldPosition(nodeId: string, clusterId: string, layout: GraphLayoutController, manualNodePositions: Map<string, {
    x: number;
    y: number;
}>, manualClusterPositions: Map<string, {
    x: number;
    y: number;
}>): {
    x: number;
    y: number;
} | null;
/**
 * Resolve a cluster's world position with manual override.
 */
export declare function resolveClusterPosition(clusterId: string, layoutPos: {
    x: number;
    y: number;
}, manualClusterPositions: Map<string, {
    x: number;
    y: number;
}>): {
    x: number;
    y: number;
};
