/**
 * Layout Module
 *
 * Exports the main layout engine and configuration.
 * Retains backward compatibility for cluster analysis tools.
 */
import { NodeRole } from '@shared/schemas/cluster.types';
import { computeHierarchicalLayout as computeEngine } from './engine';
export { analyzeCluster, determineRole, identifyAnchors, } from './cluster-analysis';
export { arrangeClusterGrid, groupIntoClusters } from './cluster-grouping';
export * from './config';
export * from './types';
/**
 * Role-based Z-axis offsets (solar system depth model)
 * Preserved for backward compatibility via the default adapter below.
 */
const ROLE_Z_OFFSET = {
    [NodeRole.Entry]: -100,
    [NodeRole.InternalFramework]: +50,
    [NodeRole.InternalLib]: +20,
    [NodeRole.Utility]: 0,
    [NodeRole.Test]: -100,
    [NodeRole.Tool]: -100,
};
/**
 * Main layout computation function.
 * Wraps the core engine with default Role-based Z-offset logic.
 *
 * NOTE: This is now ASYNCHRONOUS as it uses ELK.
 */
export async function computeHierarchicalLayout(nodes, edges, clusters, opts = {}) {
    // Pre-compute role map for performance
    const nodeRoles = new Map();
    for (const cluster of clusters) {
        if (!cluster.metadata)
            continue;
        for (const [nodeId, meta] of cluster.metadata) {
            if (meta.role) {
                nodeRoles.set(nodeId, meta.role);
            }
        }
    }
    // Inject default Z-offset resolver if not present
    const options = {
        ...opts,
        getNodeZOffset: opts.getNodeZOffset ??
            ((nodeId) => {
                const role = nodeRoles.get(nodeId);
                return role ? (ROLE_Z_OFFSET[role] ?? 0) : 0;
            }),
    };
    return computeEngine(nodes, edges, clusters, options);
}
//# sourceMappingURL=index.js.map