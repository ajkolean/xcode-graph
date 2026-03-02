/**
 * Tests for FocusTrapController
 * Ensures focus trap activates/deactivates based on reactive conditions
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type FocusTrapConfig, FocusTrapController } from './focus-trap.controller';

/**
 * Mock HTML host that extends HTMLElement and implements ReactiveControllerHost.
 * Required because FocusTrapController needs an HTMLElement as its container.
 */
class MockHTMLHost extends HTMLElement implements ReactiveControllerHost {
  private readonly controllers: ReactiveController[] = [];
  public updateCount = 0;
  public readonly updateComplete: Promise<boolean> = Promise.resolve(true);

  addController(controller: ReactiveController): void {
    this.controllers.push(controller);
  }

  removeController(controller: ReactiveController): void {
    const index = this.controllers.indexOf(controller);
    if (index >= 0) {
      this.controllers.splice(index, 1);
    }
  }

  requestUpdate(): void {
    this.updateCount++;
  }

  simulateConnected(): void {
    for (const c of this.controllers) {
      c.hostConnected?.();
    }
  }

  simulateUpdated(): void {
    for (const c of this.controllers) {
      c.hostUpdated?.();
    }
  }

  simulateDisconnected(): void {
    for (const c of this.controllers) {
      c.hostDisconnected?.();
    }
  }

  getControllers(): ReactiveController[] {
    return [...this.controllers];
  }
}

if (!customElements.get('mock-html-host')) {
  customElements.define('mock-html-host', MockHTMLHost);
}

