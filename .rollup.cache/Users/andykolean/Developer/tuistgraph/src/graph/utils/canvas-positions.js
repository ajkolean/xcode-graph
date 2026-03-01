/** Shared position resolution utilities for canvas renderers */
/**
 * Resolve a node's world position by combining layout position with manual overrides.
 * Returns null if the node or its cluster has no layout position.
 */
export function resolveNodeWorldPosition(nodeId, clusterId, layout, manualNodePositions, manualClusterPositions) {
    const layoutPos = layout.nodePositions.get(nodeId);
    const layoutClusterPos = layout.clusterPositions.get(clusterId);
    if (!layoutPos || !layoutClusterPos)
        return null;
    const manualClusterPos = manualClusterPositions.get(clusterId);
    const clusterX = manualClusterPos?.x ?? layoutClusterPos.x;
    const clusterY = manualClusterPos?.y ?? layoutClusterPos.y;
    const manualPos = manualNodePositions.get(nodeId);
    return {
        x: clusterX + (manualPos?.x ?? layoutPos.x),
        y: clusterY + (manualPos?.y ?? layoutPos.y),
    };
}
/**
 * Resolve a cluster's world position with manual override.
 */
export function resolveClusterPosition(clusterId, layoutPos, manualClusterPositions) {
    const manual = manualClusterPositions.get(clusterId);
    return { x: manual?.x ?? layoutPos.x, y: manual?.y ?? layoutPos.y };
}
//# sourceMappingURL=canvas-positions.js.map