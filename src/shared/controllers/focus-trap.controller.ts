/**
 * Focus Trap Controller - Reactive focus trap integration for Lit
 *
 * Wraps the `focus-trap` library as a Lit reactive controller that
 * activates/deactivates based on a reactive condition. Designed for
 * Web Components with shadow DOM support.
 *
 * @module controllers/focus-trap
 *
 * @example
 * ```typescript
 * import { LitElement } from 'lit';
 * import { FocusTrapController } from '@shared/controllers/focus-trap.controller';
 *
 * class MyPanel extends LitElement {
 *   private readonly focusTrap = new FocusTrapController(this, {
 *     isActive: () => this.isOpen,
 *     onDeactivate: () => this.close(),
 *     escapeDeactivates: true,
 *     clickOutsideDeactivates: true,
 *   });
 * }
 * ```
 */

import { createFocusTrap, type FocusTrap } from 'focus-trap';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

// ==================== Type Definitions ====================

/**
 * Configuration for the focus trap controller.
 */
export interface FocusTrapConfig {
  /** A function returning whether the trap should be active. Evaluated on each host update. */
  isActive: () => boolean;
  /** Optional CSS selector for the element to receive initial focus. */
  initialFocus?: string;
  /** Whether to return focus to the previously focused element on deactivation. Defaults to `true`. */
  returnFocusOnDeactivate?: boolean;
  /** Callback invoked when the trap is deactivated (e.g. via Escape or outside click). */
  onDeactivate?: () => void;
  /** Whether pressing Escape deactivates the trap. Defaults to `true`. */
  escapeDeactivates?: boolean;
  /** Whether clicking outside the trap deactivates it. Defaults to `false`. */
  clickOutsideDeactivates?: boolean;
}

// ==================== Controller Class ====================

/**
 * Reactive controller that manages a focus trap on the host element.
 *
 * Activates or deactivates the trap in `hostUpdated()` based on the
 * `isActive()` predicate, ensuring the trap state stays in sync with
 * the component's reactive properties.
 *
 * Uses `getShadowRoot` to properly traverse Web Component shadow DOMs.
 */
export class FocusTrapController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private readonly config: Required<
    Pick<
      FocusTrapConfig,
      'isActive' | 'returnFocusOnDeactivate' | 'escapeDeactivates' | 'clickOutsideDeactivates'
    >
  > &
    Pick<FocusTrapConfig, 'initialFocus' | 'onDeactivate'>;
  private trap: FocusTrap | null = null;

  constructor(host: ReactiveControllerHost & HTMLElement, config: FocusTrapConfig) {
    this.host = host;
    this.config = {
      isActive: config.isActive,
      initialFocus: config.initialFocus,
      returnFocusOnDeactivate: config.returnFocusOnDeactivate ?? true,
      onDeactivate: config.onDeactivate,
      escapeDeactivates: config.escapeDeactivates ?? true,
      clickOutsideDeactivates: config.clickOutsideDeactivates ?? false,
    };
    host.addController(this);
  }

  /** Whether the focus trap is currently active. */
  get active(): boolean {
    return this.trap?.active ?? false;
  }

  hostConnected(): void {
    // Trap is lazily created on first activation in hostUpdated
  }

  hostUpdated(): void {
    const shouldBeActive = this.config.isActive();

    if (shouldBeActive && !this.trap?.active) {
      this.activate();
    } else if (!shouldBeActive && this.trap?.active) {
      this.deactivate();
    }
  }

  hostDisconnected(): void {
    this.deactivate();
    this.trap = null;
  }

  private activate(): void {
    try {
      if (!this.trap) {
        this.trap = createFocusTrap(this.host, {
          initialFocus: this.config.initialFocus ?? false,
          fallbackFocus: this.host,
          returnFocusOnDeactivate: this.config.returnFocusOnDeactivate,
          escapeDeactivates: this.config.escapeDeactivates,
          clickOutsideDeactivates: this.config.clickOutsideDeactivates,
          onDeactivate: this.config.onDeactivate,
          allowOutsideClick: true,
          tabbableOptions: {
            displayCheck: 'none',
            getShadowRoot: (node) => {
              if (node instanceof HTMLElement && node.shadowRoot) {
                return node.shadowRoot;
              }
              return false;
            },
          },
        });
      }
      this.trap.activate();
    } catch (e) {
      console.warn('[FocusTrapController] Error during activation:', e);
    }
  }

  private deactivate(): void {
    try {
      if (this.trap?.active) {
        this.trap.deactivate({ returnFocus: this.config.returnFocusOnDeactivate });
      }
    } catch (e) {
      console.warn('[FocusTrapController] Error during deactivation:', e);
    }
  }
}
