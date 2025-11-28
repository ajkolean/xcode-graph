/**
 * Graph Data Service - centralized data access layer
 * Provides single source of truth for all graph data operations
 */

import type { GraphEdge, GraphNode } from '../data/mockGraphData';
import type { Cluster } from '../types/cluster';

export class GraphDataService {
  private nodes: GraphNode[];
  private edges: GraphEdge[];
  private nodeMap: Map<string, GraphNode>;
  private edgeMap: Map<string, GraphEdge>;

  constructor(nodes: GraphNode[], edges: GraphEdge[]) {
    this.nodes = nodes;
    this.edges = edges;

    // Create lookup maps for O(1) access
    this.nodeMap = new Map(nodes.map((n) => [n.id, n]));
    this.edgeMap = new Map(edges.map((e) => [`${e.source}->${e.target}`, e]));
  }

  // ==================== Node Operations ====================

  /**
   * Get all nodes
   */
  getAllNodes(): GraphNode[] {
    return this.nodes;
  }

  /**
   * Get node by ID
   */
  getNodeById(id: string): GraphNode | undefined {
    return this.nodeMap.get(id);
  }

  /**
   * Get nodes by type
   */
  getNodesByType(type: string): GraphNode[] {
    return this.nodes.filter((n) => n.type === type);
  }

  /**
   * Get nodes by project
   */
  getNodesByProject(project: string): GraphNode[] {
    return this.nodes.filter((n) => n.project === project);
  }

  /**
   * Get nodes by platform
   */
  getNodesByPlatform(platform: string): GraphNode[] {
    return this.nodes.filter((n) => n.platforms?.includes(platform));
  }

  /**
   * Get nodes by origin
   */
  getNodesByOrigin(origin: 'local' | 'external'): GraphNode[] {
    return this.nodes.filter((n) => n.origin === origin);
  }

  /**
   * Search nodes by name
   */
  searchNodes(query: string): GraphNode[] {
    const lowerQuery = query.toLowerCase();
    return this.nodes.filter(
      (n) =>
        n.name.toLowerCase().includes(lowerQuery) || n.project?.toLowerCase().includes(lowerQuery),
    );
  }

  // ==================== Edge Operations ====================

  /**
   * Get all edges
   */
  getAllEdges(): GraphEdge[] {
    return this.edges;
  }

  /**
   * Get edge by source and target
   */
  getEdge(source: string, target: string): GraphEdge | undefined {
    return this.edgeMap.get(`${source}->${target}`);
  }

  /**
   * Get outgoing edges from a node (dependencies)
   */
  getOutgoingEdges(nodeId: string): GraphEdge[] {
    return this.edges.filter((e) => e.source === nodeId);
  }

  /**
   * Get incoming edges to a node (dependents)
   */
  getIncomingEdges(nodeId: string): GraphEdge[] {
    return this.edges.filter((e) => e.target === nodeId);
  }

  /**
   * Get all edges for a node (both directions)
   */
  getNodeEdges(nodeId: string): GraphEdge[] {
    return this.edges.filter((e) => e.source === nodeId || e.target === nodeId);
  }

  // ==================== Dependency Operations ====================

  /**
   * Get direct dependencies of a node
   */
  getDirectDependencies(nodeId: string): GraphNode[] {
    const depIds = this.edges.filter((e) => e.source === nodeId).map((e) => e.target);

    return depIds.map((id) => this.nodeMap.get(id)).filter((n): n is GraphNode => n !== undefined);
  }

  /**
   * Get direct dependents of a node
   */
  getDirectDependents(nodeId: string): GraphNode[] {
    const depIds = this.edges.filter((e) => e.target === nodeId).map((e) => e.source);

    return depIds.map((id) => this.nodeMap.get(id)).filter((n): n is GraphNode => n !== undefined);
  }