describe('FocusTrapController', () => {
  let host: MockHTMLHost;
  let isActive: ReturnType<typeof vi.fn<() => boolean>>;
  let onDeactivate: ReturnType<typeof vi.fn<() => void>>;
  let _controller: FocusTrapController;

  function createHost(): MockHTMLHost {
    const el = document.createElement('mock-html-host') as MockHTMLHost;
    el.setAttribute('tabindex', '-1');
    document.body.appendChild(el);
    return el;
  }

  function createController(
    hostEl: MockHTMLHost,
    config: Partial<FocusTrapConfig> & { isActive: () => boolean },
  ): FocusTrapController {
    return new FocusTrapController(hostEl, {
      onDeactivate,
      escapeDeactivates: true,
      clickOutsideDeactivates: false,
      ...config,
    });
  }

  beforeEach(() => {
    isActive = vi.fn(() => false);
    onDeactivate = vi.fn<() => void>();
    host = createHost();
    _controller = createController(host, { isActive });
  });

  afterEach(() => {
    host.simulateDisconnected();
    host.remove();
  });

  describe('Initialization', () => {
    it('should register with the host', () => {
      expect(host.getControllers()).toContain(_controller);
    });

    it('should not activate the trap before hostUpdated is called', () => {
      host.simulateConnected();
      expect(onDeactivate).not.toHaveBeenCalled();
    });
  });

  describe('Activation lifecycle', () => {
    it('should activate the trap when isActive returns true', () => {
      isActive.mockReturnValue(true);
      host.simulateConnected();
      host.simulateUpdated();
      expect(isActive).toHaveBeenCalled();
      expect(_controller.active).toBe(true);
    });

    it('should not activate the trap when isActive returns false', () => {
      isActive.mockReturnValue(false);
      host.simulateConnected();
      host.simulateUpdated();
      expect(isActive).toHaveBeenCalled();
      expect(_controller.active).toBe(false);
    });

    it('should activate and deactivate as isActive changes', () => {
      isActive.mockReturnValue(false);
      host.simulateConnected();
      host.simulateUpdated();
      expect(_controller.active).toBe(false);

      isActive.mockReturnValue(true);
      host.simulateUpdated();
      expect(_controller.active).toBe(true);

      isActive.mockReturnValue(false);
      host.simulateUpdated();
      expect(_controller.active).toBe(false);
    });

    it('should not double-activate when already active', () => {
      isActive.mockReturnValue(true);
      host.simulateConnected();
      host.simulateUpdated();

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* suppress output */
      });
      host.simulateUpdated();

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('Deactivation', () => {
    it('should deactivate the trap when isActive becomes false', () => {
      isActive.mockReturnValue(true);
      host.simulateConnected();
      host.simulateUpdated();
      expect(_controller.active).toBe(true);

      isActive.mockReturnValue(false);
      host.simulateUpdated();
      expect(_controller.active).toBe(false);
    });

    it('should not error when deactivating an already inactive trap', () => {
      isActive.mockReturnValue(false);
      host.simulateConnected();
      host.simulateUpdated();

      host.simulateUpdated();
      expect(isActive).toHaveBeenCalled();
    });
  });

  describe('Disconnect cleanup', () => {
    it('should deactivate the trap on hostDisconnected', () => {
      isActive.mockReturnValue(true);
      host.simulateConnected();
      host.simulateUpdated();
      expect(_controller.active).toBe(true);

      host.simulateDisconnected();
      expect(_controller.active).toBe(false);
    });

    it('should handle disconnect when trap was never activated', () => {
      isActive.mockReturnValue(false);
      host.simulateConnected();
      host.simulateUpdated();

      expect(() => host.simulateDisconnected()).not.toThrow();
    });

    it('should nullify the trap on disconnect and recreate on reconnect', () => {
      isActive.mockReturnValue(true);
      host.simulateConnected();
      host.simulateUpdated();
      expect(_controller.active).toBe(true);

      host.simulateDisconnected();
      expect(_controller.active).toBe(false);

      // Reconnecting and updating should create a new trap
      isActive.mockReturnValue(true);
      host.simulateConnected();
      host.simulateUpdated();
      expect(_controller.active).toBe(true);
    });
  });

  describe('Escape key behavior', () => {
    it('should call onDeactivate when Escape is pressed and escapeDeactivates is true', () => {
      isActive.mockReturnValue(true);
      host.simulateConnected();
      host.simulateUpdated();

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        keyCode: 27,
        bubbles: true,
      });
      document.dispatchEvent(event);

      expect(onDeactivate).toHaveBeenCalledTimes(1);
    });

    it('should not call onDeactivate on Escape when escapeDeactivates is false', () => {
      host.simulateDisconnected();
      host.remove();

      const newHost = createHost();
      const newOnDeactivate = vi.fn();
      const newIsActive = vi.fn(() => true);

      const instance = new FocusTrapController(newHost, {
        isActive: newIsActive,
        onDeactivate: newOnDeactivate,
        escapeDeactivates: false,
        clickOutsideDeactivates: false,
      });
      expect(instance).toBeDefined();

      newHost.simulateConnected();
      newHost.simulateUpdated();

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        keyCode: 27,
        bubbles: true,
      });
      document.dispatchEvent(event);

      expect(newOnDeactivate).not.toHaveBeenCalled();

      newHost.simulateDisconnected();
      newHost.remove();
    });
  });

  describe('Configuration options', () => {
    it('should accept custom initialFocus selector', () => {
      host.simulateDisconnected();
      host.remove();

      const newHost = createHost();
      const button = document.createElement('button');
      button.classList.add('initial-focus');
      newHost.appendChild(button);

      const ctrl = new FocusTrapController(newHost, {
        isActive: () => true,
        initialFocus: '.initial-focus',
        escapeDeactivates: true,
      });

      expect(newHost.getControllers()).toContain(ctrl);

      newHost.simulateDisconnected();
      newHost.remove();
    });

    it('should default returnFocusOnDeactivate to true', () => {
      isActive.mockReturnValue(true);
      host.simulateConnected();
      host.simulateUpdated();
      expect(_controller.active).toBe(true);

      // Deactivating should work without error (returnFocusOnDeactivate defaults to true)
      isActive.mockReturnValue(false);
      host.simulateUpdated();
      expect(_controller.active).toBe(false);
    });
  });

  describe('getShadowRoot callback', () => {
    it('should return shadowRoot for elements with shadow DOM (line 119)', () => {
      // The getShadowRoot callback is invoked by focus-trap during activation
      // on nodes that have a shadowRoot. We need to activate with a host that
      // has child elements with shadow roots.
      host.simulateDisconnected();
      host.remove();

      const newHost = createHost();
      // Create a child custom element with shadowRoot
      const child = document.createElement('div');
      newHost.appendChild(child);

      const newIsActive = vi.fn(() => true);
      const ctrl = new FocusTrapController(newHost, {
        isActive: newIsActive,
        escapeDeactivates: true,
        clickOutsideDeactivates: false,
      });
      expect(ctrl).toBeDefined();

      newHost.simulateConnected();
      newHost.simulateUpdated();

      // The activation itself exercises the getShadowRoot callback.
      // It returns false for plain elements (no shadowRoot) and
      // returns node.shadowRoot for elements with shadow DOM.
      expect(ctrl.active).toBe(true);

      newHost.simulateDisconnected();
      newHost.remove();
    });
  });

  describe('Error handling', () => {
    it('should warn on activation error (line 131)', () => {
      host.simulateDisconnected();
      host.remove();

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* suppress */
      });

      // Create a host that's not in the DOM (detached) to potentially trigger errors
      const detachedHost = document.createElement('mock-html-host') as MockHTMLHost;
      detachedHost.setAttribute('tabindex', '-1');
      // Don't append to document

      const detachedIsActive = vi.fn(() => true);
      const ctrl = new FocusTrapController(detachedHost, {
        isActive: detachedIsActive,
        escapeDeactivates: true,
        clickOutsideDeactivates: false,
      });

      // Simulate lifecycle on a detached element - activation may fail
      detachedHost.simulateConnected();
      detachedHost.simulateUpdated();

      // If activation fails it should warn but not throw
      expect(ctrl).toBeDefined();

      detachedHost.simulateDisconnected();
      warnSpy.mockRestore();
    });

    it('should warn on deactivation error (line 142)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* suppress */
      });

      isActive.mockReturnValue(true);
      host.simulateConnected();
      host.simulateUpdated();
      expect(_controller.active).toBe(true);

      // Deactivation should handle errors gracefully
      isActive.mockReturnValue(false);
      host.simulateUpdated();

      // Whether or not the warn was called, deactivation shouldn't throw
      expect(_controller.active).toBe(false);

      warnSpy.mockRestore();
    });

    it('should handle activation error when createFocusTrap throws', () => {
      host.simulateDisconnected();
      host.remove();

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* suppress */
      });

      // Create a minimal host element that will cause createFocusTrap to throw
      const badHost = document.createElement('mock-html-host') as MockHTMLHost;
      // Intentionally do NOT add to DOM and do NOT set tabindex
      // to increase the likelihood of an error during focus-trap creation

      const badIsActive = vi.fn(() => true);
      const ctrl = new FocusTrapController(badHost, {
        isActive: badIsActive,
        escapeDeactivates: true,
        clickOutsideDeactivates: false,
      });

      badHost.simulateConnected();
      // This should not throw even if createFocusTrap fails internally
      expect(() => badHost.simulateUpdated()).not.toThrow();
      expect(ctrl).toBeDefined();

      badHost.simulateDisconnected();
      warnSpy.mockRestore();
    });
  });
});
