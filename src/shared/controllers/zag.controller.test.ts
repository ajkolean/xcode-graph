/**
 * Tests for ZagController
 * Covers service/state/context getters, send, matches, get/set methods,
 * and error handling during disconnect.
 */

import { type SidebarMachineSchema, sidebarMachine } from '@shared/machines/sidebar.machine';
import { MachineStatus } from '@zag-js/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockHost } from '@/test-utils';
import { createMachineController, ZagController } from './zag.controller';

describe('ZagController', () => {
  let host: MockHost;
  let controller: ZagController<SidebarMachineSchema>;

  beforeEach(() => {
    host = new MockHost();
    controller = createMachineController(host, sidebarMachine, {
      id: 'test-sidebar',
    });
  });

  afterEach(() => {
    try {
      host.disconnectedCallback();
    } catch {
      // Cleanup may fail if already disconnected
    }
  });

  describe('Initialization', () => {
    it('should register with the host', () => {
      expect(host.getControllers()).toContain(controller);
    });

    it('should create a valid service', () => {
      expect(controller.service).toBeDefined();
    });
  });

  describe('service getter (line 65)', () => {
    it('should return the machine service', () => {
      const service = controller.service;
      expect(service).toBeDefined();
      expect(typeof service.send).toBe('function');
    });
  });

  describe('state getter (line 73)', () => {
    it('should return the current machine state', () => {
      host.connectedCallback();
      const state = controller.state;
      expect(state).toBeDefined();
    });
  });

  describe('context getter (line 81)', () => {
    it('should return the machine context', () => {
      host.connectedCallback();
      const context = controller.context;
      expect(context).toBeDefined();
      expect(typeof context.get).toBe('function');
    });
  });

  describe('hostConnected', () => {
    it('should start the machine and subscribe to updates', () => {
      host.connectedCallback();
      expect(controller.service.getStatus()).toBe(MachineStatus.Started);
    });

    it('should clean up existing subscription before creating new one', () => {
      host.connectedCallback();
      // Connecting again should not throw (defensive cleanup)
      host.connectedCallback();
      expect(controller.service.getStatus()).toBe(MachineStatus.Started);
    });
  });

  describe('hostDisconnected', () => {
    it('should stop the machine and clean up', () => {
      host.connectedCallback();
      host.disconnectedCallback();
      expect(controller.service.getStatus()).toBe(MachineStatus.Stopped);
    });

    it('should warn on cleanup error (line 120)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* suppress */
      });

      host.connectedCallback();
      expect(controller.service.getStatus()).toBe(MachineStatus.Started);

      // Access the internal instance via the controller to make stop() throw.
      // The controller stores the instance as a private field; we use bracket
      // notation to reach it and stub its stop method.
      const ctrl = controller as unknown as { instance: { stop: () => void } };
      const originalStop = ctrl.instance.stop.bind(ctrl.instance);
      ctrl.instance.stop = () => {
        throw new Error('simulated stop error');
      };

      // hostDisconnected should catch the error and warn
      expect(() => host.disconnectedCallback()).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        '[ZagController] Error during cleanup:',
        expect.any(Error),
      );

      // Restore original stop so afterEach cleanup doesn't fail
      ctrl.instance.stop = originalStop;
      warnSpy.mockRestore();
    });
  });

  describe('send method', () => {
    it('should send events to the machine', async () => {
      host.connectedCallback();
      controller.send({ type: 'TOGGLE' });
      // Zag processes events via microtasks
      await new Promise<void>((resolve) => queueMicrotask(resolve));
      expect(controller.matches('collapsed')).toBe(true);
    });
  });

  describe('matches method', () => {
    it('should return true when machine is in the given state', () => {
      host.connectedCallback();
      expect(controller.matches('expanded')).toBe(true);
    });

    it('should return false when machine is not in the given state', () => {
      host.connectedCallback();
      expect(controller.matches('collapsed')).toBe(false);
    });
  });

  describe('get method', () => {
    it('should return context values by key', () => {
      host.connectedCallback();
      const activeTab = controller.get('activeTab');
      expect(activeTab).toBe('filters');
    });
  });

  describe('set method (line 152)', () => {
    it('should set context values by key', () => {
      host.connectedCallback();
      controller.set('activeTab', 'nodeDetails');
      expect(controller.get('activeTab')).toBe('nodeDetails');
    });
  });

  describe('createMachineController factory', () => {
    it('should return a ZagController instance', () => {
      const newHost = new MockHost();
      const ctrl = createMachineController(newHost, sidebarMachine, {
        id: 'factory-test',
      });
      expect(ctrl).toBeInstanceOf(ZagController);
      newHost.connectedCallback();
      newHost.disconnectedCallback();
    });
  });
});
