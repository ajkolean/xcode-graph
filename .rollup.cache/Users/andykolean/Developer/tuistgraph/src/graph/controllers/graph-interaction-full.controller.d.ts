/**
 * Graph Interaction Full Controller - Complete pan, zoom, and drag
 *
 * Complete graph interaction controller with pan, zoom, and node dragging.
 * Converted from useGraphInteraction React hook.
 *
 * **Features:**
 * - Canvas panning via background drag
 * - Node dragging with manual positioning
 * - Zoom via wheel (external callback)
 * - Movement tracking (distinguish click from drag)
 *
 * @module controllers/graph-interaction-full
 */
import type { ClusterPosition, NodePosition } from '@shared/schemas';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
/**
 * Configuration for full interaction controller
 */
export interface GraphInteractionConfig {
    zoom: number;
    finalNodePositions: Map<string, NodePosition>;
    clusterPositions: Map<string, ClusterPosition>;
}
/**
 * Reactive controller for complete graph interactions
 *
 * Supports canvas pan, zoom, and individual node dragging.
 * Tracks manual node positions for user-overridden layouts.
 */
export declare class GraphInteractionFullController implements ReactiveController {
    private readonly host;
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
    private readonly handleWindowMouseUp;
    constructor(host: ReactiveControllerHost, config: GraphInteractionConfig);
    setSvgElement(element: SVGSVGElement): void;
    hasSvgElement(): boolean;
    updateConfig(config: Partial<GraphInteractionConfig>): void;
    handleMouseDown: (e: MouseEvent) => void;
    handleMouseMove: (e: MouseEvent) => void;
    handleMouseUp: () => void;
    handleNodeMouseDown(nodeId: string, e: MouseEvent): void;
    hostConnected(): void;
    hostDisconnected(): void;
}
//# sourceMappingURL=graph-interaction-full.controller.d.ts.map