import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { RoutedEdge } from '@graph/layout/types';
import type { TransitiveResult } from '@graph/utils';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { ViewMode } from '@shared/schemas';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { type ViewportBounds } from '@ui/utils/viewport';
export interface EdgeRenderContext {
    ctx: CanvasRenderingContext2D;
    layout: GraphLayoutController;
    nodes: GraphNode[];
    edges: GraphEdge[];
    zoom: number;
    time: number;
    theme: CanvasTheme;
    selectedNode: GraphNode | null;
    selectedCluster: string | null;
    hoveredCluster: string | null;
    viewMode: ViewMode;
    transitiveDeps: TransitiveResult | undefined;
    transitiveDependents: TransitiveResult | undefined;
    manualNodePositions: Map<string, {
        x: number;
        y: number;
    }>;
    manualClusterPositions: Map<string, {
        x: number;
        y: number;
    }>;
    nodeMap: Map<string, GraphNode>;
    routedEdgeMap: Map<string, RoutedEdge>;
    edgePathCache: Map<string, Path2D>;
    showDirectDeps: boolean;
    showTransitiveDeps: boolean;
    showDirectDependents: boolean;
    showTransitiveDependents: boolean;
}
export declare function renderEdges(rc: EdgeRenderContext, viewport: ViewportBounds): void;
