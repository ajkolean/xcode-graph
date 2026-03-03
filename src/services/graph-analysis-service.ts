/**
 * Graph Analysis Service
 *
 * Provides algorithms for analyzing graph structure, such as finding paths and cycles.
 * Stateless service that operates on GraphDataService.
 *
 * Backed by graphology for efficient graph traversal.
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
   * Check if there is a directed path from one node to another via BFS
   * using graphology's outNeighbors for adjacency.
   *
   * @param service - Graph data service to query
   * @param fromId - Starting node ID
   * @param toId - Destination node ID
   * @returns `true` if a path exists from `fromId` to `toId`
   */
  hasPath(service: GraphDataService, fromId: string, toId: string): boolean {
    const { graph } = service;
    if (!graph.hasNode(fromId)) return false;

    const visited = new Set<string>();
    const queue = [fromId];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) break;

      if (currentId === toId) return true;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      for (const neighbor of graph.outNeighbors(currentId)) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    return false;
  },

  /**
   * Detect circular dependencies in the graph using DFS with a recursion stack.
   * Uses graphology's outNeighbors for adjacency traversal.
   *
   * @param service - Graph data service to query
   * @returns Array of cycles, where each cycle is a list of node IDs forming the loop
   */
  findCircularDependencies(service: GraphDataService): string[][] {
    const { graph } = service;
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const path: string[] = [];

    /** Recursively traverses the graph via DFS, tracking the current path to detect back-edges (cycles). */
    const dfs = (nodeId: string): void => {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      for (const neighbor of graph.outNeighbors(nodeId)) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        } else if (recStack.has(neighbor)) {
          // Found a cycle
          const cycleStart = path.indexOf(neighbor);
          const cycle = path.slice(cycleStart);
          cycles.push([...cycle, neighbor]);
        }
      }

      path.pop();
      recStack.delete(nodeId);
    };

    graph.forEachNode((nodeId) => {
      if (!visited.has(nodeId)) {
        dfs(nodeId);
      }
    });

    return cycles;
  },
} as const;
