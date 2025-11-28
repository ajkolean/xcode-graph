import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { StoreApi, UseBoundStore } from 'zustand';

/**
 * A Lit Reactive Controller for subscribing to Zustand stores.
 *
 * This controller enables Lit components to reactively subscribe to Zustand
 * store state changes, automatically triggering re-renders when selected
 * state changes.
 *
 * @example
 * ```typescript
 * import { LitElement, html } from 'lit';
 * import { customElement } from 'lit/decorators.js';
 * import { createStoreController } from '@/controllers/zustand.controller';
 * import { useGraphStore } from '@/stores/graphStore';
 *
 * @customElement('my-component')
 * class MyComponent extends LitElement {
 *   private selectedNode = createStoreController(
 *     this,
 *     useGraphStore,
 *     (s) => s.selectedNode
 *   );
 *
 *   render() {
 *     return html`<div>Selected: ${this.selectedNode.value?.name}</div>`;
 *   }
 * }
 * ```
 */
export class ZustandController<TState, TSelected> implements ReactiveController {
  private host: ReactiveControllerHost;
  private store: UseBoundStore<StoreApi<TState>>;
  private selector: (state: TState) => TSelected;
  private unsubscribe?: () => void;

  /** The current selected value from the store */
  value: TSelected;

  constructor(
    host: ReactiveControllerHost,
    store: UseBoundStore<StoreApi<TState>>,
    selector: (state: TState) => TSelected,
  ) {
    this.host = host;
    this.store = store;
    this.selector = selector;
    this.value = selector(store.getState());
    host.addController(this);
  }

  /**
   * Called when the host element is connected to the DOM.
   * Subscribes to the Zustand store.
   */
  hostConnected(): void {
    // Defensive cleanup of any existing subscription
    this.unsubscribe?.();

    this.unsubscribe = this.store.subscribe((state) => {
      const newValue = this.selector(state);
      // Only trigger update if the selected value has changed
      if (!Object.is(newValue, this.value)) {
        this.value = newValue;
        this.host.requestUpdate();
      }
    });
  }

  /**
   * Called when the host element is disconnected from the DOM.
   * Unsubscribes from the Zustand store.
   */
  hostDisconnected(): void {
    this.unsubscribe?.();
  }

  /**
   * Get an action from the store.
   * Useful for dispatching actions to the store.
   */
  getAction<TAction extends keyof TState>(actionName: TAction): TState[TAction] {
    return this.store.getState()[actionName];
  }

  /**
   * Get the full store state (use sparingly, prefer selectors)
   */
  getState(): TState {
    return this.store.getState();
  }
}

/**
 * Factory function to create a ZustandController with proper typing.
 *
 * @param host - The Lit element host
 * @param store - The Zustand store
 * @param selector - A function to select the desired state slice
 * @returns A ZustandController instance
 *
 * @example
 * ```typescript
 * // Select a single value
 * const selectedNode = createStoreController(this, useGraphStore, (s) => s.selectedNode);
 *
 * // Select multiple values (creates a new object, so use wisely)
 * const state = createStoreController(this, useGraphStore, (s) => ({
 *   node: s.selectedNode,
 *   mode: s.viewMode,
 * }));
 * ```
 */
export function createStoreController<TState, TSelected>(
  host: ReactiveControllerHost,
  store: UseBoundStore<StoreApi<TState>>,
  selector: (state: TState) => TSelected,
): ZustandController<TState, TSelected> {
  return new ZustandController(host, store, selector);
}

/**
 * Helper type to extract the state type from a Zustand store
 */
export type StoreState<T> = T extends UseBoundStore<StoreApi<infer S>> ? S : never;
