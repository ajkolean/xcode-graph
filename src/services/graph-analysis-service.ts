/**
 * Graph Analysis Service
 *
 * Provides algorithms for analyzing graph structure, such as finding paths and cycles.
 * Stateless service that operates on GraphDataService.
 */

import type { GraphDataService } from './graph-data-service';

/**
 * Provides algorithms for analyzing graph structure, such as finding paths and cycles.
 * Stateless service that operates on GraphDataService.
 *
 * @public
 */
export const GraphAnalysisService = {
  /**
   * Check if there is a directed path from one node to another via BFS.
   *
   * @param service - Graph data service to query
   * @param fromId - Starting node ID
   * @param toId - Destination node ID
   * @returns `true` if a path exists from `fromId` to `toId`
   */
  hasPath(service: GraphDataService, fromId: string, toId: string): boolean {
    const visited = new Set<string>();
    const queue = [fromId];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) break;

      if (currentId === toId) return true;
      if (visited.has(currentId)) continue;
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
   * Detect circular dependencies in the graph using DFS with a recursion stack.
   *
   * @param service - Graph data service to query
   * @returns Array of cycles, where each cycle is a list of node IDs forming the loop
   */
  findCircularDependencies(service: GraphDataService): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const path: string[] = [];

    /** Recursively traverses the graph via DFS, tracking the current path to detect back-edges (cycles). */
    const dfs = (nodeId: string): void => {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      const deps = service.getDirectDependencies(nodeId);

      for (const dep of deps) {
        if (!visited.has(dep.id)) {
          dfs(dep.id);
        } else if (recStack.has(dep.id)) {
          // Found a cycle
          const cycleStart = path.indexOf(dep.id);
          const cycle = path.slice(cycleStart);
          cycles.push([...cycle, dep.id]);
        }
      }

      path.pop();
      recStack.delete(nodeId);
    };

    service.getAllNodes().forEach((node) => {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    });

    return cycles;
  },
} as const;
