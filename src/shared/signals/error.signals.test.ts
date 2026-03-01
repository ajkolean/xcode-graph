/**
 * Error Signals tests - branch coverage for computed functions
 */

import { afterEach, describe, expect, it } from 'vitest';
import type { AppError } from '@shared/schemas/error.types';
import {
  errors,
  maxVisibleToasts,
  getVisibleErrors,
  getToastErrors,
  getErrorById,
  resetErrorSignals,
} from './error.signals';

function makeError(overrides: Partial<AppError> = {}): AppError {
  return {
    id: 'e1',
    message: 'test error',
    severity: 'error',
    category: 'data',
    timestamp: Date.now(),
    dismissed: false,
    ...overrides,
  } as AppError;
}

describe('error.signals', () => {
  afterEach(() => {
    resetErrorSignals();
  });

  describe('getVisibleErrors', () => {
    it('returns non-dismissed errors', () => {
      errors.set([
        makeError({ id: 'e1', dismissed: false }),
        makeError({ id: 'e2', dismissed: true }),
        makeError({ id: 'e3', dismissed: false }),
      ]);
      const visible = getVisibleErrors();
      expect(visible).toHaveLength(2);
      expect(visible.map((e) => e.id)).toEqual(['e1', 'e3']);
    });

    it('returns empty when all dismissed', () => {
      errors.set([makeError({ dismissed: true })]);
      expect(getVisibleErrors()).toHaveLength(0);
    });
  });

  describe('getToastErrors', () => {
    it('returns up to maxVisibleToasts', () => {
      errors.set([
        makeError({ id: 'e1' }),
        makeError({ id: 'e2' }),
        makeError({ id: 'e3' }),
      ]);
      maxVisibleToasts.set(2);
      const toasts = getToastErrors();
      expect(toasts).toHaveLength(2);
    });

    it('excludes dismissed from toast count', () => {
      errors.set([
        makeError({ id: 'e1', dismissed: true }),
        makeError({ id: 'e2' }),
      ]);
      maxVisibleToasts.set(5);
      expect(getToastErrors()).toHaveLength(1);
    });
  });

  describe('getErrorById', () => {
    it('finds error by id', () => {
      errors.set([makeError({ id: 'e1' }), makeError({ id: 'e2' })]);
      expect(getErrorById('e2')?.id).toBe('e2');
    });

    it('returns undefined for missing id', () => {
      errors.set([makeError({ id: 'e1' })]);
      expect(getErrorById('missing')).toBeUndefined();
    });
  });
});
