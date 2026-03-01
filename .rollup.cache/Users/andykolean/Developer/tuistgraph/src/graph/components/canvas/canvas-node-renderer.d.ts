import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { TransitiveResult } from '@graph/utils';
import { type AnimatedValue } from '@graph/utils/canvas-animation';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { ViewMode } from '@shared/schemas';
import { type GraphEdge, type GraphNode } from '@shared/schemas/graph.types';
import type { PreviewFilter } from '@shared/signals';
import { type ViewportBounds } from '@ui/utils/viewport';
export interface NodeRenderContext {
    ctx: CanvasRenderingContext2D;
    layout: GraphLayoutController;
    nodes: GraphNode[];
    edges: GraphEdge[];
    zoom: number;
    time: number;
    theme: CanvasTheme;
    selectedNode: GraphNode | null;
    selectedCluster: string | null;
    hoveredNode: string | null;
    hoveredCluster: string | null;
    searchQuery: string;
    viewMode: ViewMode;
    transitiveDeps: TransitiveResult | undefined;
    transitiveDependents: TransitiveResult | undefined;
    previewFilter: PreviewFilter | undefined;
    nodeWeights: Map<string, number>;
    manualNodePositions: Map<string, {
        x: number;
        y: number;
    }>;
    manualClusterPositions: Map<string, {
        x: number;
        y: number;
    }>;
    getPathForNode: (node: GraphNode) => Path2D;
    connectedNodes: Set<string>;
    hubWeightThreshold: number;
    nodeAlphaMap: Map<string, AnimatedValue>;
    showDirectDeps: boolean;
    showTransitiveDeps: boolean;
    showDirectDependents: boolean;
    showTransitiveDependents: boolean;
}
export declare function renderNodes(rc: NodeRenderContext, viewport: ViewportBounds): void;
