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
  twinkleSpeed: number;
  twinklePhase: number;
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
  count: 250,
  brightRatio: 0.01,
  parallaxIntensity: 0.08,
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

    for (let i = 0; i < count; i++) {
      const isBright = Math.random() < brightRatio;
      this.stars.push(this.createStar(isBright, spanX, spanY, offsetX, offsetY));
    }

    // Sort by depth so distant stars render first (behind nearer ones)
    this.stars.sort((a, b) => a.depth - b.depth);
  }

  private createStar(
    isBright: boolean,
    spanX: number,
    spanY: number,
    offsetX: number,
    offsetY: number,
  ): Star {
    const palette = this.palette;
    // Depth in [0.1, 0.9] to avoid extremes
    const depth = Math.random() * 0.8 + 0.1;
    const colorIndex = isBright
      ? Math.random() < 0.7
        ? 1
        : 0 // bright: mostly golden, sometimes neutral
      : Math.random() < 0.9
        ? 0
        : 2; // dim: mostly neutral, rare cool blue

    return {
      x: Math.random() * spanX - offsetX,
      y: Math.random() * spanY - offsetY,
      r: isBright ? Math.random() * 0.5 + 1.0 : Math.random() * 0.8 + 0.2,
      a: isBright ? Math.random() * 0.2 + 0.2 : Math.random() * 0.2 + 0.05,
      depth,
      color: palette[colorIndex] ?? palette[0]!,
      twinkleSpeed: Math.random() * 0.001 + 0.0003,
      twinklePhase: Math.random() * Math.PI * 2,
    };
  }

  /**
   * Render the starfield with parallax based on pan position.
   * Stars at different depths move at different rates.
   *
   * @param ctx  Canvas context
   * @param panX Camera pan offset in world space X
   * @param panY Camera pan offset in world space Y
   * @param time Current animation timestamp (ms) for twinkling
   */
  public render(ctx: CanvasRenderingContext2D, panX: number, panY: number, time = 0): void {
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
      if (!star) continue;

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

      const twinkle = 0.7 + 0.3 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);
      ctx.globalAlpha = star.a * twinkle;
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(wrappedX, wrappedY, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private vignetteGradient: CanvasGradient | null = null;
  private vignetteWidth = 0;
  private vignetteHeight = 0;

  /**
   * Render a subtle vignette overlay that darkens canvas edges.
   * The gradient is cached and only recreated when dimensions change.
   */
  public renderVignette(ctx: CanvasRenderingContext2D): void {
    if (this.width <= 0 || this.height <= 0) return;

    if (
      !this.vignetteGradient ||
      this.vignetteWidth !== this.width ||
      this.vignetteHeight !== this.height
    ) {
      const cx = this.width / 2;
      const cy = this.height / 2;
      const outerRadius = Math.hypot(cx, cy);
      const grad = ctx.createRadialGradient(cx, cy, outerRadius * 0.3, cx, cy, outerRadius);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.35)');
      this.vignetteGradient = grad;
      this.vignetteWidth = this.width;
      this.vignetteHeight = this.height;
    }

    ctx.save();
    ctx.fillStyle = this.vignetteGradient;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  /** Clear all stars (e.g. when tearing down the canvas) */
  public clear(): void {
    this.stars = [];
  }
}
