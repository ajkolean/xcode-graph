/**
 * Reduced Motion Signal
 *
 * Reactive signal that tracks the user's `prefers-reduced-motion` OS preference.
 * Canvas animations should check this signal and skip or simplify motion when enabled.
 *
 * @module shared/signals/reduced-motion.signals
 */

import { type Signal, signal } from '@lit-labs/signals';

/**
 * Whether the user prefers reduced motion (tracks OS media query)
 * @internal
 */
export const prefersReducedMotion: Signal.State<boolean> = signal(
  globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
);

globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.addEventListener('change', (e) => {
  prefersReducedMotion.set(e.matches);
});
