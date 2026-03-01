/**
 * Graph Data Service - centralized data access layer
 * Provides single source of truth for all graph data operations
 */

import { bfsTraverseGraph, type TransitiveResult } from '@graph/utils/traversal';
import { addToMultiMap } from '@shared/utils/collections';
import type { Cluster } from '@shared/schemas';
import { type GraphEdge, type GraphNode, NodeType, Origin } from '@shared/schemas/graph.types';

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

  getAllNodes(): GraphNode[] {
    return this.nodes;
  }

  getNodeById(id: string): GraphNode | undefined {
    return this.nodeMap.get(id);
  }

  getNodesByType(type: string): GraphNode[] {
    return this.nodesByType.get(type) || [];
  }

  getNodesByProject(project: string): GraphNode[] {
    return this.nodesByProject.get(project) || [];
  }

  getNodesByPlatform(platform: string): GraphNode[] {
    return this.nodesByPlatform.get(platform) || [];
  }

  getNodesByOrigin(origin: Origin): GraphNode[] {
    return this.nodesByOrigin.get(origin) || [];
  }

  searchNodes(query: string): GraphNode[] {
    const lowerQuery = query.toLowerCase();
    return this.nodes.filter(
      (n) =>
        n.name.toLowerCase().includes(lowerQuery) || n.project?.toLowerCase().includes(lowerQuery),
    );
  }

  getAllEdges(): GraphEdge[] {
    return this.edges;
  }

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

  getNodeEdges(nodeId: string): GraphEdge[] {
    const outgoing = this.getOutgoingEdges(nodeId);
    const incoming = this.getIncomingEdges(nodeId);
    return [...outgoing, ...incoming];
  }

  getDirectDependencies(nodeId: string): GraphNode[] {
    const outgoing = this.getOutgoingEdges(nodeId);
    const depIds = outgoing.map((e) => e.target);
    return depIds.map((id) => this.nodeMap.get(id)).filter((n): n is GraphNode => n !== undefined);
  }

  getDirectDependents(nodeId: string): GraphNode[] {
    const incoming = this.getIncomingEdges(nodeId);
    const depIds = incoming.map((e) => e.source);
    return depIds.map((id) => this.nodeMap.get(id)).filter((n): n is GraphNode => n !== undefined);
  }

  getTransitiveDependencies(nodeId: string): TransitiveResult {
    return bfsTraverseGraph(
      nodeId,
      (id) => this.getOutgoingEdges(id).map((e) => e.target),
      (current, neighbor) => `${current}->${neighbor}`,
    );
  }

  getTransitiveDependents(nodeId: string): TransitiveResult {
    return bfsTraverseGraph(
      nodeId,
      (id) => this.getIncomingEdges(id).map((e) => e.source),
      (current, neighbor) => `${neighbor}->${current}`,
    );
  }

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
   * Get cluster data by ID
   */
  getCluster(clusterId: string): Cluster | null {
    const clusterNodes = this.getClusterNodes(clusterId);

    if (clusterNodes.length === 0) {
      return null;
    }

    const firstNode = clusterNodes[0];
    const clusterType = firstNode?.type === NodeType.Package ? NodeType.Package : 'project';
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
