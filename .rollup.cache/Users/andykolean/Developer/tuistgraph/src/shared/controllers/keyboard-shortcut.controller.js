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
// ==================== Controller Class ====================
/**
 * Reactive controller that listens for a global keydown event matching a
 * configured key, and invokes a callback.
 *
 * Automatically adds the listener on connect and removes it on disconnect.
 */
export class KeyboardShortcutController {
    config;
    handleKeyDown;
    constructor(host, config) {
        this.config = {
            key: config.key,
            onTrigger: config.onTrigger,
            preventDefault: config.preventDefault ?? true,
            ignoreWhenInputFocused: config.ignoreWhenInputFocused ?? true,
        };
        this.handleKeyDown = (e) => {
            if (e.key !== this.config.key)
                return;
            if (this.config.ignoreWhenInputFocused && this.isInputFocused())
                return;
            if (this.config.preventDefault) {
                e.preventDefault();
            }
            this.config.onTrigger();
        };
        host.addController(this);
    }
    hostConnected() {
        window.addEventListener('keydown', this.handleKeyDown);
    }
    hostDisconnected() {
        try {
            window.removeEventListener('keydown', this.handleKeyDown);
        }
        catch (error) {
            console.error('[KeyboardShortcutController] Error during cleanup:', error);
        }
    }
    /**
     * Check if an input, textarea, or contentEditable element is currently focused.
     * Also checks within shadow roots for active input elements.
     */
    isInputFocused() {
        const active = document.activeElement;
        if (!active)
            return false;
        const tag = active.tagName.toLowerCase();
        const el = active;
        if (tag === 'input' ||
            tag === 'textarea' ||
            el.isContentEditable ||
            el.contentEditable === 'true') {
            return true;
        }
        const root = active.shadowRoot;
        if (root?.activeElement) {
            const innerTag = root.activeElement.tagName.toLowerCase();
            return innerTag === 'input' || innerTag === 'textarea';
        }
        return false;
    }
}
//# sourceMappingURL=keyboard-shortcut.controller.js.map