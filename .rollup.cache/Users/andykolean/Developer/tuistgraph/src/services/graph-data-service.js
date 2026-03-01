/**
 * Graph Data Service - centralized data access layer
 * Provides single source of truth for all graph data operations
 */
import { addToMultiMap } from '@shared/collections';
import { NodeType, Origin } from '@shared/schemas/graph.types';
export class GraphDataService {
    nodes;
    edges;
    nodeMap;
    edgeMap;
    // Indices for O(1) lookups
    nodesByType = new Map();
    nodesByProject = new Map();
    nodesByPlatform = new Map();
    nodesByOrigin = new Map();
    outgoingEdges = new Map();
    incomingEdges = new Map();
    // Cached Sets
    projects = new Set();
    packages = new Set();
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        // Create lookup maps for O(1) access
        this.nodeMap = new Map(nodes.map((n) => [n.id, n]));
        this.edgeMap = new Map(edges.map((e) => [`${e.source}->${e.target}`, e]));
        this.buildIndices();
    }
    buildIndices() {
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
    // ==================== Node Operations ====================
    /**
     * Get all nodes
     */
    getAllNodes() {
        return this.nodes;
    }
    /**
     * Get node by ID
     */
    getNodeById(id) {
        return this.nodeMap.get(id);
    }
    /**
     * Get nodes by type
     */
    getNodesByType(type) {
        return this.nodesByType.get(type) || [];
    }
    /**
     * Get nodes by project
     */
    getNodesByProject(project) {
        return this.nodesByProject.get(project) || [];
    }
    /**
     * Get nodes by platform
     */
    getNodesByPlatform(platform) {
        return this.nodesByPlatform.get(platform) || [];
    }
    /**
     * Get nodes by origin
     */
    getNodesByOrigin(origin) {
        return this.nodesByOrigin.get(origin) || [];
    }
    /**
     * Search nodes by name
     */
    searchNodes(query) {
        const lowerQuery = query.toLowerCase();
        return this.nodes.filter((n) => n.name.toLowerCase().includes(lowerQuery) || n.project?.toLowerCase().includes(lowerQuery));
    }
    // ==================== Edge Operations ====================
    /**
     * Get all edges
     */
    getAllEdges() {
        return this.edges;
    }
    /**
     * Get edge by source and target
     */
    getEdge(source, target) {
        return this.edgeMap.get(`${source}->${target}`);
    }
    /**
     * Get outgoing edges from a node (dependencies)
     */
    getOutgoingEdges(nodeId) {
        return this.outgoingEdges.get(nodeId) || [];
    }
    /**
     * Get incoming edges to a node (dependents)
     */
    getIncomingEdges(nodeId) {
        return this.incomingEdges.get(nodeId) || [];
    }
    /**
     * Get all edges for a node (both directions)
     */
    getNodeEdges(nodeId) {
        const outgoing = this.getOutgoingEdges(nodeId);
        const incoming = this.getIncomingEdges(nodeId);
        return [...outgoing, ...incoming];
    }
    // ==================== Dependency Operations ====================
    /**
     * Get direct dependencies of a node
     */
    getDirectDependencies(nodeId) {
        const outgoing = this.getOutgoingEdges(nodeId);
        const depIds = outgoing.map((e) => e.target);
        return depIds.map((id) => this.nodeMap.get(id)).filter((n) => n !== undefined);
    }
    /**
     * Get direct dependents of a node
     */
    getDirectDependents(nodeId) {
        const incoming = this.getIncomingEdges(nodeId);
        const depIds = incoming.map((e) => e.source);
        return depIds.map((id) => this.nodeMap.get(id)).filter((n) => n !== undefined);
    }
    /**
     * Get transitive dependencies (all levels)
     */
    getTransitiveDependencies(nodeId) {
        const visited = new Set([nodeId]);
        const edges = new Set();
        const depths = new Map();
        const queue = [{ id: nodeId, depth: 0 }];
        while (queue.length > 0) {
            const item = queue.shift();
            if (!item)
                break;
            const { id, depth } = item;
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
    getTransitiveDependents(nodeId) {
        const visited = new Set([nodeId]);
        const edges = new Set();
        const depths = new Map();
        const queue = [{ id: nodeId, depth: 0 }];
        while (queue.length > 0) {
            const item = queue.shift();
            if (!item)
                break;
            const { id, depth } = item;
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
    getClusterNodes(clusterId) {
        // Optimization: use indices
        const projectNodes = (this.nodesByProject.get(clusterId) || []).filter((n) => n.type !== NodeType.Package);
        const packageNodes = (this.nodesByType.get(NodeType.Package) || []).filter((n) => n.name === clusterId);
        return [...projectNodes, ...packageNodes];
    }
    /**
     * Get cluster data by ID
     */
    getCluster(clusterId) {
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
        };
    }
    /**
     * Get all unique projects
     */
    getAllProjects() {
        return this.projects;
    }
    /**
     * Get all unique packages
     */
    getAllPackages() {
        return this.packages;
    }
}
//# sourceMappingURL=graph-data-service.js.map