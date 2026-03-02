/**
 * Error Toast Component Tests
 *
 * Test suite for GraphErrorToast component.
 * Tests rendering, interactions, and animations.
 */

import { aTimeout, fixture, html, nextFrame, oneEvent } from '@open-wc/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphErrorToast } from './error-toast';
import './error-toast';
import type { AppError } from '@shared/schemas/error.types';
import { ErrorCategory, ErrorSeverity } from '@shared/schemas/error.types';

describe('GraphErrorToast', () => {
  let element: GraphErrorToast;

  const createMockError = (overrides: Partial<AppError> = {}): AppError => ({
    id: 'test-error-1',
    severity: ErrorSeverity.Error,
    category: ErrorCategory.Unknown,
    message: 'Test error message',
    timestamp: Date.now(),
    dismissed: false,
    dismissible: true,
    ...overrides,
  });

  beforeEach(async () => {
    element = await fixture<GraphErrorToast>(
      html`<xcode-graph-error-toast></xcode-graph-error-toast>`,
    );
  });

  describe('Rendering', () => {
    it('should render nothing when no error is set', () => {
      const toast = element.shadowRoot?.querySelector('.toast');
      expect(toast).toBeNull();
    });

    it('should render error message', async () => {
      const error = createMockError({ message: 'Custom error message' });
      element.error = error;
      await element.updateComplete;

      const message = element.shadowRoot?.querySelector('.message');
      expect(message?.textContent).toBe('Custom error message');
    });

    it('should render error details when provided', async () => {
      const error = createMockError({ details: 'Stack trace here' });
      element.error = error;
      await element.updateComplete;

      const details = element.shadowRoot?.querySelector('.details');
      expect(details).toBeDefined();
      expect(details?.textContent).toBe('Stack trace here');
    });

    it('should not render details when not provided', async () => {
      const error = createMockError({});
      element.error = error;
      await element.updateComplete;

      const details = element.shadowRoot?.querySelector('.details');
      expect(details).toBeNull();
    });

    it('should render severity icon', async () => {
      const error = createMockError({ severity: ErrorSeverity.Warning });
      element.error = error;
      await element.updateComplete;

      const icon = element.shadowRoot?.querySelector('.icon');
      expect(icon?.textContent).toBe('⚠️');
    });

    it('should render different icons for each severity', async () => {
      const severities = [
        { severity: ErrorSeverity.Info, icon: 'ℹ️' },
        { severity: ErrorSeverity.Warning, icon: '⚠️' },
        { severity: ErrorSeverity.Error, icon: '❌' },
        { severity: ErrorSeverity.Critical, icon: '🚨' },
      ];

      for (const { severity, icon } of severities) {
        const error = createMockError({ severity });
        element.error = error;
        await element.updateComplete;

        const iconElement = element.shadowRoot?.querySelector('.icon');
        expect(iconElement?.textContent).toBe(icon);
      }
    });
  });

  describe('Dismissible Behavior', () => {
    it('should render close button when dismissible', async () => {
      const error = createMockError({ dismissible: true });
      element.error = error;
      await element.updateComplete;

      const closeIcon = element.shadowRoot?.querySelector('.close-icon');
      expect(closeIcon).toBeDefined();
    });

    it('should not render close button when not dismissible', async () => {
      const error = createMockError({ dismissible: false });
      element.error = error;
      await element.updateComplete;

      const closeIcon = element.shadowRoot?.querySelector('.close-icon');
      expect(closeIcon).toBeNull();
    });

    it('should dispatch dismiss event on close click', async () => {
      const error = createMockError({ id: 'test-123' });
      element.error = error;
      await element.updateComplete;

      const closeIcon = element.shadowRoot?.querySelector('.close-icon') as HTMLElement;
      setTimeout(() => closeIcon?.click());
      const event = (await oneEvent(element, 'dismiss')) as CustomEvent;

      expect(event).toBeDefined();
      expect(event.detail.errorId).toBe('test-123');
    });

    it('should not dismiss non-dismissible errors', async () => {
      const error = createMockError({ dismissible: false });
      element.error = error;
      await element.updateComplete;

      const dismissSpy = vi.fn();
      element.addEventListener('dismiss', dismissSpy);

      // Try to call handleDismiss directly (no close button exists)
      (element as unknown as { handleDismiss: () => void }).handleDismiss();

      await aTimeout(350);

      expect(dismissSpy).not.toHaveBeenCalled();
    });

    it('should handle keyboard dismiss (Enter)', async () => {
      const error = createMockError();
      element.error = error;
      await element.updateComplete;

      const closeIcon = element.shadowRoot?.querySelector('.close-icon') as HTMLElement;
      setTimeout(() => closeIcon?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })));
      const event = await oneEvent(element, 'dismiss');

      expect(event).toBeDefined();
    });

    it('should handle keyboard dismiss (Space)', async () => {
      const error = createMockError();
      element.error = error;
      await element.updateComplete;

      const closeIcon = element.shadowRoot?.querySelector('.close-icon') as HTMLElement;
      setTimeout(() => closeIcon?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })));
      const event = await oneEvent(element, 'dismiss');

      expect(event).toBeDefined();
    });
  });

  describe('Action Button', () => {
    it('should render action button when action is provided', async () => {
      const error = createMockError({
        actionLabel: 'Retry',
        actionType: 'retry-action',
      });
      element.error = error;
      await element.updateComplete;

      const actionButton = element.shadowRoot?.querySelector('.action-button');
      expect(actionButton).toBeDefined();
      expect(actionButton?.textContent?.trim()).toBe('Retry');
    });

    it('should not render action button when no action provided', async () => {
      const error = createMockError({});
      element.error = error;
      await element.updateComplete;

      const actionButton = element.shadowRoot?.querySelector('.action-button');
      expect(actionButton).toBeNull();
    });

    it('should dispatch action event on button click', async () => {
      const error = createMockError({
        actionLabel: 'Retry',
        actionType: 'retry-action',
      });
      element.error = error;
      await element.updateComplete;

      const actionButton = element.shadowRoot?.querySelector('.action-button') as HTMLElement;
      setTimeout(() => actionButton?.click());
      const event = (await oneEvent(element, 'action')) as CustomEvent;

      expect(event).toBeDefined();
      expect(event.detail.error).toEqual(error);
    });
  });

  describe('Severity Styling', () => {
    it('should set data-severity attribute for info', async () => {
      const error = createMockError({ severity: ErrorSeverity.Info });
      element.error = error;
      await element.updateComplete;

      expect(element.getAttribute('data-severity')).toBe('info');
    });

    it('should set data-severity attribute for warning', async () => {
      const error = createMockError({ severity: ErrorSeverity.Warning });
      element.error = error;
      await element.updateComplete;

      expect(element.getAttribute('data-severity')).toBe('warning');
    });

    it('should set data-severity attribute for error', async () => {
      const error = createMockError({ severity: ErrorSeverity.Error });
      element.error = error;
      await element.updateComplete;

      expect(element.getAttribute('data-severity')).toBe('error');
    });

    it('should set data-severity attribute for critical', async () => {
      const error = createMockError({ severity: ErrorSeverity.Critical });
      element.error = error;
      await element.updateComplete;

      expect(element.getAttribute('data-severity')).toBe('critical');
    });
  });

  describe('Animations', () => {
    it('should start invisible', () => {
      expect(element.visible).toBe(false);
    });

    it('should become visible after error is set', async () => {
      const error = createMockError();
      element.error = error;
      await element.updateComplete;

      // Wait for animation frame
      await nextFrame();
      await element.updateComplete;

      expect(element.visible).toBe(true);
    });

    it('should hide before dismissing', async () => {
      const error = createMockError();
      element.error = error;
      await element.updateComplete;
      await nextFrame();

      expect(element.visible).toBe(true);

      const closeIcon = element.shadowRoot?.querySelector('.close-icon') as HTMLElement;
      closeIcon?.click();

      await element.updateComplete;

      expect(element.visible).toBe(false);
    });
  });
});
