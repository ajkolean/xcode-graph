/**
 * Graph Data Service - centralized data access layer
 * Provides single source of truth for all graph data operations
 */

import { bfsTraverseGraph, type TransitiveResult } from '@graph/utils/traversal';
import { type Cluster, ClusterType } from '@shared/schemas';
import { type GraphEdge, type GraphNode, NodeType, Origin } from '@shared/schemas/graph.types';
import { addToMultiMap } from '@shared/utils/collections';

/**
 * Centralized data access layer providing indexed lookups over graph nodes and edges.
 *
 * Builds internal indices on construction for O(1) access by type, project,
 * platform, origin, and edge direction. All query methods are read-only.
 */
export class GraphDataService {
  private readonly nodes: GraphNode[];
  private readonly edges: GraphEdge[];
  private readonly nodeMap: Map<string, GraphNode>;
  private readonly edgeMap: Map<string, GraphEdge>;

  // Indices for O(1) lookups
  private readonly nodesByType: Map<string, GraphNode[]> = new Map();
  private readonly nodesByProject: Map<string, GraphNode[]> = new Map();
  private readonly nodesByPlatform: Map<string, GraphNode[]> = new Map();
  private readonly nodesByOrigin: Map<string, GraphNode[]> = new Map();

  private readonly outgoingEdges: Map<string, GraphEdge[]> = new Map();
  private readonly incomingEdges: Map<string, GraphEdge[]> = new Map();

  // Cached Sets
  private readonly projects: Set<string> = new Set();
  private readonly packages: Set<string> = new Set();

  /**
   * @param nodes - All graph nodes to index
   * @param edges - All graph edges to index
   */
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
      addToMultiMap(this.nodesByType, node.type, node);

      if (node.project) {
        this.projects.add(node.project);
        addToMultiMap(this.nodesByProject, node.project, node);
      }

      if (node.platform) {
        addToMultiMap(this.nodesByPlatform, node.platform, node);
      }

      if (node.origin) {
        addToMultiMap(this.nodesByOrigin, node.origin, node);
      }

