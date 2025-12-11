/**
 * Starfield - Parallax star background for graph visualization
 *
 * Renders a subtle starfield with depth-based parallax effect.
 * Stars are generated once and rendered efficiently each frame.
 *
 * @module graph/components/starfield
 */

export interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  depth: number;
}

export interface StarfieldOptions {
  /** Number of stars to generate (default: 400) */
  count?: number;
  /** Percentage of stars that are bright (default: 0.025) */
  brightRatio?: number;
  /** Parallax intensity multiplier (default: 0.15) */
  parallaxIntensity?: number;
}

const DEFAULT_OPTIONS: Required<StarfieldOptions> = {
  count: 400,
  brightRatio: 0.025,
  parallaxIntensity: 0.15,
};

/**
 * Starfield renderer with parallax support
 */
export class Starfield {
  private stars: Star[] = [];
  private width = 0;
  private height = 0;
  private options: Required<StarfieldOptions>;

  constructor(options: StarfieldOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Generate stars for the given canvas dimensions.
   * Call this on initialization and when canvas resizes.
   */
  generate(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.stars = [];

    const { count, brightRatio } = this.options;

    for (let i = 0; i < count; i++) {
      const isBright = Math.random() < brightRatio;

      this.stars.push({
        // Extend beyond viewport for parallax scrolling
        x: Math.random() * width * 2 - width * 0.5,
        y: Math.random() * height * 2 - height * 0.5,
        // Bright stars are larger and more opaque
        r: isBright ? Math.random() * 1.5 + 1.0 : Math.random() * 0.8 + 0.2,
        a: isBright ? Math.random() * 0.4 + 0.5 : Math.random() * 0.2 + 0.05,
        // Depth for parallax: 0.1 = far (slow), 0.9 = near (faster)
        depth: Math.random() * 0.8 + 0.1,
      });
    }

    // Sort by depth so distant stars render first
    this.stars.sort((a, b) => a.depth - b.depth);
  }

  /**
   * Render the starfield with parallax based on pan position.
   * Stars at different depths move at different rates.
   */
  render(ctx: CanvasRenderingContext2D, panX: number, panY: number): void {
    if (this.stars.length === 0) return;

    const { width, height } = this;
    const { parallaxIntensity } = this.options;

    ctx.save();

    for (const star of this.stars) {
      // Parallax: deeper stars move less with pan
      const parallaxFactor = star.depth * parallaxIntensity;
      const sx = star.x + panX * parallaxFactor;
      const sy = star.y + panY * parallaxFactor;

      // Wrap stars that go off screen for seamless scrolling
      const wrappedX = (((sx % (width * 2)) + width * 2) % (width * 2)) - width * 0.5;
      const wrappedY = (((sy % (height * 2)) + height * 2) % (height * 2)) - height * 0.5;

      // Skip if outside visible area
      if (wrappedX < -5 || wrappedX > width + 5 || wrappedY < -5 || wrappedY > height + 5) {
        continue;
      }

      ctx.globalAlpha = star.a;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(wrappedX, wrappedY, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Check if starfield needs regeneration (dimensions changed)
   */
  needsRegeneration(width: number, height: number): boolean {
    return this.width !== width || this.height !== height || this.stars.length === 0;
  }
}
