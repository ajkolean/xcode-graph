/**
 * Port-Based Edge Routing
 *
 * Computes port positions on cluster boundaries and routes edges through them.
 * Creates a "highway" effect where edges going to similar directions share ports.
 */
import type { ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge } from '@shared/schemas/graph.types';
import type { ClusterEdge } from '../cluster-graph';
import type { LayoutConfig } from '../config';
import type { ClusterPort, PortSide, RoutedEdge } from '../types';
/**
 * Determine which side of a cluster a port should be on based on direction to target.
 * Uses the angle from source cluster center to target cluster center.
 */
export declare function computePortSide(sourceX: number, sourceY: number, targetX: number, targetY: number): PortSide;
export declare function computeClusterPorts(clusterPositions: Map<string, ClusterPosition>, clusterEdges: ClusterEdge[], config: LayoutConfig): Map<string, ClusterPort[]>;
/**
 * Compute routed edges for all node-level edges that cross cluster boundaries.
 */
export declare function computeRoutedEdges(edges: GraphEdge[], nodePositions: Map<string, NodePosition>, clusterPositions: Map<string, ClusterPosition>, clusterPorts: Map<string, ClusterPort[]>, clusterEdges: ClusterEdge[], nodeToCluster: Map<string, string>, config: LayoutConfig): RoutedEdge[];
