/**
 * State Machine Test Utilities
 *
 * Helper functions for testing Zag.js state machines with type safety.
 * Provides utilities for creating test contexts and asserting state transitions.
 *
 * @module test-utils/machine-helpers
 */
import { createTypedMachine } from '@shared/utils/zag-helpers';
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
export function createMachineTestContext(config) {
    const { machine, props = {}, context } = config;
    // Create the Vanilla Machine instance with props
    const { instance, service } = createTypedMachine(machine, props);
    // Override initial context if provided
    if (context) {
        for (const [key, value] of Object.entries(context)) {
            service.context.set(key, value);
        }
    }
    // Start the machine
    instance.start();
    return {
        service,
        getState: () => service.state.get(),
        getContext: (key) => service.context.get(key),
        sendAndWait: async (event) => {
            service.send(event);
            // Wait for microtask queue to flush (VanillaMachine uses queueMicrotask)
            await new Promise((resolve) => queueMicrotask(resolve));
        },
        cleanup: () => instance.stop(),
    };
}
/**
 * Assert that a state machine is in a specific state
 *
 * @param ctx - The machine test context
 * @param expectedState - The expected state
 * @throws If the current state doesn't match
 */
export function assertMachineState(ctx, expectedState) {
    const currentState = ctx.getState();
    if (currentState !== expectedState) {
        throw new Error(`Expected state "${String(expectedState)}" but got "${String(currentState)}"`);
    }
}
/**
 * Assert that a context value matches the expected value
 *
 * @param ctx - The machine test context
 * @param key - The context key to check
 * @param expectedValue - The expected value
 * @throws If the current value doesn't match
 */
export function assertMachineContext(ctx, key, expectedValue) {
    const currentValue = ctx.getContext(key);
    if (currentValue !== expectedValue) {
        throw new Error(`Expected context.${String(key)} to be ${String(expectedValue)} but got ${String(currentValue)}`);
    }
}
//# sourceMappingURL=machine-helpers.js.map