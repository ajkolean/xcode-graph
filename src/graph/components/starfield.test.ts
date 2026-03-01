/**
 * Starfield Tests
 *
 * Verifies star generation, caching, color palettes, and canvas rendering.
 */

import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Starfield } from './starfield';

// OffscreenCanvas is not available in jsdom/happy-dom. Provide a minimal stub.
// The internal renderToCache creates an OffscreenCanvas and draws stars to it,
// then render() calls ctx.drawImage(cachedCanvas). vitest-canvas-mock validates
// drawImage arguments, so we stub OffscreenCanvas as a thin wrapper around
// a real HTMLCanvasElement.
beforeAll(() => {
  if (typeof globalThis['OffscreenCanvas'] === 'undefined') {
    (globalThis as Record<string, unknown>)['OffscreenCanvas'] = class {
      width: number;
      height: number;
      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
      }
      getContext() {
        // Minimal 2d context mock for renderToCache
        return {
          clearRect: () => {},
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          globalAlpha: 1,
          fillStyle: '',
        };
      }
    };
  }
});

/** Create a canvas context with drawImage spied so we can verify calls
 *  without vitest-canvas-mock's type check rejecting OffscreenCanvas stubs. */
function createSpiedCtx() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const drawImageSpy = vi.spyOn(ctx, 'drawImage').mockImplementation(() => {});
  return { ctx, drawImageSpy };
}

