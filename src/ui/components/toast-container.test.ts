/**
 * ErrorNotificationContainer Lit Component Tests
 */

import { fixture, html } from '@open-wc/testing';
import { ErrorCategory, ErrorSeverity } from '@shared/schemas/error.types';
import { addError } from '@shared/signals/error.actions';
import { resetErrorSignals } from '@shared/signals/error.signals';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { errorService } from '@/services/error-service';
import type { GraphErrorNotificationContainer } from './toast-container';
import './toast-container';

describe('xcode-graph-error-notification-container', () => {
  beforeEach(() => {
    resetErrorSignals();
  });

  it('should render nothing when no errors', async () => {
    const el = await fixture<GraphErrorNotificationContainer>(html`
      <xcode-graph-error-notification-container></xcode-graph-error-notification-container>
    `);

    expect(el).toBeDefined();
    const toasts = el.shadowRoot?.querySelectorAll('xcode-graph-error-toast');
    expect(toasts?.length ?? 0).toBe(0);
  });

  it('should render toast when error is added', async () => {
    addError({
      id: 'err1',
      message: 'Test error',
      severity: ErrorSeverity.Error,
      category: ErrorCategory.Data,
      timestamp: Date.now(),
      dismissed: false,
      dismissible: true,
    });

    const el = await fixture<GraphErrorNotificationContainer>(html`
      <xcode-graph-error-notification-container></xcode-graph-error-notification-container>
    `);

    const toasts = el.shadowRoot?.querySelectorAll('xcode-graph-error-toast');
    expect(toasts?.length).toBe(1);
  });

  it('should handle dismiss event from toast', async () => {
    const dismissSpy = vi.spyOn(errorService, 'dismiss');
    addError({
      id: 'err2',
      message: 'Dismissible error',
      severity: ErrorSeverity.Warning,
      category: ErrorCategory.Data,
      timestamp: Date.now(),
      dismissed: false,
      dismissible: true,
    });

    const el = await fixture<GraphErrorNotificationContainer>(html`
      <xcode-graph-error-notification-container></xcode-graph-error-notification-container>
    `);

    const toast = el.shadowRoot?.querySelector('xcode-graph-error-toast');
    toast?.dispatchEvent(
      new CustomEvent('dismiss', { detail: { errorId: 'err2' }, bubbles: true }),
    );

    expect(dismissSpy).toHaveBeenCalledWith('err2');
    dismissSpy.mockRestore();
  });

  it('should handle action event from toast', async () => {
    const actionSpy = vi.spyOn(errorService, 'executeAction');
    const testError = {
      id: 'err3',
      message: 'Actionable error',
      severity: ErrorSeverity.Error,
      category: ErrorCategory.Data,
      timestamp: Date.now(),
      dismissed: false,
      dismissible: true,
    };
    addError(testError);

    const el = await fixture<GraphErrorNotificationContainer>(html`
      <xcode-graph-error-notification-container></xcode-graph-error-notification-container>
    `);

    const toast = el.shadowRoot?.querySelector('xcode-graph-error-toast');
    toast?.dispatchEvent(
      new CustomEvent('action', { detail: { error: testError }, bubbles: true }),
    );

    expect(actionSpy).toHaveBeenCalledWith(testError);
    actionSpy.mockRestore();
  });
});
