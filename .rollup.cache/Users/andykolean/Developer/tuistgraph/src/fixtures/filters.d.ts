/**
 * Filter state fixtures
 */
import type { FilterState } from '@shared/schemas';
import { type GraphNode } from '@shared/schemas/graph.types';
/**
 * Create a FilterState that includes everything
 */
export declare function createAllInclusiveFilters(): FilterState;
/**
 * Create a FilterState that excludes everything
 */
export declare function createEmptyFilters(): FilterState;
/**
 * Create a FilterState with only specific node types
 */
export declare function createNodeTypeFilter(types: GraphNode['type'][]): FilterState;
//# sourceMappingURL=filters.d.ts.map