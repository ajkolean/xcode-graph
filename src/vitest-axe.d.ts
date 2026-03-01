import type {} from 'vitest';

interface AxeCustomMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module 'vitest' {
  // biome-ignore lint/suspicious/noExplicitAny: vitest's generic default
  interface Assertion<T = any> extends AxeCustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends AxeCustomMatchers {}
}
