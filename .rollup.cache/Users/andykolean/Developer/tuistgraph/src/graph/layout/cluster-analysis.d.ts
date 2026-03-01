import { type Cluster, NodeRole } from '@shared/schemas';
import { type GraphEdge, type GraphNode } from '@shared/schemas/graph.types';
/**
 * Analyzes a cluster to determine node roles, anchors, and layers
 */
export declare function analyzeCluster(cluster: Cluster, allEdges: GraphEdge[]): void;
/**
 * Identifies anchor nodes (entry points) for a cluster
 * Priority: Apps > CLIs > Most-depended-upon frameworks/libs
 */
export declare function identifyAnchors(nodes: GraphNode[], dependents: Map<string, Set<string>>, externalDependents: Map<string, number>): GraphNode[];
/**
 * Assigns layer numbers based on internal connectivity (edge count within cluster)
 * Nodes with more internal edges are placed in inner rings (lower layer numbers)
 * Nodes with fewer internal edges are placed in outer rings (higher layer numbers)
 */
export declare function assignLayers(nodes: GraphNode[], anchors: GraphNode[], dependencies: Map<string, Set<string>>, testNodes: Set<string>): Map<string, number>;
/**
 * Determines the role of a node
 */
export declare function determineRole(node: GraphNode, isTest: boolean, isAnchor: boolean, dependentCount: number): NodeRole;
