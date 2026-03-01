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
/**
 * Reactive controller that listens for window resize events.
 *
 * Automatically adds the listener on connect and removes it on disconnect.
 */
export class ResizeController {
    onResize;
    constructor(host, onResize) {
        this.onResize = onResize;
        host.addController(this);
    }
    hostConnected() {
        window.addEventListener('resize', this.onResize);
    }
    hostDisconnected() {
        try {
            window.removeEventListener('resize', this.onResize);
        }
        catch (error) {
            console.error('[ResizeController] Error during cleanup:', error);
        }
    }
}
//# sourceMappingURL=resize.controller.js.map