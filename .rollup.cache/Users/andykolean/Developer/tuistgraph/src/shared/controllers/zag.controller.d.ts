/**
 * Zag Controller - Reactive Zag.js integration for Lit
 *
 * This controller enables Lit components to use Zag.js state machines reactively,
 * automatically triggering re-renders when machine state or context changes.
 *
 * @module controllers/zag
 *
 * @example
 * ```typescript
 * import { LitElement, html } from 'lit';
 * import { customElement } from 'lit/decorators.js';
 * import { createMachineController } from '@shared/controllers/zag.controller';
 * import { sidebarMachine } from '@shared/machines/sidebar.machine';
 *
 * @customElement('xcode-graph-sidebar')
 * class GraphSidebar extends LitElement {
 *   private sidebar = createMachineController(this, sidebarMachine, {
 *     id: 'sidebar',
 *     defaultCollapsed: false,
 *   });
 *
 *   render() {
 *     const isCollapsed = this.sidebar.state.matches('collapsed');
 *     const activeTab = this.sidebar.context.get('activeTab');
 *
 *     return html`
 *       <div class="${isCollapsed ? 'collapsed' : 'expanded'}">
 *         <button @click=${() => this.sidebar.send({ type: 'TOGGLE' })}>
 *           Toggle
 *         </button>
 *         <div>Active Tab: ${activeTab}</div>
 *       </div>
 *     `;
 *   }
 * }
 * ```
 */
import type { Machine } from '@zag-js/core';
import { type MachineSchema, type Service } from '@zag-js/core';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
/**
 * A Lit Reactive Controller for Zag.js state machines.
 *
 * Manages the lifecycle of a Zag machine and triggers Lit re-renders
 * when machine state or context changes.
 */
export declare class ZagController<TSchema extends MachineSchema> implements ReactiveController {
    private readonly host;
    private readonly instance;
    private readonly _service;
    private unsubscribe;
    /**
     * The machine service instance.
     * Use this to:
     * - Check state: `service.state.matches('stateName')`
     * - Get context: `service.context.get('key')`
     * - Send events: `service.send({ type: 'EVENT' })`
     */
    get service(): Service<TSchema>;
    /**
     * Get the current state of the machine.
     * Shorthand for `service.state`
     */
    get state(): Service<TSchema>['state'];
    /**
     * Get the machine context.
     * Shorthand for `service.context`
     */
    get context(): Service<TSchema>['context'];
    constructor(host: ReactiveControllerHost, machine: Machine<TSchema>, props: TSchema['props']);
    /**
     * Called when the host element is connected to the DOM.
     * Subscribes to machine state changes.
     */
    hostConnected(): void;
    /**
     * Called when the host element is disconnected from the DOM.
     * Stops the machine and cleans up subscriptions.
     */
    hostDisconnected(): void;
    /**
     * Send an event to the machine.
     * Shorthand for `service.send(event)`
     */
    send(event: TSchema['event']): void;
    /**
     * Check if the machine is in a specific state.
     * Shorthand for `service.state.matches(state)`
     */
    matches(state: TSchema['state']): boolean;
    /**
     * Get a value from the machine context.
     * Shorthand for `service.context.get(key)`
     */
    get<K extends keyof TSchema['context']>(key: K): TSchema['context'][K];
    /**
     * Set a value in the machine context.
     * Shorthand for `service.context.set(key, value)`
     */
    set<K extends keyof TSchema['context']>(key: K, value: TSchema['context'][K]): void;
}
/**
 * Factory function to create a ZagController with proper typing.
 *
 * @param host - The Lit element host
 * @param machine - The Zag.js machine definition
 * @param props - Props to pass to the machine
 * @returns A ZagController instance
 *
 * @example
 * ```typescript
 * // Simple toggle machine
 * const toggle = createMachineController(this, toggleMachine, { id: 'my-toggle' });
 *
 * // Check state
 * const isOpen = toggle.matches('open');
 *
 * // Get context
 * const count = toggle.get('count');
 *
 * // Send events
 * toggle.send({ type: 'TOGGLE' });
 *
 * // Or use service directly
 * toggle.service.send({ type: 'OPEN' });
 * ```
 */
export declare function createMachineController<TSchema extends MachineSchema>(host: ReactiveControllerHost, machine: Machine<TSchema>, props: TSchema['props']): ZagController<TSchema>;
/**
 * Helper to extract machine schema type
 */
export type MachineState<T> = T extends Machine<infer S> ? S : never;
