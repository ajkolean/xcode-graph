/**
 * Signal Test Utilities
 *
 * Helper functions for testing Lit signals with proper isolation.
 * Provides utilities for capturing and restoring signal state.
 *
 * @module test-utils/signal-helpers
 */
import { Signal } from '@lit-labs/signals';
/**
 * Snapshot of signal values
 *
 * Maps signal instances to their captured values.
 */
export type SignalSnapshot = Map<Signal.State<unknown>, unknown>;
/**
 * Create a snapshot of current signal values
 *
 * Captures the current state of signals so they can be restored later.
 * Useful for test isolation to prevent state leakage between tests.
 *
 * @param signals - Array of signals to snapshot
 * @returns Snapshot object that can be restored later
 *
 * @example
 * ```ts
 * const snapshot = createSignalSnapshot([selectedNode, viewMode]);
 * // ... run test that modifies signals ...
 * restoreSignalSnapshot(snapshot);
 * ```
 */
export declare function createSignalSnapshot(signals: Signal.State<unknown>[]): SignalSnapshot;
/**
 * Restore signals to their snapshot values
 *
 * Restores signals to the state captured in a snapshot.
 * This is typically called in afterEach() to clean up test state.
 *
 * @param snapshot - Snapshot created by createSignalSnapshot
 *
 * @example
 * ```ts
 * describe('my tests', () => {
 *   let snapshot: SignalSnapshot;
 *
 *   beforeEach(() => {
 *     snapshot = createSignalSnapshot([selectedNode, viewMode]);
 *   });
 *
 *   afterEach(() => {
 *     restoreSignalSnapshot(snapshot);
 *   });
 * });
 * ```
 */
export declare function restoreSignalSnapshot(snapshot: SignalSnapshot): void;
/**
 * Reset a signal to a specific value
 *
 * Simple helper to reset a signal to a known state.
 * Useful for setting up test preconditions.
 *
 * @param signal - The signal to reset
 * @param value - The value to set
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   resetSignal(selectedNode, null);
 *   resetSignal(viewMode, ViewMode.Full);
 * });
 * ```
 */
export declare function resetSignal<T>(signal: Signal.State<T>, value: T): void;
/**
 * Spy on signal changes
 *
 * Creates a watcher that tracks all changes to a signal.
 * Returns a function to get the change history.
 *
 * @param signal - The signal to watch
 * @returns Object with get() to retrieve changes and cleanup()
 *
 * @example
 * ```ts
 * const spy = spyOnSignal(viewMode);
 * setViewMode(ViewMode.Focused);
 * setViewMode(ViewMode.Full);
 *
 * expect(spy.get()).toEqual([ViewMode.Focused, ViewMode.Full]);
 * spy.cleanup();
 * ```
 */
export declare function spyOnSignal<T>(signal: Signal.State<T>): {
    get: () => T[];
    cleanup: () => void;
};
