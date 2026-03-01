/**
 * Re-export ResizeController from @lit-labs/observers
 *
 * Wraps the native ResizeObserver API as a Lit reactive controller.
 * Observes the host element directly (not window resize events),
 * so it detects sidebar collapse, flex changes, and container resizes.
 *
 * @module controllers/resize
 *
 * @example
 * ```typescript
 * import { LitElement } from 'lit';
 * import { ResizeController } from '@shared/controllers/resize.controller';
 *
 * class MyComponent extends LitElement {
 *   private readonly resize = new ResizeController(this, {
 *     callback: (entries) => {
 *       const { width, height } = entries[0].contentRect;
 *       this.handleResize(width, height);
 *     },
 *   });
 * }
 * ```
 */

export { ResizeController } from '@lit-labs/observers/resize-controller.js';
