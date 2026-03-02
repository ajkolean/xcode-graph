/**
 * Tests for KeyboardShortcutController
 * Ensures global keyboard shortcut listener works correctly
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockHost } from '@/test-utils';
import { KeyboardShortcutController } from './keyboard-shortcut.controller';

describe('KeyboardShortcutController', () => {
  let host: MockHost;
  let onTrigger: ReturnType<typeof vi.fn<() => void>>;
  let controller: KeyboardShortcutController;

  beforeEach(() => {
    host = new MockHost();
    onTrigger = vi.fn<() => void>();
    controller = new KeyboardShortcutController(host, {
      key: '/',
      onTrigger,
    });
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
      const instance = new KeyboardShortcutController(new MockHost(), {
        key: 'k',
        onTrigger: vi.fn(),
      });
      expect(instance).toBeDefined();
      expect(spy).not.toHaveBeenCalledWith('keydown', expect.any(Function));
      spy.mockRestore();
    });
  });

  describe('Lifecycle', () => {
    it('should add keydown listener on hostConnected', () => {
      const spy = vi.spyOn(window, 'addEventListener');
      host.connectedCallback();
      expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
      spy.mockRestore();
    });

    it('should remove keydown listener on hostDisconnected', () => {
      const spy = vi.spyOn(window, 'removeEventListener');
      host.connectedCallback();
      host.disconnectedCallback();
      expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
      spy.mockRestore();
    });

    it('should handle cleanup errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        /* suppress output */
      });
      const removeSpy = vi.spyOn(window, 'removeEventListener').mockImplementation(() => {
        throw new Error('cleanup failed');
      });

      host.connectedCallback();
      expect(() => host.disconnectedCallback()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[KeyboardShortcutController] Error during cleanup:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });

  describe('Key matching', () => {
    it('should trigger callback on matching key', () => {
      host.connectedCallback();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
      expect(onTrigger).toHaveBeenCalledTimes(1);
    });

    it('should not trigger callback on non-matching key', () => {
      host.connectedCallback();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(onTrigger).not.toHaveBeenCalled();
    });

    it('should not trigger after disconnect', () => {
      host.connectedCallback();
      host.disconnectedCallback();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
      expect(onTrigger).not.toHaveBeenCalled();
    });
  });

  describe('preventDefault', () => {
    it('should preventDefault by default', () => {
      host.connectedCallback();
      const event = new KeyboardEvent('keydown', { key: '/', cancelable: true });
      const spy = vi.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);
      expect(spy).toHaveBeenCalled();
    });

    it('should not preventDefault when configured to false', () => {
      const testHost = new MockHost();
      const instance = new KeyboardShortcutController(testHost, {
        key: '/',
        onTrigger: vi.fn(),
        preventDefault: false,
      });
      expect(instance).toBeDefined();
      testHost.connectedCallback();

      const event = new KeyboardEvent('keydown', { key: '/', cancelable: true });
      const spy = vi.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);
      expect(spy).not.toHaveBeenCalled();

      testHost.disconnectedCallback();
    });
  });

  describe('Input focus detection', () => {
    it('should skip when an input element is focused', () => {
      host.connectedCallback();

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
      expect(onTrigger).not.toHaveBeenCalled();

      input.remove();
    });

    it('should skip when a textarea element is focused', () => {
      host.connectedCallback();

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
      expect(onTrigger).not.toHaveBeenCalled();

      textarea.remove();
    });

    it('should skip when a contentEditable element is focused', () => {
      host.connectedCallback();

      const div = document.createElement('div');
      div.contentEditable = 'true';
      div.tabIndex = 0;
      document.body.appendChild(div);
      div.focus();

      // jsdom requires tabIndex for non-input elements to receive focus
      expect(document.activeElement).toBe(div);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
      expect(onTrigger).not.toHaveBeenCalled();

      div.remove();
    });

    it('should not skip input detection when ignoreWhenInputFocused is false', () => {
      const testHost = new MockHost();
      const trigger = vi.fn();
      const instance = new KeyboardShortcutController(testHost, {
        key: '/',
        onTrigger: trigger,
        ignoreWhenInputFocused: false,
      });
      expect(instance).toBeDefined();
      testHost.connectedCallback();

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
      expect(trigger).toHaveBeenCalledTimes(1);

      input.remove();
      testHost.disconnectedCallback();
    });

    it('should trigger when no input is focused', () => {
      host.connectedCallback();

      // Focus on body (no input)
      document.body.focus();

      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
      expect(onTrigger).toHaveBeenCalledTimes(1);
    });
  });
});
