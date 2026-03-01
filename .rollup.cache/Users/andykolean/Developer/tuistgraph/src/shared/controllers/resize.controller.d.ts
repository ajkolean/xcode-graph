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
export declare class ResizeController implements ReactiveController {
    private readonly onResize;
    constructor(host: ReactiveControllerHost, onResize: () => void);
    hostConnected(): void;
    hostDisconnected(): void;
}
