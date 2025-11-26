import type { GraphEdge, GraphNode } from '../data/mockGraphData';

/**
 * Service layer for graph operations and queries
 */

/**
 * Get all nodes connected to a given node (dependencies and dependents)
 */
export function getConnectedNodes(
  nodeId: string,
  edges: GraphEdge[],
): { dependencies: string[]; dependents: string[] } {
  const dependencies = edges.filter((e) => e.source === nodeId).map((e) => e.target);

  const dependents = edges.filter((e) => e.target === nodeId).map((e) => e.source);

  return { dependencies, dependents };
}

/**
 * Find all nodes in a dependency chain (transitive dependencies)
 */
export function findDependencyChain(
  nodeId: string,
  edges: GraphEdge[],
  maxDepth: number = Infinity,
): Set<string> {
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;

    if (visited.has(id) || depth > maxDepth) continue;
    visited.add(id);

    // Find direct dependencies
    const deps = edges.filter((e) => e.source === id).map((e) => e.target);

    deps.forEach((depId) => {
      if (!visited.has(depId)) {
        queue.push({ id: depId, depth: depth + 1 });
      }
    });
  }

  return visited;
}

/**
 * Find all nodes that depend on a given node (transitive dependents)
 */
export function findDependentsChain(
  nodeId: string,
  edges: GraphEdge[],
  maxDepth: number = Infinity,
): Set<string> {
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;

    if (visited.has(id) || depth > maxDepth) continue;
    visited.add(id);

    // Find direct dependents
    const dependents = edges.filter((e) => e.target === id).map((e) => e.source);

    dependents.forEach((depId) => {
      if (!visited.has(depId)) {
        queue.push({ id: depId, depth: depth + 1 });
      }
    });
  }

  return visited;
}

/**
 * Check if there's a path between two nodes
 */
export function hasPath(fromId: string, toId: string, edges: GraphEdge[]): boolean {
  const visited = new Set<string>();
  const queue = [fromId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (currentId === toId) return true;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const deps = edges.filter((e) => e.source === currentId).map((e) => e.target);

    deps.forEach((depId) => {
      if (!visited.has(depId)) {
        queue.push(depId);
      }
    });
  }

  return false;
}

/**
 * Detect circular dependencies
 */
export function findCircularDependencies(nodes: GraphNode[], edges: GraphEdge[]): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(nodeId: string, path: string[]): void {
    visited.add(nodeId);
    recStack.add(nodeId);
    path.push(nodeId);

    const deps = edges.filter((e) => e.source === nodeId).map((e) => e.target);

    for (const depId of deps) {
      if (!visited.has(depId)) {
        dfs(depId, [...path]);
      } else if (recStack.has(depId)) {
        // Found a cycle
        const cycleStart = path.indexOf(depId);
        const cycle = path.slice(cycleStart);
        cycles.push([...cycle, depId]);
      }
    }

    recStack.delete(nodeId);
  }

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  });

  return cycles;
}

/**
 * Get graph statistics
 */
export function getGraphStats(
  nodes: GraphNode[],
  edges: GraphEdge[],
): {
  totalNodes: number;
  totalEdges: number;
  avgDependencies: number;
  maxDependencies: number;
  isolatedNodes: number;
} {
  const depCounts = new Map<string, number>();

  nodes.forEach((node) => depCounts.set(node.id, 0));
  edges.forEach((edge) => {
    depCounts.set(edge.source, (depCounts.get(edge.source) || 0) + 1);
  });

  const counts = Array.from(depCounts.values());
  const totalDeps = counts.reduce((sum, c) => sum + c, 0);
  const avgDeps = nodes.length > 0 ? totalDeps / nodes.length : 0;
  const maxDeps = Math.max(0, ...counts);
  const isolated = counts.filter((c) => c === 0).length;

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    avgDependencies: avgDeps,
    maxDependencies: maxDeps,
    isolatedNodes: isolated,
  };
}
