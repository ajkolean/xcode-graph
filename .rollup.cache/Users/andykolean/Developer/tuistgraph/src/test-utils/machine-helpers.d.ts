/**
 * State Machine Test Utilities
 *
 * Helper functions for testing Zag.js state machines with type safety.
 * Provides utilities for creating test contexts and asserting state transitions.
 *
 * @module test-utils/machine-helpers
 */
import type { Machine, MachineSchema, Service } from '@zag-js/core';
/**
 * Configuration for creating a test machine service
 */
export interface MachineTestConfig<TSchema extends MachineSchema> {
    /** The machine to test */
    machine: Machine<TSchema>;
    /** Initial props to pass to the machine */
    props?: TSchema['props'];
    /** Initial context values (partial override) */
    context?: Partial<TSchema['context']>;
}
/**
 * Test context for a state machine service
 *
 * Provides utilities for testing state machines including:
 * - Service instance for sending events
 * - State inspection utilities
 * - Context value getters
 * - Cleanup function
 */
export interface MachineTestContext<TSchema extends MachineSchema> {
    /** The interpreted service */
    service: Service<TSchema>;
    /** Get the current state */
    getState: () => TSchema['state'];
    /** Get a context value */
    getContext: <K extends keyof TSchema['context']>(key: K) => TSchema['context'][K];
    /** Send an event and wait for it to be processed */
    sendAndWait: (event: TSchema['event']) => Promise<void>;
    /** Cleanup function to stop the service */
    cleanup: () => void;
}
/**
 * Create a test context for a state machine
 *
 * Sets up an interpreted service with the provided configuration and
 * returns utilities for testing state transitions and context updates.
 *
 * @param config - Machine configuration
 * @returns Test context with utilities
 *
 * @example
 * ```ts
 * const ctx = createMachineTestContext({
 *   machine: sidebarMachine,
 *   props: { id: 'test-sidebar' },
 * });
 *
 * expect(ctx.getState()).toBe('expanded');
 * ctx.service.send({ type: 'TOGGLE' });
 * expect(ctx.getState()).toBe('collapsed');
 *
 * ctx.cleanup();
 * ```
 */
export declare function createMachineTestContext<TSchema extends MachineSchema>(config: MachineTestConfig<TSchema>): MachineTestContext<TSchema>;
/**
 * Assert that a state machine is in a specific state
 *
 * @param ctx - The machine test context
 * @param expectedState - The expected state
 * @throws If the current state doesn't match
 */
export declare function assertMachineState<TSchema extends MachineSchema>(ctx: MachineTestContext<TSchema>, expectedState: TSchema['state']): void;
/**
 * Assert that a context value matches the expected value
 *
 * @param ctx - The machine test context
 * @param key - The context key to check
 * @param expectedValue - The expected value
 * @throws If the current value doesn't match
 */
export declare function assertMachineContext<TSchema extends MachineSchema, K extends keyof TSchema['context']>(ctx: MachineTestContext<TSchema>, key: K, expectedValue: TSchema['context'][K]): void;
//# sourceMappingURL=machine-helpers.d.ts.map