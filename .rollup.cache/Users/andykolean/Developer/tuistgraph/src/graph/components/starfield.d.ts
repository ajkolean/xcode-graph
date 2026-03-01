/**
 * Starfield - Static parallax star background for graph visualization
 *
 * Renders a subtle starfield with depth-based parallax effect.
 * Stars are rendered to a cached OffscreenCanvas and only re-rendered
 * when the pan position changes, avoiding per-frame computation.
 *
 * Usage:
 *   const starfield = new Starfield();
 *   starfield.generate(canvas.width, canvas.height);
 *   starfield.render(ctx, panX, panY);
 */
export interface Star {
    x: number;
    y: number;
    r: number;
    a: number;
    depth: number;
    color: string;
}
export interface StarfieldOptions {
    /** Number of stars to generate (default: 100) */
    count?: number;
    /** Percentage of stars that are bright (default: 0.01) */
    brightRatio?: number;
    /** Parallax intensity multiplier (default: 0.08) */
    parallaxIntensity?: number;
    /**
     * How far beyond the viewport to spawn stars (default: 2.0).
     * 2.0 means stars live in a region 2x the canvas size.
     */
    spanMultiplier?: number;
}
export declare class Starfield {
    private stars;
    private width;
    private height;
    private options;
    private palette;
    private cachedCanvas;
    private cachedPanX;
    private cachedPanY;
    constructor(options?: StarfieldOptions);
    /**
     * Update configuration at runtime.
     * Existing stars are preserved until you call `generate`/`resizeIfNeeded`.
     */
    setOptions(options: StarfieldOptions): void;
    /**
     * Set the star color palette. Expects [warm, golden, cool].
     * Takes effect on the next `generate()` call.
     */
    setColors(colors: string[]): void;
    /**
     * True if the starfield needs to be regenerated for the given dimensions.
     */
    needsRegeneration(width: number, height: number): boolean;
    /**
     * Convenience: regenerate stars if the canvas size changed.
     */
    resizeIfNeeded(width: number, height: number): void;
    /**
     * Generate stars for the given canvas dimensions.
     * Call this on initialization and when canvas resizes.
     */
    generate(width: number, height: number): void;
    private createStar;
    /**
     * Render the starfield with parallax based on pan position.
     * Stars are rendered to a cached OffscreenCanvas and only re-rendered
     * when the pan position changes. Each frame just blits the cached bitmap.
     *
     * @param ctx  Canvas context
     * @param panX Camera pan offset in world space X
     * @param panY Camera pan offset in world space Y
     */
    render(ctx: CanvasRenderingContext2D, panX: number, panY: number): void;
    private renderToCache;
    private vignetteGradient;
    private vignetteWidth;
    private vignetteHeight;
    /**
     * Render a subtle vignette overlay that darkens canvas edges.
     * The gradient is cached and only recreated when dimensions change.
     */
    renderVignette(ctx: CanvasRenderingContext2D): void;
    /** Clear all stars (e.g. when tearing down the canvas) */
    clear(): void;
}
//# sourceMappingURL=starfield.d.ts.map