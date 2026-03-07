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
export class KeyboardShortcutController implements ReactiveController {
  private readonly config: Required<KeyboardShortcutConfig>;
  private readonly handleKeyDown: (e: KeyboardEvent) => void;

  constructor(host: ReactiveControllerHost, config: KeyboardShortcutConfig) {
    this.config = {
      key: config.key,
      onTrigger: config.onTrigger,
      preventDefault: config.preventDefault ?? true,
      ignoreWhenInputFocused: config.ignoreWhenInputFocused ?? true,
    };

    this.handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== this.config.key) return;
      if (this.config.ignoreWhenInputFocused && this.isInputFocused()) return;

      if (this.config.preventDefault) {
        e.preventDefault();
      }
      this.config.onTrigger();
    };

    host.addController(this);
  }

  /** Registers the global keydown listener when the host connects to the DOM. */
  hostConnected(): void {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  /** Removes the global keydown listener when the host disconnects from the DOM. */
  hostDisconnected(): void {
    try {
      window.removeEventListener('keydown', this.handleKeyDown);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[KeyboardShortcutController] Error during cleanup:', error);
      }
    }
  }

  /**
   * Check if an input, textarea, or contentEditable element is currently focused.
   * Also checks within shadow roots for active input elements.
   */
  private isInputFocused(): boolean {
    const active = document.activeElement;
    if (!active) return false;
    const tag = active.tagName.toLowerCase();
    const el = active as HTMLElement;
    if (
      tag === 'input' ||
      tag === 'textarea' ||
      el.isContentEditable ||
      el.contentEditable === 'true'
    ) {
      return true;
    }
    const root = active.shadowRoot;
    /* v8 ignore start -- shadow DOM focus detection; tested via activeElement mock */
    if (root?.activeElement) {
      const innerTag = root.activeElement.tagName.toLowerCase();
      return innerTag === 'input' || innerTag === 'textarea';
    }
    /* v8 ignore stop */
    return false;
  }
}
