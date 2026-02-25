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
export function createSignalSnapshot(signals: Signal.State<unknown>[]): SignalSnapshot {
  const snapshot = new Map<Signal.State<unknown>, unknown>();

  for (const sig of signals) {
    snapshot.set(sig, sig.get());
  }

  return snapshot;
}

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
export function restoreSignalSnapshot(snapshot: SignalSnapshot): void {
  for (const [sig, value] of snapshot.entries()) {
    (sig as Signal.State<unknown>).set(value);
  }
}

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
export function resetSignal<T>(signal: Signal.State<T>, value: T): void {
  signal.set(value);
}

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
export function spyOnSignal<T>(signal: Signal.State<T>): {
  get: () => T[];
  cleanup: () => void;
} {
  const changes: T[] = [];
  let previousValue = signal.get();

  // Use a computed signal to track changes
  const watcher = new Signal.Computed(() => {
    const currentValue = signal.get();
    if (currentValue !== previousValue) {
      changes.push(currentValue);
      previousValue = currentValue;
    }
    return currentValue;
  });

  // Force initial computation
  watcher.get();

  return {
    get: () => [...changes],
    cleanup: () => {
      // Computed signals don't have explicit cleanup in Lit signals
      // Just clear the changes array
      changes.length = 0;
    },
  };
}
