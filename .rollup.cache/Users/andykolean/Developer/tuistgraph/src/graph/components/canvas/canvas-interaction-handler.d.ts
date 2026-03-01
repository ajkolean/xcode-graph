import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
export interface CanvasEventMap {
    'node-select': {
        node: GraphNode | null;
    };
    'cluster-select': {
        clusterId: string | null;
    };
    'node-hover': {
        nodeId: string | null;
    };
    'cluster-hover': {
        clusterId: string | null;
    };
}
export interface InteractionState {
    pan: {
        x: number;
        y: number;
    };
    zoom: number;
    isDragging: boolean;
    draggedNodeId: string | null;
    draggedClusterId: string | null;
    lastMousePos: {
        x: number;
        y: number;
    };
    clickedEmptySpace: boolean;
    hasMoved: boolean;
    hoveredNode: string | null;
    hoveredCluster: string | null;
}
export interface InteractionContext {
    state: InteractionState;
    layout: GraphLayoutController;
    nodes: GraphNode[];
    edges: GraphEdge[];
    selectedNode: GraphNode | null;
    nodeWeights: Map<string, number>;
    manualNodePositions: Map<string, {
        x: number;
        y: number;
    }>;
    manualClusterPositions: Map<string, {
        x: number;
        y: number;
    }>;
    getMousePos: (e: MouseEvent) => {
        x: number;
        y: number;
    };
    screenToWorld: (screenX: number, screenY: number) => {
        x: number;
        y: number;
    };
    dispatchCanvasEvent: <K extends keyof CanvasEventMap>(name: K, detail: CanvasEventMap[K]) => void;
    dispatchZoomChange: (zoom: number) => void;
}
export declare function handleMouseDown(e: MouseEvent, ctx: InteractionContext): void;
export declare function handleMouseMove(e: MouseEvent, ctx: InteractionContext): void;
export declare function handleMouseUp(e: MouseEvent | undefined, ctx: InteractionContext): void;
export declare function handleWheel(e: WheelEvent, ctx: InteractionContext): void;
//# sourceMappingURL=canvas-interaction-handler.d.ts.map