/**
 * Keyboard Shortcut Controller - Global key listener for Lit components
 *
 * Configurable reactive controller that listens for a specific key press
 * and fires a callback. Optionally skips when an input/textarea is focused.
 *
 * @module controllers/keyboard-shortcut
 *
 * @example
 * ```typescript
 * import { LitElement } from 'lit';
 * import { KeyboardShortcutController } from '@shared/controllers/keyboard-shortcut.controller';
 *
 * class MyComponent extends LitElement {
 *   private readonly shortcut = new KeyboardShortcutController(this, {
 *     key: '/',
 *     onTrigger: () => this.focusSearch(),
 *     preventDefault: true,
 *     ignoreWhenInputFocused: true,
 *   });
 * }
 * ```
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit';
/**
 * Configuration for the keyboard shortcut controller.
 */
export interface KeyboardShortcutConfig {
    /** The key to listen for (matched against `KeyboardEvent.key`). */
    key: string;
    /** Callback invoked when the key is pressed. */
    onTrigger: () => void;
    /** Whether to call `preventDefault()` on the event. Defaults to `true`. */
    preventDefault?: boolean;
    /** Whether to skip the callback when an input or textarea is focused. Defaults to `true`. */
    ignoreWhenInputFocused?: boolean;
}
/**
 * Reactive controller that listens for a global keydown event matching a
 * configured key, and invokes a callback.
 *
 * Automatically adds the listener on connect and removes it on disconnect.
 */
export declare class KeyboardShortcutController implements ReactiveController {
    private readonly config;
    private readonly handleKeyDown;
    constructor(host: ReactiveControllerHost, config: KeyboardShortcutConfig);
    hostConnected(): void;
    hostDisconnected(): void;
    /**
     * Check if an input, textarea, or contentEditable element is currently focused.
     * Also checks within shadow roots for active input elements.
     */
    private isInputFocused;
}
//# sourceMappingURL=keyboard-shortcut.controller.d.ts.map