  /**
   * Get transitive dependencies (all levels)
   */
  getTransitiveDependencies(nodeId: string): {
    nodes: Set<string>;
    edges: Set<string>;
    depths: Map<string, number>;
  } {
    const visited = new Set<string>([nodeId]);
    const edges = new Set<string>();
    const depths = new Map<string, number>();
    const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;

      const outgoing = this.getOutgoingEdges(id);

      for (const edge of outgoing) {
        edges.add(`${edge.source}->${edge.target}`);

        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          depths.set(edge.target, depth + 1);
          queue.push({ id: edge.target, depth: depth + 1 });
        }
      }
    }

    return { nodes: visited, edges, depths };
  }

  /**
   * Get transitive dependents (all levels)
   */
  getTransitiveDependents(nodeId: string): {
    nodes: Set<string>;
    edges: Set<string>;
    depths: Map<string, number>;
  } {
    const visited = new Set<string>([nodeId]);
    const edges = new Set<string>();
    const depths = new Map<string, number>();
    const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;

      const incoming = this.getIncomingEdges(id);

      for (const edge of incoming) {
        edges.add(`${edge.source}->${edge.target}`);

        if (!visited.has(edge.source)) {
          visited.add(edge.source);
          depths.set(edge.source, depth + 1);
          queue.push({ id: edge.source, depth: depth + 1 });
        }
      }
    }

    return { nodes: visited, edges, depths };
  }

  // ==================== Cluster Operations ====================

  /**
   * Get all nodes in a cluster
   */
  getClusterNodes(clusterId: string): GraphNode[] {
    return this.nodes.filter(
      (n) =>
        (n.project === clusterId && n.type !== 'package') ||
        (n.type === 'package' && n.name === clusterId),
    );
  }

  /**
   * Get cluster data by ID
   */
  getCluster(clusterId: string): Cluster | null {
    const clusterNodes = this.getClusterNodes(clusterId);

    if (clusterNodes.length === 0) {
      return null;
    }

    const firstNode = clusterNodes[0];
    const clusterType = firstNode?.type === 'package' ? 'package' : 'project';
    const clusterOrigin = clusterNodes.some((n) => n.origin === 'external') ? 'external' : 'local';

    return {
      id: clusterId,
      name: clusterId,
      type: clusterType,
      origin: clusterOrigin,
      nodes: clusterNodes,
    } as Cluster;
  }

  /**
   * Get all unique projects
   */
  getAllProjects(): Set<string> {
    return new Set(
      this.nodes.map((n) => n.project).filter((p): p is string => p !== undefined && p !== ''),
    );
  }

  /**
   * Get all unique packages
   */
  getAllPackages(): Set<string> {
    return new Set(this.nodes.filter((n) => n.type === 'package').map((n) => n.name));
  }

  // ==================== Statistics ====================

  /**
   * Get node statistics
   */
  getNodeStats(nodeId: string): {
    dependencies: number;
    dependents: number;
    transitiveDeps: number;
    transitiveDependents: number;
  } {
    const deps = this.getDirectDependencies(nodeId);
    const dependents = this.getDirectDependents(nodeId);
    const transitiveDeps = this.getTransitiveDependencies(nodeId);
    const transitiveDependents = this.getTransitiveDependents(nodeId);

    return {
      dependencies: deps.length,
      dependents: dependents.length,
      transitiveDeps: transitiveDeps.nodes.size - 1, // Exclude self
      transitiveDependents: transitiveDependents.nodes.size - 1, // Exclude self
    };
  }

  /**
   * Get cluster statistics
   */
  getClusterStats(clusterId: string): {
    nodeCount: number;
    dependencies: number;
    dependents: number;
    platforms: Set<string>;
  } {
    const clusterNodes = this.getClusterNodes(clusterId);
    const clusterNodeIds = new Set(clusterNodes.map((n) => n.id));

    const dependencies = this.edges.filter((e) => clusterNodeIds.has(e.source)).length;

    const dependents = this.edges.filter((e) => clusterNodeIds.has(e.target)).length;

    const platforms = new Set(clusterNodes.flatMap((n) => n.platforms || []).filter(Boolean));

    return {
      nodeCount: clusterNodes.length,
      dependencies,
      dependents,
      platforms,
    };
  }

  // ==================== Graph Analysis ====================

  /**
   * Check if there's a path between two nodes
   */
  hasPath(fromId: string, toId: string): boolean {
    const visited = new Set<string>();
    const queue = [fromId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (currentId === toId) return true;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const deps = this.getDirectDependencies(currentId);
      
      for (const dep of deps) {
        if (!visited.has(dep.id)) {
          queue.push(dep.id);
        }
      }
    }

    return false;
  }

  /**
   * Detect circular dependencies
   */
  findCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): void => {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      const deps = this.getDirectDependencies(nodeId);

      for (const dep of deps) {
        if (!visited.has(dep.id)) {
          dfs(dep.id, [...path]);
        } else if (recStack.has(dep.id)) {
          // Found a cycle
          const cycleStart = path.indexOf(dep.id);
          const cycle = path.slice(cycleStart);
          cycles.push([...cycle, dep.id]);
        }
      }

      recStack.delete(nodeId);
    };

    this.nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    });

    return cycles;
  }

  /**
   * Get overall graph statistics
   */
  getGraphStats(): {
    totalNodes: number;
    totalEdges: number;
    avgDependencies: number;
    maxDependencies: number;
    isolatedNodes: number;
  } {
    const depCounts = new Map<string, number>();

    for (const node of this.nodes) {
      depCounts.set(node.id, 0);
    }
    for (const edge of this.edges) {
      depCounts.set(edge.source, (depCounts.get(edge.source) || 0) + 1);
    }

    const counts = Array.from(depCounts.values());
    const totalDeps = counts.reduce((sum, c) => sum + c, 0);
    const avgDeps = this.nodes.length > 0 ? totalDeps / this.nodes.length : 0;
    const maxDeps = Math.max(0, ...counts);
    const isolated = counts.filter((c) => c === 0).length;

    return {
      totalNodes: this.nodes.length,
      totalEdges: this.edges.length,
      avgDependencies: avgDeps,
      maxDependencies: maxDeps,
      isolatedNodes: isolated,
    };
  }
}
