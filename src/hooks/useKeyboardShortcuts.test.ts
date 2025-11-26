import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  const createMockHandlers = () => ({
    onCloseNode: vi.fn(),
    onResetView: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Escape key', () => {
    it('should call onCloseNode when Escape is pressed', () => {
      const handlers = createMockHandlers();
      renderHook(() => useKeyboardShortcuts(handlers));

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);

      expect(handlers.onCloseNode).toHaveBeenCalledTimes(1);
    });
  });

  describe('R key', () => {
    it('should call onResetView when R is pressed', () => {
      const handlers = createMockHandlers();
      renderHook(() => useKeyboardShortcuts(handlers));

      const event = new KeyboardEvent('keydown', { key: 'r' });
      window.dispatchEvent(event);

      expect(handlers.onResetView).toHaveBeenCalledTimes(1);
    });

    it('should not call onResetView when Cmd+R is pressed', () => {
      const handlers = createMockHandlers();
      renderHook(() => useKeyboardShortcuts(handlers));

      const event = new KeyboardEvent('keydown', { key: 'r', metaKey: true });
      window.dispatchEvent(event);

      expect(handlers.onResetView).not.toHaveBeenCalled();
    });

    it('should not call onResetView when Ctrl+R is pressed', () => {
      const handlers = createMockHandlers();
      renderHook(() => useKeyboardShortcuts(handlers));

      const event = new KeyboardEvent('keydown', { key: 'r', ctrlKey: true });
      window.dispatchEvent(event);

      expect(handlers.onResetView).not.toHaveBeenCalled();
    });
  });

  describe('Cmd/Ctrl + F', () => {
    it('should prevent default for Cmd+F', () => {
      const handlers = createMockHandlers();
      renderHook(() => useKeyboardShortcuts(handlers));

      const event = new KeyboardEvent('keydown', { key: 'f', metaKey: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent default for Ctrl+F', () => {
      const handlers = createMockHandlers();
      renderHook(() => useKeyboardShortcuts(handlers));

      const event = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const handlers = createMockHandlers();
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useKeyboardShortcuts(handlers));
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('unrelated keys', () => {
    it('should not trigger any handler for unrelated keys', () => {
      const handlers = createMockHandlers();
      renderHook(() => useKeyboardShortcuts(handlers));

      const event = new KeyboardEvent('keydown', { key: 'a' });
      window.dispatchEvent(event);

      expect(handlers.onCloseNode).not.toHaveBeenCalled();
      expect(handlers.onResetView).not.toHaveBeenCalled();
    });
  });
});
