/**
 * ErrorToast Accessibility Tests
 *
 * Uses vitest-axe to verify the error toast meets accessibility standards.
 */

import { expect as chaiExpect, fixture, html } from '@open-wc/testing';
import type { AppError } from '@shared/schemas/error.types';
import { ErrorCategory, ErrorSeverity } from '@shared/schemas/error.types';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { GraphErrorToast } from './error-toast';
import './error-toast';

const sampleError: AppError = {
  id: 'err-1',
  severity: ErrorSeverity.Error,
  category: ErrorCategory.Data,
  message: 'Failed to load graph data',
  timestamp: Date.now(),
  dismissed: false,
  dismissible: true,
};

describe('xcode-graph-error-toast a11y', () => {
  it('should have no accessibility violations with error', async () => {
    const el = await fixture<GraphErrorToast>(html`
      <xcode-graph-error-toast .error=${sampleError}></xcode-graph-error-toast>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have role="alert" on toast element', async () => {
    const el = await fixture<GraphErrorToast>(html`
      <xcode-graph-error-toast .error=${sampleError}></xcode-graph-error-toast>
    `);

    const toast = el.shadowRoot?.querySelector('.toast');
    chaiExpect(toast).toBeDefined();
    chaiExpect(toast?.getAttribute('role')).to.equal('alert');
  });

  it('should have aria-live="assertive"', async () => {
    const el = await fixture<GraphErrorToast>(html`
      <xcode-graph-error-toast .error=${sampleError}></xcode-graph-error-toast>
    `);

    const toast = el.shadowRoot?.querySelector('.toast');
    chaiExpect(toast).toBeDefined();
    chaiExpect(toast?.getAttribute('aria-live')).to.equal('assertive');
  });

  it('should have aria-label on dismiss button', async () => {
    const el = await fixture<GraphErrorToast>(html`
      <xcode-graph-error-toast .error=${sampleError}></xcode-graph-error-toast>
    `);

    const closeIcon = el.shadowRoot?.querySelector('.close-icon');
    chaiExpect(closeIcon).toBeDefined();
    chaiExpect(closeIcon?.getAttribute('aria-label')).to.equal('Dismiss notification');
  });

  it('should have no violations with info severity', async () => {
    const infoError: AppError = {
      ...sampleError,
      severity: ErrorSeverity.Info,
      message: 'Graph loaded successfully',
      dismissible: false,
    };

    const el = await fixture<GraphErrorToast>(html`
      <xcode-graph-error-toast .error=${infoError}></xcode-graph-error-toast>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });
});