      if (node.type === NodeType.Package) {
        this.packages.add(node.name);
      }
    }

    for (const edge of this.edges) {
      addToMultiMap(this.outgoingEdges, edge.source, edge);
      addToMultiMap(this.incomingEdges, edge.target, edge);
    }
  }

  /** @returns All graph nodes */
  getAllNodes(): GraphNode[] {
    return this.nodes;
  }

  /**
   * @param id - Node identifier
   * @returns The matching node, or undefined if not found
   */
  getNodeById(id: string): GraphNode | undefined {
    return this.nodeMap.get(id);
  }

  /**
   * @param type - Node type string (e.g. `'app'`, `'framework'`)
   * @returns All nodes matching the given type
   */
  getNodesByType(type: string): GraphNode[] {
    return this.nodesByType.get(type) || [];
  }

  /**
   * @param project - Project name
   * @returns All nodes belonging to the given project
   */
  getNodesByProject(project: string): GraphNode[] {
    return this.nodesByProject.get(project) || [];
  }

  /**
   * @param platform - Platform string (e.g. `'iOS'`, `'macOS'`)
   * @returns All nodes targeting the given platform
   */
  getNodesByPlatform(platform: string): GraphNode[] {
    return this.nodesByPlatform.get(platform) || [];
  }

  /**
   * @param origin - Local or External origin
   * @returns All nodes matching the given origin
   */
  getNodesByOrigin(origin: Origin): GraphNode[] {
    return this.nodesByOrigin.get(origin) || [];
  }

  /**
   * Case-insensitive search across node name and project fields.
   *
   * @param query - Search string
   * @returns Matching nodes
   */
  searchNodes(query: string): GraphNode[] {
    const lowerQuery = query.toLowerCase();
    return this.nodes.filter(
      (n) =>
        n.name.toLowerCase().includes(lowerQuery) || n.project?.toLowerCase().includes(lowerQuery),
    );
  }

  /** @returns All graph edges */
  getAllEdges(): GraphEdge[] {
    return this.edges;
  }

  /**
   * @param source - Source node ID
   * @param target - Target node ID
   * @returns The edge between source and target, or undefined if none exists
   */
  getEdge(source: string, target: string): GraphEdge | undefined {
    return this.edgeMap.get(`${source}->${target}`);
  }

  /** Get outgoing edges from a node (dependencies) */
  getOutgoingEdges(nodeId: string): GraphEdge[] {
    return this.outgoingEdges.get(nodeId) || [];
  }

  /** Get incoming edges to a node (dependents) */
  getIncomingEdges(nodeId: string): GraphEdge[] {
    return this.incomingEdges.get(nodeId) || [];
  }

  /**
   * Get all edges connected to a node (both directions).
   *
   * @param nodeId - Node identifier
   * @returns Combined outgoing and incoming edges
   */
  getNodeEdges(nodeId: string): GraphEdge[] {
    const outgoing = this.getOutgoingEdges(nodeId);
    const incoming = this.getIncomingEdges(nodeId);
    return [...outgoing, ...incoming];
  }

  /**
   * Get the nodes that this node directly depends on.
   *
   * @param nodeId - Node identifier
   * @returns Nodes referenced by outgoing edges
   */
  getDirectDependencies(nodeId: string): GraphNode[] {
    const outgoing = this.getOutgoingEdges(nodeId);
    const depIds = outgoing.map((e) => e.target);
    return depIds.map((id) => this.nodeMap.get(id)).filter((n): n is GraphNode => n !== undefined);
  }

  /**
   * Get the nodes that directly depend on this node.
   *
   * @param nodeId - Node identifier
   * @returns Nodes referencing this node via incoming edges
   */
  getDirectDependents(nodeId: string): GraphNode[] {
    const incoming = this.getIncomingEdges(nodeId);
    const depIds = incoming.map((e) => e.source);
    return depIds.map((id) => this.nodeMap.get(id)).filter((n): n is GraphNode => n !== undefined);
  }

  /**
   * BFS traversal of all transitive dependencies (outgoing direction).
   *
   * @param nodeId - Starting node identifier
   * @returns Traversal result with visited nodes, edges, and depth information
   */
  getTransitiveDependencies(nodeId: string): TransitiveResult {
    return bfsTraverseGraph(
      nodeId,
      (id) => this.getOutgoingEdges(id).map((e) => e.target),
      (current, neighbor) => `${current}->${neighbor}`,
    );
  }

  /**
   * BFS traversal of all transitive dependents (incoming direction).
   *
   * @param nodeId - Starting node identifier
   * @returns Traversal result with visited nodes, edges, and depth information
   */
  getTransitiveDependents(nodeId: string): TransitiveResult {
    return bfsTraverseGraph(
      nodeId,
      (id) => this.getIncomingEdges(id).map((e) => e.source),
      (current, neighbor) => `${neighbor}->${current}`,
    );
  }

  /**
   * Get all nodes belonging to a cluster.
   * For projects, returns non-package nodes in that project.
   * For packages, returns package nodes matching the cluster ID.
   *
   * @param clusterId - Cluster identifier (project name or package name)
   * @returns Nodes in the cluster
   */
  getClusterNodes(clusterId: string): GraphNode[] {
    // Optimization: use indices
    const projectNodes = (this.nodesByProject.get(clusterId) || []).filter(
      (n) => n.type !== NodeType.Package,
    );
    const packageNodes = (this.nodesByType.get(NodeType.Package) || []).filter(
      (n) => n.name === clusterId,
    );

    return [...projectNodes, ...packageNodes];
  }

  /**
   * Build a Cluster object from the nodes matching the given cluster ID.
   *
   * @param clusterId - Cluster identifier (project name or package name)
   * @returns Cluster with inferred type and origin, or null if no matching nodes
   */
  getCluster(clusterId: string): Cluster | null {
    const clusterNodes = this.getClusterNodes(clusterId);

    if (clusterNodes.length === 0) {
      return null;
    }

    const firstNode = clusterNodes[0];
    const clusterType =
      firstNode?.type === NodeType.Package ? ClusterType.Package : ClusterType.Project;
    const clusterOrigin = clusterNodes.some((n) => n.origin === Origin.External)
      ? Origin.External
      : Origin.Local;

    return {
      id: clusterId,
      name: clusterId,
      type: clusterType,
      origin: clusterOrigin,
      nodes: clusterNodes,
      metadata: new Map(),
      anchors: [],
    };
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
}
