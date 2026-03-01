/**
 * Mock position data for tests and fixtures
 *
 * Provides deterministic node and cluster positions for consistent rendering
 */
import type { ClusterPosition, NodePosition } from '@shared/schemas/simulation.types';
export declare const mockNodePositions: Map<string, NodePosition>;
export declare const mockClusterPositions: Map<string, ClusterPosition>;
/**
 * Get node position by ID, with fallback to default
 */
export declare function getNodePosition(nodeId: string): NodePosition;
/**
 * Get cluster position by ID, with fallback to default
 */
export declare function getClusterPosition(clusterId: string): ClusterPosition;
/**
 * Get all node IDs that have positions
 */
export declare function getAllPositionedNodeIds(): string[];
/**
 * Get all cluster IDs that have positions
 */
export declare function getAllPositionedClusterIds(): string[];
