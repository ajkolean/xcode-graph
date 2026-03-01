/**
 * Graph Analysis Service
 *
 * Provides algorithms for analyzing graph structure, such as finding paths and cycles.
 * Stateless service that operates on GraphDataService.
 */

import type { GraphDataService } from './graph-data-service';

export const GraphAnalysisService = {
  /**
   * Check if there's a path between two nodes
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
   * Detect circular dependencies in the graph
   */
  findCircularDependencies(service: GraphDataService): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const path: string[] = [];

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
