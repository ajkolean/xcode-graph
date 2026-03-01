/**
 * Resize Controller - Window resize listener for Lit components
 *
 * Simple reactive controller that listens for `window.resize` events
 * and invokes a callback. Handles cleanup on disconnect.
 *
 * @module controllers/resize
 *
 * @example
 * ```typescript
 * import { LitElement } from 'lit';
 * import { ResizeController } from '@shared/controllers/resize.controller';
 *
 * class MyComponent extends LitElement {
 *   private readonly resize = new ResizeController(this, () => this.handleResize());
 *
 *   private handleResize() {
 *     // respond to window resize
 *   }
 * }
 * ```
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Reactive controller that listens for window resize events.
 *
 * Automatically adds the listener on connect and removes it on disconnect.
 */
export class ResizeController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly onResize: () => void;

  constructor(host: ReactiveControllerHost, onResize: () => void) {
    this.host = host;
    this.onResize = onResize;
    host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener('resize', this.onResize);
  }

  hostDisconnected(): void {
    try {
      window.removeEventListener('resize', this.onResize);
    } catch (error) {
      console.error('[ResizeController] Error during cleanup:', error);
    }
  }
}
