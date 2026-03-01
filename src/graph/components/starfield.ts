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

// Values match --colors-starfield-warm, --colors-starfield-golden, --colors-starfield-cool
const DEFAULT_STAR_PALETTE = [
  '#f7f1da', // soft warm off-white
  '#f5e0b5', // warmer, almost golden
  '#d6e0ff', // occasional cool blue-white
];

const DEFAULT_OPTIONS: Required<StarfieldOptions> = {
  count: 100,
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

  // Cached bitmap for static starfield
  private cachedCanvas: OffscreenCanvas | null = null;
  private cachedPanX = Number.NaN;
  private cachedPanY = Number.NaN;

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
    this.cachedCanvas = null;
    this.cachedPanX = Number.NaN;
    this.cachedPanY = Number.NaN;

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
      a: Math.min(isBright ? Math.random() * 0.1 + 0.1 : Math.random() * 0.1 + 0.03, 0.15),
      depth,
      color: palette[colorIndex] ?? palette[0] ?? '#f7f1da',
    };
  }

  /**
   * Render the starfield with parallax based on pan position.
   * Stars are rendered to a cached OffscreenCanvas and only re-rendered
   * when the pan position changes. Each frame just blits the cached bitmap.
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

    // Round pan to nearest pixel to avoid excessive cache invalidation
    const rpx = Math.round(panX);
    const rpy = Math.round(panY);

    if (!this.cachedCanvas || this.cachedPanX !== rpx || this.cachedPanY !== rpy) {
      this.renderToCache(rpx, rpy);
      this.cachedPanX = rpx;
      this.cachedPanY = rpy;
    }

    if (this.cachedCanvas) {
      ctx.drawImage(this.cachedCanvas, 0, 0, width, height);
    }
  }

  private renderToCache(panX: number, panY: number): void {
    const { width, height } = this;
    const { parallaxIntensity, spanMultiplier } = this.options;
    const stars = this.stars;
    const count = stars.length;

    if (
      !this.cachedCanvas ||
      this.cachedCanvas.width !== width ||
      this.cachedCanvas.height !== height
    ) {
      this.cachedCanvas = new OffscreenCanvas(width, height);
    }

    const offCtx = this.cachedCanvas.getContext('2d');
    if (!offCtx) return;
    offCtx.clearRect(0, 0, width, height);

    const spanX = width * spanMultiplier;
    const spanY = height * spanMultiplier;
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;

    for (let i = 0; i < count; i++) {
      const star = stars[i];
      if (!star) continue;

      const parallaxFactor = star.depth * parallaxIntensity;

      const sx = star.x + panX * parallaxFactor;
      const sy = star.y + panY * parallaxFactor;

      let wrappedX = sx;
      let wrappedY = sy;

      if (spanX > 0) {
        wrappedX = ((sx + spanX) % spanX) - (spanX * 0.5 - halfWidth);
      }
      if (spanY > 0) {
        wrappedY = ((sy + spanY) % spanY) - (spanY * 0.5 - halfHeight);
      }

      if (wrappedX < -5 || wrappedX > width + 5 || wrappedY < -5 || wrappedY > height + 5) {
        continue;
      }

      offCtx.globalAlpha = star.a;
      offCtx.fillStyle = star.color;
      offCtx.beginPath();
      offCtx.arc(wrappedX, wrappedY, star.r, 0, Math.PI * 2);
      offCtx.fill();
    }
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
    this.cachedCanvas = null;
    this.cachedPanX = Number.NaN;
    this.cachedPanY = Number.NaN;
  }
}
