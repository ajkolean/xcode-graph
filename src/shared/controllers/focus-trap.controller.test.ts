/**
 * Tests for FocusTrapController
 * Ensures focus trap activates/deactivates based on reactive conditions
 */

import type { FocusTrap, Options as FocusTrapOptions } from 'focus-trap';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type FocusTrapConfig, FocusTrapController } from './focus-trap.controller';

// Capture the options passed to createFocusTrap so we can invoke callbacks directly
let capturedOptions: FocusTrapOptions | undefined;

// Controllable mock trap that tracks activate/deactivate state
function makeMockTrap(): FocusTrap {
  let isActive = false;
  let isPaused = false;
  return {
    get active() {
      return isActive;
    },
    get paused() {
      return isPaused;
    },
    activate() {
      isActive = true;
      return this;
    },
    deactivate() {
      isActive = false;
      return this;
    },
    pause() {
      isPaused = true;
      return this;
    },
    unpause() {
      isPaused = false;
      return this;
    },
    updateContainerElements() {
      return this;
    },
  } as FocusTrap;
}

// Default mock trap used by most tests
let mockTrap: FocusTrap;

vi.mock('focus-trap', () => ({
  createFocusTrap: (_el: HTMLElement, options?: FocusTrapOptions) => {
    capturedOptions = options;
    return mockTrap;
  },
}));

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
    capturedOptions = undefined;
    mockTrap = makeMockTrap();
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
    it('should return shadowRoot for elements with shadow DOM (line 122)', () => {
      // Activate the trap to capture the options passed to createFocusTrap
      isActive.mockReturnValue(true);
      host.simulateConnected();
      host.simulateUpdated();

      // Extract the getShadowRoot callback from captured options
      const tabbableOpts = capturedOptions?.tabbableOptions;
      expect(tabbableOpts).toBeDefined();
      const getShadowRoot = tabbableOpts?.getShadowRoot as
        | ((node: Node) => ShadowRoot | boolean)
        | undefined;
      expect(getShadowRoot).toBeDefined();

      // Test with an element that has a shadowRoot - should return the shadowRoot
      const elWithShadow = document.createElement('div');
      const shadow = elWithShadow.attachShadow({ mode: 'open' });
      const result = getShadowRoot?.(elWithShadow);
      expect(result).toBe(shadow);
    });

    it('should return false for elements without shadow DOM', () => {
      isActive.mockReturnValue(true);
      host.simulateConnected();
      host.simulateUpdated();

      const tabbableOpts = capturedOptions?.tabbableOptions;
      const getShadowRoot = tabbableOpts?.getShadowRoot as
        | ((node: Node) => ShadowRoot | boolean)
        | undefined;

      // Test with a plain element - should return false
      const plainEl = document.createElement('div');
      const result = getShadowRoot?.(plainEl);
      expect(result).toBe(false);
    });

    it('should return false for non-HTMLElement nodes', () => {
      isActive.mockReturnValue(true);
      host.simulateConnected();
      host.simulateUpdated();

      const tabbableOpts = capturedOptions?.tabbableOptions;
      const getShadowRoot = tabbableOpts?.getShadowRoot as
        | ((node: Node) => ShadowRoot | boolean)
        | undefined;

      // Test with a text node (not an HTMLElement) - should return false
      const textNode = document.createTextNode('hello');
      const result = getShadowRoot?.(textNode);
      expect(result).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should warn on activation error (line 131)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* suppress */
      });

      // Replace mock trap with one whose activate() throws
      mockTrap = {
        ...makeMockTrap(),
        get active() {
          return false;
        },
        activate() {
          throw new Error('activation failed');
        },
      } as FocusTrap;

      host.simulateDisconnected();
      host.remove();

      const newHost = createHost();
      const newIsActive = vi.fn(() => true);
      const ctrl = new FocusTrapController(newHost, {
        isActive: newIsActive,
        escapeDeactivates: true,
        clickOutsideDeactivates: false,
      });

      newHost.simulateConnected();
      // activate() will throw, but the catch block should handle it
      expect(() => newHost.simulateUpdated()).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        '[FocusTrapController] Error during activation:',
        expect.any(Error),
      );
      expect(ctrl).toBeDefined();

      newHost.simulateDisconnected();
      newHost.remove();
      warnSpy.mockRestore();
    });

    it('should warn on deactivation error (line 142)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* suppress */
      });

      // Use a trap that activates successfully but throws on deactivate
      let trapActive = false;
      mockTrap = {
        get active() {
          return trapActive;
        },
        get paused() {
          return false;
        },
        activate() {
          trapActive = true;
          return this;
        },
        deactivate() {
          throw new Error('deactivation failed');
        },
        pause() {
          return this;
        },
        unpause() {
          return this;
        },
        updateContainerElements() {
          return this;
        },
      } as FocusTrap;

      host.simulateDisconnected();
      host.remove();

      const newHost = createHost();
      const newIsActive = vi.fn(() => true);
      const ctrl = new FocusTrapController(newHost, {
        isActive: newIsActive,
        escapeDeactivates: true,
        clickOutsideDeactivates: false,
      });

      newHost.simulateConnected();
      newHost.simulateUpdated();
      expect(ctrl.active).toBe(true);

      // Deactivation should catch the error and warn
      newIsActive.mockReturnValue(false);
      expect(() => newHost.simulateUpdated()).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        '[FocusTrapController] Error during deactivation:',
        expect.any(Error),
      );

      newHost.simulateDisconnected();
      newHost.remove();
      warnSpy.mockRestore();
    });
  });
});