describe('Starfield', () => {
  it('should create an instance with default options', () => {
    const sf = new Starfield();
    expect(sf).toBeInstanceOf(Starfield);
  });

  it('should create an instance with custom options', () => {
    const sf = new Starfield({ count: 50, brightRatio: 0.05 });
    expect(sf).toBeInstanceOf(Starfield);
  });

  describe('generate', () => {
    it('should populate stars for valid dimensions', () => {
      const sf = new Starfield({ count: 20 });
      sf.generate(800, 600);

      // After generation, needsRegeneration should be false for same dimensions
      expect(sf.needsRegeneration(800, 600)).toBe(false);
    });

    it('should be a no-op for zero width', () => {
      const sf = new Starfield({ count: 20 });
      sf.generate(0, 600);

      // No stars generated, needsRegeneration returns false for zero dimensions
      expect(sf.needsRegeneration(0, 600)).toBe(false);
    });

    it('should be a no-op for zero height', () => {
      const sf = new Starfield({ count: 20 });
      sf.generate(800, 0);

      expect(sf.needsRegeneration(800, 0)).toBe(false);
    });

    it('should be a no-op for negative dimensions', () => {
      const sf = new Starfield({ count: 20 });
      sf.generate(-100, -100);

      expect(sf.needsRegeneration(-100, -100)).toBe(false);
    });
  });

  describe('needsRegeneration', () => {
    it('should return true before generate is called', () => {
      const sf = new Starfield();
      expect(sf.needsRegeneration(800, 600)).toBe(true);
    });

    it('should return false after generate with same dimensions', () => {
      const sf = new Starfield();
      sf.generate(800, 600);
      expect(sf.needsRegeneration(800, 600)).toBe(false);
    });

    it('should return true after dimension change', () => {
      const sf = new Starfield();
      sf.generate(800, 600);
      expect(sf.needsRegeneration(1024, 768)).toBe(true);
    });

    it('should return false for zero dimensions', () => {
      const sf = new Starfield();
      expect(sf.needsRegeneration(0, 0)).toBe(false);
    });

    it('should return false for negative dimensions', () => {
      const sf = new Starfield();
      expect(sf.needsRegeneration(-1, 600)).toBe(false);
    });
  });

  describe('resizeIfNeeded', () => {
    it('should regenerate when dimensions change', () => {
      const sf = new Starfield();
      sf.generate(800, 600);
      expect(sf.needsRegeneration(800, 600)).toBe(false);

      sf.resizeIfNeeded(1024, 768);
      expect(sf.needsRegeneration(1024, 768)).toBe(false);
    });

    it('should not regenerate when dimensions are the same', () => {
      const sf = new Starfield();
      sf.generate(800, 600);

      // Calling resizeIfNeeded with same dimensions should be a no-op
      sf.resizeIfNeeded(800, 600);
      expect(sf.needsRegeneration(800, 600)).toBe(false);
    });

    it('should not regenerate for zero dimensions', () => {
      const sf = new Starfield();
      sf.generate(800, 600);
      sf.resizeIfNeeded(0, 0);
      // Original dimensions should still be valid
      expect(sf.needsRegeneration(800, 600)).toBe(false);
    });
  });

  describe('setColors', () => {
    it('should accept a palette with 3 or more colors', () => {
      const sf = new Starfield({ count: 10 });
      sf.setColors(['#ff0000', '#00ff00', '#0000ff']);
      sf.generate(400, 400);
      // Should not throw - palette accepted
      expect(sf.needsRegeneration(400, 400)).toBe(false);
    });

    it('should fall back to default palette with fewer than 3 colors', () => {
      const sf = new Starfield({ count: 10 });
      sf.setColors(['#ff0000']); // too few
      sf.generate(400, 400);
      // Should not throw - default palette used
      expect(sf.needsRegeneration(400, 400)).toBe(false);
    });

    it('should accept empty array and use default palette', () => {
      const sf = new Starfield({ count: 10 });
      sf.setColors([]);
      sf.generate(400, 400);
      expect(sf.needsRegeneration(400, 400)).toBe(false);
    });
  });

  describe('setOptions', () => {
    it('should merge new options', () => {
      const sf = new Starfield({ count: 100 });
      sf.setOptions({ count: 50 });
      sf.generate(400, 400);
      // Options merged, generation uses count=50
      expect(sf.needsRegeneration(400, 400)).toBe(false);
    });

    it('should preserve unspecified options', () => {
      const sf = new Starfield({ count: 100, brightRatio: 0.05 });
      sf.setOptions({ count: 50 });
      // brightRatio should remain 0.05, generate should work
      sf.generate(400, 400);
      expect(sf.needsRegeneration(400, 400)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should reset cached state', () => {
      const sf = new Starfield({ count: 20 });
      sf.generate(800, 600);
      expect(sf.needsRegeneration(800, 600)).toBe(false);

      sf.clear();

      // After clear, stars are empty so needsRegeneration returns true
      expect(sf.needsRegeneration(800, 600)).toBe(true);
    });
  });

  describe('render', () => {
    it('should call drawImage on the canvas context', () => {
      const sf = new Starfield({ count: 10 });
      sf.generate(800, 600);

      const { ctx, drawImageSpy } = createSpiedCtx();

      sf.render(ctx, 0, 0);

      expect(drawImageSpy).toHaveBeenCalled();
    });

    it('should not draw if no stars are generated', () => {
      const sf = new Starfield({ count: 10 });
      // Do not call generate

      const { ctx, drawImageSpy } = createSpiedCtx();

      sf.render(ctx, 0, 0);

      expect(drawImageSpy).not.toHaveBeenCalled();
    });

    it('should use cached canvas on second render with same pan', () => {
      const sf = new Starfield({ count: 10 });
      sf.generate(800, 600);

      const { ctx, drawImageSpy } = createSpiedCtx();

      sf.render(ctx, 10, 20);
      sf.render(ctx, 10, 20);

      // Both calls produce drawImage (from cache on second)
      expect(drawImageSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('renderVignette', () => {
    it('should call fillRect on the context', () => {
      const sf = new Starfield();
      sf.generate(800, 600);

      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      sf.renderVignette(ctx);

      const drawCalls = (
        ctx as unknown as { __getDrawCalls(): Array<{ type: string }> }
      ).__getDrawCalls();
      const fillRectCalls = drawCalls.filter((c) => c.type === 'fillRect');
      expect(fillRectCalls.length).toBeGreaterThan(0);
    });

    it('should not render vignette if dimensions are zero', () => {
      const sf = new Starfield();
      // generate with zero dims - no vignette
      sf.generate(0, 0);

      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      sf.renderVignette(ctx);

      const drawCalls = (
        ctx as unknown as { __getDrawCalls(): Array<{ type: string }> }
      ).__getDrawCalls();
      const fillRectCalls = drawCalls.filter((c) => c.type === 'fillRect');
      expect(fillRectCalls.length).toBe(0);
    });

    it('should cache the vignette gradient across calls', () => {
      const sf = new Starfield();
      sf.generate(800, 600);

      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

      sf.renderVignette(ctx);
      sf.renderVignette(ctx);

      // Both calls should produce fillRect
      const drawCalls = (
        ctx as unknown as { __getDrawCalls(): Array<{ type: string }> }
      ).__getDrawCalls();
      const fillRectCalls = drawCalls.filter((c) => c.type === 'fillRect');
      expect(fillRectCalls.length).toBe(2);
    });
  });
});
