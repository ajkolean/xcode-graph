import type { GraphLayoutController } from '@graph/controllers/graph-layout.controller';
import type { CanvasTheme } from '@graph/utils/canvas-theme';
import type { ViewportBounds } from '@ui/utils/viewport';
export interface ClusterRenderContext {
    ctx: CanvasRenderingContext2D;
    layout: GraphLayoutController;
    zoom: number;
    time: number;
    theme: CanvasTheme;
    selectedCluster: string | null;
    hoveredCluster: string | null;
    manualClusterPositions: Map<string, {
        x: number;
        y: number;
    }>;
}
export declare function renderClusters(rc: ClusterRenderContext, viewport: ViewportBounds): void;
//# sourceMappingURL=canvas-cluster-renderer.d.ts.map