/**
 * Error Actions tests - branch coverage for signal mutation functions
 */

import type { AppError } from '@shared/schemas/error.types';
import { afterEach, describe, expect, it } from 'vitest';
import {
  addError,
  clearAllErrors,
  clearDismissedErrors,
  clearErrorsByCategory,
  clearErrorsBySeverity,
  dismissError,
  removeError,
  setMaxVisibleToasts,
} from './error.actions';
import { errors, maxVisibleToasts, resetErrorSignals } from './error.signals';

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

describe('error.actions', () => {
  afterEach(() => {
    resetErrorSignals();
  });

  it('addError appends to errors list', () => {
    const err = makeError();
    addError(err);
    expect(errors.get()).toHaveLength(1);
    expect(errors.get()[0]).toBe(err);
  });

  it('removeError filters by id', () => {
    addError(makeError({ id: 'e1' }));
    addError(makeError({ id: 'e2' }));
    removeError('e1');
    expect(errors.get()).toHaveLength(1);
    expect(errors.get()[0]!.id).toBe('e2');
  });

  it('dismissError marks error as dismissed', () => {
    addError(makeError({ id: 'e1', dismissed: false }));
    dismissError('e1');
    expect(errors.get()[0]!.dismissed).toBe(true);
  });

  it('dismissError leaves non-matching errors unchanged', () => {
    addError(makeError({ id: 'e1', dismissed: false }));
    addError(makeError({ id: 'e2', dismissed: false }));
    dismissError('e1');
    expect(errors.get()[1]!.dismissed).toBe(false);
  });

  it('clearAllErrors resets to empty', () => {
    addError(makeError());
    clearAllErrors();
    expect(errors.get()).toHaveLength(0);
  });

  it('clearDismissedErrors removes only dismissed', () => {
    addError(makeError({ id: 'e1', dismissed: true }));
    addError(makeError({ id: 'e2', dismissed: false }));
    clearDismissedErrors();
    expect(errors.get()).toHaveLength(1);
    expect(errors.get()[0]!.id).toBe('e2');
  });

  it('clearErrorsBySeverity removes matching severity', () => {
    addError(makeError({ id: 'e1', severity: 'error' as AppError['severity'] }));
    addError(makeError({ id: 'e2', severity: 'warning' as AppError['severity'] }));
    clearErrorsBySeverity('error' as AppError['severity']);
    expect(errors.get()).toHaveLength(1);
    expect(errors.get()[0]!.id).toBe('e2');
  });

  it('clearErrorsByCategory removes matching category', () => {
    addError(makeError({ id: 'e1', category: 'data' as AppError['category'] }));
    addError(makeError({ id: 'e2', category: 'network' as AppError['category'] }));
    clearErrorsByCategory('data' as AppError['category']);
    expect(errors.get()).toHaveLength(1);
    expect(errors.get()[0]!.id).toBe('e2');
  });

  it('setMaxVisibleToasts clamps between 1 and 10', () => {
    setMaxVisibleToasts(0);
    expect(maxVisibleToasts.get()).toBe(1);

    setMaxVisibleToasts(99);
    expect(maxVisibleToasts.get()).toBe(10);

    setMaxVisibleToasts(5);
    expect(maxVisibleToasts.get()).toBe(5);
  });
});
