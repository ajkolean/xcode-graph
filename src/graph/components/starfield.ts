/**
 * Starfield - Parallax star background for graph visualization
 *
 * Renders a subtle starfield with depth-based parallax effect.
 * Stars are generated once and rendered efficiently each frame.
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
  /** Number of stars to generate (default: 400) */
  count?: number;
  /** Percentage of stars that are bright (default: 0.025) */
  brightRatio?: number;
  /** Parallax intensity multiplier (default: 0.15) */
  parallaxIntensity?: number;
  /**
   * How far beyond the viewport to spawn stars (default: 2.0).
   * 2.0 means stars live in a region 2x the canvas size.
   */
  spanMultiplier?: number;
}

const DEFAULT_STAR_PALETTE = [
  '#f7f1da', // soft warm off-white
  '#f5e0b5', // warmer, almost golden
  '#d6e0ff', // occasional cool blue-white
];

const DEFAULT_OPTIONS: Required<StarfieldOptions> = {
  count: 400,
  brightRatio: 0.025,
  parallaxIntensity: 0.15,
  spanMultiplier: 2.0,
};

export class Starfield {
  private stars: Star[] = [];
  private width = 0;
  private height = 0;
  private options: Required<StarfieldOptions>;
  private palette: string[] = DEFAULT_STAR_PALETTE;

  constructor(options: StarfieldOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Update configuration at runtime.
   * Existing stars are preserved until you call `generate`/`resizeIfNeeded`.
   */
  public setOptions(options: StarfieldOptions): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Set the star color palette. Expects [warm, golden, cool].
   * Takes effect on the next `generate()` call.
   */
  public setColors(colors: string[]): void {
    this.palette = colors.length >= 3 ? colors : DEFAULT_STAR_PALETTE;
  }

  /**
   * True if the starfield needs to be regenerated for the given dimensions.
   */
  public needsRegeneration(width: number, height: number): boolean {
    return (
      width > 0 &&
      height > 0 &&
      (this.width !== width || this.height !== height || this.stars.length === 0)
    );
  }

  /**
   * Convenience: regenerate stars if the canvas size changed.
   */
  public resizeIfNeeded(width: number, height: number): void {
    if (this.needsRegeneration(width, height)) {
      this.generate(width, height);
    }
  }

  /**
   * Generate stars for the given canvas dimensions.
   * Call this on initialization and when canvas resizes.
   */
  public generate(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.stars = [] as Star[];

    if (width <= 0 || height <= 0) return;

    const { count, brightRatio, spanMultiplier } = this.options;

    const spanX = width * spanMultiplier;
    const spanY = height * spanMultiplier;
    const offsetX = spanX * 0.25; // center the spawn region
    const offsetY = spanY * 0.25;
    const palette = this.palette;

    for (let i = 0; i < count; i++) {
      const isBright = Math.random() < brightRatio;

      // Depth in [0.1, 0.9] to avoid extremes
      const depth = Math.random() * 0.8 + 0.1;

      this.stars.push({
        x: Math.random() * spanX - offsetX,
        y: Math.random() * spanY - offsetY,
        r: isBright ? Math.random() * 1.5 + 1.0 : Math.random() * 0.8 + 0.2,
        a: isBright ? Math.random() * 0.4 + 0.5 : Math.random() * 0.2 + 0.05,
        depth,
        color:
          palette[
            isBright
              ? Math.random() < 0.7
                ? 1
                : 0 // bright: mostly golden, sometimes neutral
              : Math.random() < 0.9
                ? 0
                : 2 // dim: mostly neutral, rare cool blue
          ],
      });
    }

    // Sort by depth so distant stars render first (behind nearer ones)
    this.stars.sort((a, b) => a.depth - b.depth);
  }

  /**
   * Render the starfield with parallax based on pan position.
   * Stars at different depths move at different rates.
   *
   * @param ctx  Canvas context
   * @param panX Camera pan offset in world space X
   * @param panY Camera pan offset in world space Y
   */
  public render(ctx: CanvasRenderingContext2D, panX: number, panY: number): void {
    const stars = this.stars;
    const count = stars.length;

    if (count === 0 || this.width <= 0 || this.height <= 0) return;

    const { width, height } = this;
    const { parallaxIntensity, spanMultiplier } = this.options;

    // Precompute values used in wrapping math
    const spanX = width * spanMultiplier;
    const spanY = height * spanMultiplier;
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;

    ctx.save();

    for (let i = 0; i < count; i++) {
      const star = stars[i];

      // Parallax: nearer stars (depth → 1) move more with pan.
      const parallaxFactor = star.depth * parallaxIntensity;

      const sx = star.x + panX * parallaxFactor;
      const sy = star.y + panY * parallaxFactor;

      // Wrap stars to create an infinite tiling effect.
      // We keep them inside [-halfWidth, width + halfWidth] range.
      let wrappedX = sx;
      let wrappedY = sy;

      // Fast "mod in range" without allocations.
      if (spanX > 0) {
        wrappedX = ((sx + spanX) % spanX) - (spanX * 0.5 - halfWidth);
      }
      if (spanY > 0) {
        wrappedY = ((sy + spanY) % spanY) - (spanY * 0.5 - halfHeight);
      }

      // Skip if outside visible area (+ small margin)
      if (wrappedX < -5 || wrappedX > width + 5 || wrappedY < -5 || wrappedY > height + 5) {
        continue;
      }

      ctx.globalAlpha = star.a;
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(wrappedX, wrappedY, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /** Clear all stars (e.g. when tearing down the canvas) */
  public clear(): void {
    this.stars = [];
  }
}
