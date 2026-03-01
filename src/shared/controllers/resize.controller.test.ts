/**
 * Tests for ResizeController
 * Ensures window resize listener is properly managed across lifecycle
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockHost } from '@/test-utils';
import { ResizeController } from './resize.controller';

describe('ResizeController', () => {
  let host: MockHost;
  let onResize: ReturnType<typeof vi.fn>;
  let controller: ResizeController;

  beforeEach(() => {
    host = new MockHost();
    onResize = vi.fn();
    controller = new ResizeController(host, onResize);
  });

  afterEach(() => {
    host.disconnectedCallback();
  });

  describe('Initialization', () => {
    it('should register with host', () => {
      expect(host.getControllers()).toContain(controller);
    });

    it('should not add listener before connect', () => {
      const spy = vi.spyOn(window, 'addEventListener');
      new ResizeController(new MockHost(), vi.fn());
      expect(spy).not.toHaveBeenCalledWith('resize', expect.any(Function));
      spy.mockRestore();
    });
  });

  describe('Lifecycle', () => {
    it('should add resize listener on hostConnected', () => {
      const spy = vi.spyOn(window, 'addEventListener');
      host.connectedCallback();
      expect(spy).toHaveBeenCalledWith('resize', onResize);
      spy.mockRestore();
    });

    it('should remove resize listener on hostDisconnected', () => {
      const spy = vi.spyOn(window, 'removeEventListener');
      host.connectedCallback();
      host.disconnectedCallback();
      expect(spy).toHaveBeenCalledWith('resize', onResize);
      spy.mockRestore();
    });

    it('should handle cleanup errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const removeSpy = vi.spyOn(window, 'removeEventListener').mockImplementation(() => {
        throw new Error('cleanup failed');
      });

      host.connectedCallback();
      expect(() => host.disconnectedCallback()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ResizeController] Error during cleanup:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  describe('Callback', () => {
    it('should call onResize when window is resized', () => {
      host.connectedCallback();
      window.dispatchEvent(new Event('resize'));
      expect(onResize).toHaveBeenCalledTimes(1);
    });

    it('should not call onResize after disconnect', () => {
      host.connectedCallback();
      host.disconnectedCallback();
      window.dispatchEvent(new Event('resize'));
      expect(onResize).not.toHaveBeenCalled();
    });

    it('should call onResize on each resize event', () => {
      host.connectedCallback();
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
      expect(onResize).toHaveBeenCalledTimes(3);
    });
  });
});
