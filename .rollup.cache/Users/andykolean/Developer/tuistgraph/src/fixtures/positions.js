/**
 * Position fixtures for layout tests
 */
/**
 * Create node positions in a circle
 */
export function createCircularPositions(nodeIds, radius = 100) {
    return nodeIds.map((id, index) => {
        const angle = (2 * Math.PI * index) / nodeIds.length;
        return {
            id,
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
            ring: 1,
        };
    });
}
/**
 * Create node positions at origin
 */
export function createCenteredPositions(nodeIds) {
    return nodeIds.map((id) => ({ id, x: 0, y: 0, ring: 0 }));
}
//# sourceMappingURL=positions.js.map