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

  // Indices for O(1) lookups
  private nodesByType: Map<string, GraphNode[]> = new Map();
  private nodesByProject: Map<string, GraphNode[]> = new Map();
  private nodesByPlatform: Map<string, GraphNode[]> = new Map();
  private nodesByOrigin: Map<string, GraphNode[]> = new Map();

  private outgoingEdges: Map<string, GraphEdge[]> = new Map();
  private incomingEdges: Map<string, GraphEdge[]> = new Map();

  // Cached Sets
  private projects: Set<string> = new Set();
  private packages: Set<string> = new Set();

  constructor(nodes: GraphNode[], edges: GraphEdge[]) {
    this.nodes = nodes;
    this.edges = edges;

    // Create lookup maps for O(1) access
    this.nodeMap = new Map(nodes.map((n) => [n.id, n]));
    this.edgeMap = new Map(edges.map((e) => [`${e.source}->${e.target}`, e]));

    this.buildIndices();
  }

  private buildIndices() {
    for (const node of this.nodes) {
      // Type index
      if (!this.nodesByType.has(node.type)) this.nodesByType.set(node.type, []);
      this.nodesByType.get(node.type)!.push(node);

      // Project index & Set
      if (node.project) {
        this.projects.add(node.project);
        if (!this.nodesByProject.has(node.project)) this.nodesByProject.set(node.project, []);
        this.nodesByProject.get(node.project)!.push(node);
      }

      // Platform index
      if (node.platform) {
        if (!this.nodesByPlatform.has(node.platform)) this.nodesByPlatform.set(node.platform, []);
        this.nodesByPlatform.get(node.platform)!.push(node);
      }

      // Origin index
      if (node.origin) {
        if (!this.nodesByOrigin.has(node.origin)) this.nodesByOrigin.set(node.origin, []);
        this.nodesByOrigin.get(node.origin)!.push(node);
      }

      // Packages Set
      if (node.type === 'package') {
        this.packages.add(node.name);
      }
    }

    for (const edge of this.edges) {
      // Outgoing
      if (!this.outgoingEdges.has(edge.source)) this.outgoingEdges.set(edge.source, []);
      this.outgoingEdges.get(edge.source)!.push(edge);

      // Incoming
      if (!this.incomingEdges.has(edge.target)) this.incomingEdges.set(edge.target, []);
      this.incomingEdges.get(edge.target)!.push(edge);
    }
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
    return this.nodesByType.get(type) || [];
  }

  /**
   * Get nodes by project
   */
  getNodesByProject(project: string): GraphNode[] {
    return this.nodesByProject.get(project) || [];
  }

  /**
   * Get nodes by platform
   */
  getNodesByPlatform(platform: string): GraphNode[] {
    return this.nodesByPlatform.get(platform) || [];
  }

  /**
   * Get nodes by origin
   */
  getNodesByOrigin(origin: 'local' | 'external'): GraphNode[] {
    return this.nodesByOrigin.get(origin) || [];
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
    return this.outgoingEdges.get(nodeId) || [];
  }

  /**
   * Get incoming edges to a node (dependents)
   */
  getIncomingEdges(nodeId: string): GraphEdge[] {
    return this.incomingEdges.get(nodeId) || [];
  }

  /**
   * Get all edges for a node (both directions)
   */
  getNodeEdges(nodeId: string): GraphEdge[] {
    const outgoing = this.getOutgoingEdges(nodeId);
    const incoming = this.getIncomingEdges(nodeId);
    return [...outgoing, ...incoming];
  }

  // ==================== Dependency Operations ====================

  /**
   * Get direct dependencies of a node
   */
  getDirectDependencies(nodeId: string): GraphNode[] {
    const outgoing = this.getOutgoingEdges(nodeId);
    const depIds = outgoing.map((e) => e.target);
    return depIds.map((id) => this.nodeMap.get(id)).filter((n): n is GraphNode => n !== undefined);
  }

  /**
   * Get direct dependents of a node
   */
  getDirectDependents(nodeId: string): GraphNode[] {
    const incoming = this.getIncomingEdges(nodeId);
    const depIds = incoming.map((e) => e.source);
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
    // Optimization: use indices
    const projectNodes = (this.nodesByProject.get(clusterId) || []).filter(
      (n) => n.type !== 'package',
    );
    const packageNodes = (this.nodesByType.get('package') || []).filter((n) => n.name === clusterId);

    return [...projectNodes, ...packageNodes];
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
    return this.projects;
  }

  /**
   * Get all unique packages
   */
  getAllPackages(): Set<string> {
    return this.packages;
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

    // Optimization: Use index for edge lookup?
    // We need dependencies where source is in clusterNodeIds and target is NOT (usually)
    // But the original implementation just counted "edges where source is in cluster".
    // Let's stick to the original logic but use indices?
    // Original: this.edges.filter((e) => clusterNodeIds.has(e.source)).length;
    // Optimized: sum of getOutgoingEdges(nodeId).length for all nodes in cluster

    let dependencies = 0;
    for (const node of clusterNodes) {
      dependencies += this.getOutgoingEdges(node.id).length;
    }

    // Original: this.edges.filter((e) => clusterNodeIds.has(e.target)).length;
    // Optimized: sum of getIncomingEdges(nodeId).length for all nodes in cluster
    let dependents = 0;
    for (const node of clusterNodes) {
      dependents += this.getIncomingEdges(node.id).length;
    }

    const platforms = new Set(clusterNodes.map((n) => n.platform).filter(Boolean));

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

      // Optimized: use getDirectDependencies which uses indices
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
    // Optimized: calculate from indices
    const depCounts = new Map<string, number>();

    for (const node of this.nodes) {
      // Default to 0
      depCounts.set(node.id, 0);
    }
    
    // Iterate incoming edges map to count dependencies (wait, dependency count usually refers to OUTGOING edges, i.e. "I depend on X")
    // Original code:
    // for (const edge of this.edges) {
    //   depCounts.set(edge.source, (depCounts.get(edge.source) || 0) + 1);
    // }
    // This counts OUTGOING edges from source. Correct.

    for (const [sourceId, edges] of this.outgoingEdges) {
        depCounts.set(sourceId, edges.length);
    }

    const counts = Array.from(depCounts.values());
    const totalDeps = counts.reduce((sum, c) => sum + c, 0);
    const avgDeps = this.nodes.length > 0 ? totalDeps / this.nodes.length : 0;
    const maxDeps = Math.max(0, ...counts);
    // Isolated means no incoming or outgoing edges
    const isolated = this.nodes.filter((node) => {
      const outgoing = this.outgoingEdges.get(node.id)?.length ?? 0;
      const incoming = this.incomingEdges.get(node.id)?.length ?? 0;
      return outgoing === 0 && incoming === 0;
    }).length;

    return {
      totalNodes: this.nodes.length,
      totalEdges: this.edges.length,
      avgDependencies: avgDeps,
      maxDependencies: maxDeps,
      isolatedNodes: isolated,
    };
  }
}
