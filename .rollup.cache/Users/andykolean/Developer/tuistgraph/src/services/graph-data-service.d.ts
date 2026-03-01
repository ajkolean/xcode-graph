/**
 * Graph Data Service - centralized data access layer
 * Provides single source of truth for all graph data operations
 */
import type { Cluster } from '@shared/schemas';
import { type GraphEdge, type GraphNode, Origin } from '@shared/schemas/graph.types';
export declare class GraphDataService {
    private readonly nodes;
    private readonly edges;
    private readonly nodeMap;
    private readonly edgeMap;
    private readonly nodesByType;
    private readonly nodesByProject;
    private readonly nodesByPlatform;
    private readonly nodesByOrigin;
    private readonly outgoingEdges;
    private readonly incomingEdges;
    private readonly projects;
    private readonly packages;
    constructor(nodes: GraphNode[], edges: GraphEdge[]);
    private buildIndices;
    /**
     * Get all nodes
     */
    getAllNodes(): GraphNode[];
    /**
     * Get node by ID
     */
    getNodeById(id: string): GraphNode | undefined;
    /**
     * Get nodes by type
     */
    getNodesByType(type: string): GraphNode[];
    /**
     * Get nodes by project
     */
    getNodesByProject(project: string): GraphNode[];
    /**
     * Get nodes by platform
     */
    getNodesByPlatform(platform: string): GraphNode[];
    /**
     * Get nodes by origin
     */
    getNodesByOrigin(origin: Origin): GraphNode[];
    /**
     * Search nodes by name
     */
    searchNodes(query: string): GraphNode[];
    /**
     * Get all edges
     */
    getAllEdges(): GraphEdge[];
    /**
     * Get edge by source and target
     */
    getEdge(source: string, target: string): GraphEdge | undefined;
    /**
     * Get outgoing edges from a node (dependencies)
     */
    getOutgoingEdges(nodeId: string): GraphEdge[];
    /**
     * Get incoming edges to a node (dependents)
     */
    getIncomingEdges(nodeId: string): GraphEdge[];
    /**
     * Get all edges for a node (both directions)
     */
    getNodeEdges(nodeId: string): GraphEdge[];
    /**
     * Get direct dependencies of a node
     */
    getDirectDependencies(nodeId: string): GraphNode[];
    /**
     * Get direct dependents of a node
     */
    getDirectDependents(nodeId: string): GraphNode[];
    /**
     * Get transitive dependencies (all levels)
     */
    getTransitiveDependencies(nodeId: string): {
        nodes: Set<string>;
        edges: Set<string>;
        depths: Map<string, number>;
    };
    /**
     * Get transitive dependents (all levels)
     */
    getTransitiveDependents(nodeId: string): {
        nodes: Set<string>;
        edges: Set<string>;
        depths: Map<string, number>;
    };
    /**
     * Get all nodes in a cluster
     */
    getClusterNodes(clusterId: string): GraphNode[];
    /**
     * Get cluster data by ID
     */
    getCluster(clusterId: string): Cluster | null;
    /**
     * Get all unique projects
     */
    getAllProjects(): Set<string>;
    /**
     * Get all unique packages
     */
    getAllPackages(): Set<string>;
}
//# sourceMappingURL=graph-data-service.d.ts.map