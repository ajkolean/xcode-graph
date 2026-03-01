/**
 * Node fixture builders
 */
import { type GraphNode } from '@shared/schemas/graph.types';
/**
 * Create a single test node with sensible defaults
 */
export declare function createNode(overrides: Partial<GraphNode> & {
    id: string;
    name: string;
}): GraphNode;
/**
 * Create nodes with specific types for filter testing
 */
export declare function createNodesForFilterTesting(): GraphNode[];
