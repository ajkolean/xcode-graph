/**
 * Mock GraphNode data for tests and fixtures
 */
import { type GraphNode } from '@shared/schemas/graph.types';
export declare const mockAppNode: GraphNode;
export declare const mockFrameworkNode: GraphNode;
export declare const mockLibraryNode: GraphNode;
export declare const mockTestUnitNode: GraphNode;
export declare const mockTestUINode: GraphNode;
export declare const mockCliNode: GraphNode;
export declare const mockPackageNode: GraphNode;
export declare const allNodeTypes: GraphNode[];
export declare const allPlatforms: GraphNode[];
export declare const mockGraphNodes: GraphNode[];
/**
 * Get mock nodes with dependencies
 */
export declare function getNodeWithDependencies(nodeId?: string): {
    node: GraphNode;
    dependencies: GraphNode[];
    dependents: GraphNode[];
};
/**
 * Get nodes for a specific project
 */
export declare function getNodesForProject(projectName: string): GraphNode[];
//# sourceMappingURL=mockNodes.d.ts.map