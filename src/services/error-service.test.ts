/**
 * Error Service Tests
 *
 * Comprehensive test suite for ErrorService singleton.
 * Tests error handling, notifications, actions, and recovery.
 */

import { ErrorCategory, ErrorSeverity } from '@shared/schemas/error.types';
import { errors, resetErrorSignals } from '@shared/signals/error.signals';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorService } from './error-service';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    // Reset singleton and signals
    ErrorService.resetInstance();
    resetErrorSignals();
    service = ErrorService.getInstance();
    vi.useFakeTimers();
  });

  afterEach(() => {
    ErrorService.resetInstance();
    resetErrorSignals();
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ErrorService.getInstance();
      const instance2 = ErrorService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should reset instance', () => {
      const instance1 = ErrorService.getInstance();
      ErrorService.resetInstance();
      const instance2 = ErrorService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('handleError', () => {
    it('should handle Error object', () => {
      const error = new Error('Test error');
      const appError = service.handleError(error);

      expect(appError.message).toBe('Test error');
      expect(appError.severity).toBe(ErrorSeverity.Error);
      expect(appError.category).toBe(ErrorCategory.Unknown);
      expect(appError.dismissed).toBe(false);
    });

    it('should handle string error', () => {
      const appError = service.handleError('String error');

      expect(appError.message).toBe('String error');
    });

    it('should use custom user message', () => {
      const error = new Error('Technical error');
      const appError = service.handleError(error, {
        userMessage: 'User-friendly message',
      });

      expect(appError.message).toBe('User-friendly message');
    });

    it('should set custom severity and category', () => {
      const error = new Error('Test');
      const appError = service.handleError(error, {
        severity: ErrorSeverity.Warning,
        category: ErrorCategory.Layout,
      });

      expect(appError.severity).toBe(ErrorSeverity.Warning);
      expect(appError.category).toBe(ErrorCategory.Layout);
    });

    it('should add error to signal state', () => {
      const error = new Error('Test');
      service.handleError(error);

      const currentErrors = errors.get();
      expect(currentErrors).toHaveLength(1);
      const firstError = currentErrors[0];
      if (!firstError) {
        expect.fail('expected error in list');
      }
      expect(firstError.message).toBe('Test');
    });

    it('should include action label and type', () => {
      const error = new Error('Test');
      const appError = service.handleError(error, {
        actionLabel: 'Retry',
        actionType: 'retry-action',
      });

      expect(appError.actionLabel).toBe('Retry');
      expect(appError.actionType).toBe('retry-action');
    });

    it('should set dismissible flag', () => {
      const error = new Error('Test');
      const appError1 = service.handleError(error, { dismissible: true });
      const appError2 = service.handleError(error, { dismissible: false });

      expect(appError1.dismissible).toBe(true);
      expect(appError2.dismissible).toBe(false);
    });

    it('should generate unique error IDs', () => {
      const error1 = service.handleError(new Error('Test 1'));
      const error2 = service.handleError(new Error('Test 2'));

      expect(error1.id).not.toBe(error2.id);
    });

    it('should include stack trace in details', () => {
      const error = new Error('Test error');
      const appError = service.handleError(error);

      expect(appError.details).toContain('Error: Test error');
    });
  });

  describe('handleCriticalError', () => {
    it('should create critical non-dismissible error', () => {
      const error = new Error('Critical failure');
      const appError = service.handleCriticalError(error, 'System failure');

      expect(appError.severity).toBe(ErrorSeverity.Critical);
      expect(appError.dismissible).toBe(false);
      expect(appError.message).toBe('System failure');
    });
  });

  describe('handleWarning', () => {
    it('should create warning with message', () => {
      const appError = service.handleWarning('This is a warning');

      expect(appError.severity).toBe(ErrorSeverity.Warning);
      expect(appError.message).toBe('This is a warning');
    });

    it('should use custom category', () => {
      const appError = service.handleWarning('Warning', ErrorCategory.Network);

      expect(appError.category).toBe(ErrorCategory.Network);
    });
  });

  describe('handleInfo', () => {
    it('should create info notification', () => {
      const appError = service.handleInfo('Information message');

      expect(appError.severity).toBe(ErrorSeverity.Info);
      expect(appError.message).toBe('Information message');
    });
  });

  describe('Auto-dismiss', () => {
    it('should auto-dismiss info errors after 3 seconds', () => {
      service.handleInfo('Test info');

      expect(errors.get()).toHaveLength(1);

      vi.advanceTimersByTime(3000);

      // Should be dismissed
      const currentErrors = errors.get();
      const infoError = currentErrors[0];
      if (!infoError) {
        expect.fail('expected error');
      }
      expect(infoError.dismissed).toBe(true);
    });

    it('should auto-dismiss warnings after 5 seconds', () => {
      service.handleWarning('Test warning');

      expect(errors.get()).toHaveLength(1);

      vi.advanceTimersByTime(5000);

      const currentErrors = errors.get();
      const warnError = currentErrors[0];
      if (!warnError) {
        expect.fail('expected error');
      }
      expect(warnError.dismissed).toBe(true);
    });

    it('should auto-dismiss errors after 7 seconds', () => {
      const error = new Error('Test error');
      service.handleError(error);

      expect(errors.get()).toHaveLength(1);

      vi.advanceTimersByTime(7000);

      const currentErrors = errors.get();
      const errError = currentErrors[0];
      if (!errError) {
        expect.fail('expected error');
      }
      expect(errError.dismissed).toBe(true);
    });

    it('should NOT auto-dismiss critical errors', () => {
      service.handleCriticalError(new Error('Critical'));

      expect(errors.get()).toHaveLength(1);

      vi.advanceTimersByTime(10000);

      const currentErrors = errors.get();
      const critError = currentErrors[0];
      if (!critError) {
        expect.fail('expected error');
      }
      expect(critError.dismissed).toBe(false);
    });

    it('should use custom auto-dismiss duration', () => {
      const error = new Error('Test');
      service.handleError(error, {
        autoDismissMs: 2000,
      });

      expect(errors.get()).toHaveLength(1);

      vi.advanceTimersByTime(2000);

      const currentErrors = errors.get();
      const customError = currentErrors[0];
      if (!customError) {
        expect.fail('expected error');
      }
      expect(customError.dismissed).toBe(true);
    });
  });

  describe('dismiss', () => {
    it('should dismiss error', () => {
      const appError = service.handleError(new Error('Test'));

      service.dismiss(appError.id);

      const currentErrors = errors.get();
      const dismissedError = currentErrors[0];
      if (!dismissedError) {
        expect.fail('expected error');
      }
      expect(dismissedError.dismissed).toBe(true);
    });

    it('should remove error after dismissal animation', () => {
      const appError = service.handleError(new Error('Test'));

      service.dismiss(appError.id);

      expect(errors.get()).toHaveLength(1);

      vi.advanceTimersByTime(1000);

      expect(errors.get()).toHaveLength(0);
    });

    it('should clear auto-dismiss timer when manually dismissed', () => {
      const appError = service.handleInfo('Test');

      service.dismiss(appError.id);

      // Manually dismissed, should not auto-dismiss
      vi.advanceTimersByTime(3000);

      const currentErrors = errors.get();
      expect(currentErrors).toHaveLength(0);
    });
  });

  describe('Action Handlers', () => {
    it('should register action handler', () => {
      const handler = vi.fn();
      service.registerActionHandler('test-action', handler);

      // Create error with action
      const appError = service.handleError(new Error('Test'), {
        actionType: 'test-action',
      });

      service.executeAction(appError);

      expect(handler).toHaveBeenCalledWith(appError);
    });

    it('should unregister action handler', () => {
      const handler = vi.fn();
      service.registerActionHandler('test-action', handler);
      service.unregisterActionHandler('test-action');

      const appError = service.handleError(new Error('Test'), {
        actionType: 'test-action',
      });

      service.executeAction(appError);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle missing action handler gracefully', async () => {
      const appError = service.handleError(new Error('Test'), {
        actionType: 'nonexistent-action',
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* suppress output */
      });

      await service.executeAction(appError);

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('No handler registered'));

      consoleWarnSpy.mockRestore();
    });

    it('should handle action handler errors', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('Handler failed'));
      service.registerActionHandler('test-action', handler);

      const appError = service.handleError(new Error('Test'), {
        actionType: 'test-action',
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        /* suppress output */
      });

      await service.executeAction(appError);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(errors.get().length).toBeGreaterThan(1); // Original + handler error

      consoleErrorSpy.mockRestore();
    });

    it('should handle async action handlers', async () => {
      const handler = vi.fn<() => Promise<void>>().mockImplementation(() => Promise.resolve());
      service.registerActionHandler('async-action', handler);

      const appError = service.handleError(new Error('Test'), {
        actionType: 'async-action',
      });

      await service.executeAction(appError);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Console Logging', () => {
    it('should log errors to console by default', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        /* suppress output */
      });

      service.handleError(new Error('Test'));

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should not log when disabled', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        /* suppress output */
      });

      service.handleError(new Error('Test'), { logToConsole: false });

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should use appropriate console methods by severity', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        /* suppress output */
      });
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* suppress output */
      });
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {
        /* suppress output */
      });

      service.handleError(new Error('Error'), { severity: ErrorSeverity.Error });
      service.handleError(new Error('Warning'), { severity: ErrorSeverity.Warning });
      service.handleError(new Error('Info'), { severity: ErrorSeverity.Info });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  describe('Error Extraction', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Error message');
      const appError = service.handleError(error);

      expect(appError.message).toBe('Error message');
    });

    it('should extract message from object with message property', () => {
      const error = { message: 'Object message' };
      const appError = service.handleError(error);

      expect(appError.message).toBe('Object message');
    });

    it('should handle unknown error types', () => {
      const appError = service.handleError({ random: 'object' });

      // Uses default message when userMessage is not provided
      expect(appError.message).toBe('Unknown error');
    });

    it('should include JSON details for object errors', () => {
      const error = { code: 404, status: 'Not Found' };
      const appError = service.handleError(error);

      expect(appError.details).toContain('404');
      expect(appError.details).toContain('Not Found');
    });
  });
});
