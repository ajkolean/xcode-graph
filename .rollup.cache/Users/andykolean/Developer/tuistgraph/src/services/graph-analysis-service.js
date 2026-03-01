/**
 * Graph Analysis Service
 *
 * Provides algorithms for analyzing graph structure, such as finding paths and cycles.
 * Stateless service that operates on GraphDataService.
 */
export const GraphAnalysisService = {
    /**
     * Check if there's a path between two nodes
     */
    hasPath(service, fromId, toId) {
        const visited = new Set();
        const queue = [fromId];
        while (queue.length > 0) {
            const currentId = queue.shift();
            if (!currentId)
                break;
            if (currentId === toId)
                return true;
            if (visited.has(currentId))
                continue;
            visited.add(currentId);
            const deps = service.getDirectDependencies(currentId);
            for (const dep of deps) {
                if (!visited.has(dep.id)) {
                    queue.push(dep.id);
                }
            }
        }
        return false;
    },
    /**
     * Detect circular dependencies in the graph
     */
    findCircularDependencies(service) {
        const cycles = [];
        const visited = new Set();
        const recStack = new Set();
        const dfs = (nodeId, path) => {
            visited.add(nodeId);
            recStack.add(nodeId);
            path.push(nodeId);
            const deps = service.getDirectDependencies(nodeId);
            for (const dep of deps) {
                if (!visited.has(dep.id)) {
                    dfs(dep.id, [...path]);
                }
                else if (recStack.has(dep.id)) {
                    // Found a cycle
                    const cycleStart = path.indexOf(dep.id);
                    const cycle = path.slice(cycleStart);
                    cycles.push([...cycle, dep.id]);
                }
            }
            recStack.delete(nodeId);
        };
        service.getAllNodes().forEach((node) => {
            if (!visited.has(node.id)) {
                dfs(node.id, []);
            }
        });
        return cycles;
    },
};
//# sourceMappingURL=graph-analysis-service.js.map