/**
 * Controller Mocks for Testing
 *
 * Mock implementations of graph controllers for isolated component testing.
 * Allows testing components without heavy controller dependencies.
 */
import type { Cluster, ClusterPosition, NodePosition } from '@shared/schemas';
import { type GraphEdge, type GraphNode } from '@shared/schemas/graph.types';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { GraphInteractionConfig } from '../../../graph/controllers/graph-interaction-full.controller';
import type { GraphLayoutConfig } from '../../../graph/controllers/graph-layout.controller';
/**
 * Mock Graph Layout Controller
 */
export declare class MockGraphLayoutController implements ReactiveController {
    host: ReactiveControllerHost;
    enableAnimation: boolean;
    nodePositions: Map<string, NodePosition>;
    clusterPositions: Map<string, ClusterPosition>;
    clusters: Cluster[];
    isSettling: boolean;
    computeLayoutCalls: Array<{
        nodes: GraphNode[];
        edges: GraphEdge[];
    }>;
    stopAnimationCalls: number;
    constructor(host: ReactiveControllerHost, config?: GraphLayoutConfig);
    hostConnected(): void;
    hostDisconnected(): void;
    /**
     * Mock layout computation - just creates simple positions
     */
    computeLayout(nodes: GraphNode[], edges: GraphEdge[]): void;
    /**
     * Mock animation stop
     */
    stopAnimation(): void;
    /**
     * Set mock positions (for testing)
     */
    setNodePositions(positions: Map<string, NodePosition>): void;
    /**
     * Set mock cluster positions (for testing)
     */
    setClusterPositions(positions: Map<string, ClusterPosition>): void;
    /**
     * Set mock clusters (for testing)
     */
    setClusters(clusters: Cluster[]): void;
}
/**
 * Mock Graph Interaction Controller
 */
export declare class MockGraphInteractionController implements ReactiveController {
    host: ReactiveControllerHost;
    zoom: number;
    finalNodePositions: Map<string, NodePosition>;
    clusterPositions: Map<string, ClusterPosition>;
    pan: {
        x: number;
        y: number;
    };
    isDragging: boolean;
    dragStart: {
        x: number;
        y: number;
    };
    draggedNode: string | null;
    manualNodePositions: Map<string, {
        x: number;
        y: number;
    }>;
    hasMoved: boolean;
    private svgElement;
    updateConfigCalls: Array<Partial<GraphInteractionConfig>>;
    setSvgElementCalls: number;
    handleMouseDownCalls: number;
    handleMouseMoveCalls: number;
    handleMouseUpCalls: number;
    handleNodeMouseDownCalls: Array<{
        nodeId: string;
    }>;
    constructor(host: ReactiveControllerHost, config: GraphInteractionConfig);
    hostConnected(): void;
    hostDisconnected(): void;
    setSvgElement(element: SVGSVGElement): void;
    hasSvgElement(): boolean;
    updateConfig(config: Partial<GraphInteractionConfig>): void;
    handleMouseDown: (_e: MouseEvent) => void;
    handleMouseMove: (_e: MouseEvent) => void;
    handleMouseUp: () => void;
    handleNodeMouseDown(nodeId: string, _e: MouseEvent): void;
    /**
     * Set mock pan (for testing)
     */
    setPan(x: number, y: number): void;
    /**
     * Set mock dragging state (for testing)
     */
    setDragging(isDragging: boolean): void;
}
/**
 * Create a mock host for controller testing
 */
export declare class MockReactiveHost implements ReactiveControllerHost {
    controllers: ReactiveController[];
    updateRequests: number;
    addController(controller: ReactiveController): void;
    removeController(controller: ReactiveController): void;
    requestUpdate(): void;
    updateComplete: Promise<boolean>;
    /**
     * Reset counters for testing
     */
    reset(): void;
}
//# sourceMappingURL=controller-mocks.d.ts.map