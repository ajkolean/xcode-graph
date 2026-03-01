/**
 * Signal Test Utilities
 *
 * Helper functions for testing Lit signals with proper isolation.
 * Provides utilities for capturing and restoring signal state.
 *
 * @module test-utils/signal-helpers
 */

import type { Signal } from '@lit-labs/signals';

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
