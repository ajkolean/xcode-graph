/**
 * Tests for ZustandController
 */

import { LitElement } from 'lit';
import { beforeEach, describe, expect, it } from 'vitest';
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { createStoreController, ZustandController } from './zustand.controller';

// Create a test store
interface TestStore {
  count: number;
  name: string;
  increment: () => void;
  setName: (name: string) => void;
}

let useTestStore: UseBoundStore<StoreApi<TestStore>>;

// Mock host for testing
class MockHost {
  private controllers: any[] = [];
  private updateRequested = false;
  updateCount = 0;

  addController(controller: any) {
    this.controllers.push(controller);
  }

  requestUpdate() {
    this.updateRequested = true;
    this.updateCount++;
  }

  connectedCallback() {
    this.controllers.forEach((c) => c.hostConnected?.());
  }

  disconnectedCallback() {
    this.controllers.forEach((c) => c.hostDisconnected?.());
  }
}

describe('ZustandController', () => {
  beforeEach(() => {
    // Create fresh store for each test
    useTestStore = create<TestStore>((set) => ({
      count: 0,
      name: 'initial',
      increment: () => set((s) => ({ count: s.count + 1 })),
      setName: (name) => set({ name }),
    }));
  });

  describe('Construction and Initialization', () => {
    it('should initialize with current store value', () => {
      const host = new MockHost();
      const controller = createStoreController(host, useTestStore, (s) => s.count);

      expect(controller.value).toBe(0);
    });

    it('should subscribe to store on connect', () => {
      const host = new MockHost();
      const controller = createStoreController(host, useTestStore, (s) => s.count);

      host.connectedCallback();

      // Change store value
      useTestStore.getState().increment();

      // Controller should have new value
      expect(controller.value).toBe(1);
    });
  });

  describe('Reactivity', () => {
    it('should update value when store changes', () => {
      const host = new MockHost();
      const controller = createStoreController(host, useTestStore, (s) => s.count);

      host.connectedCallback();

      const initialUpdateCount = host.updateCount;

      useTestStore.getState().increment();

      expect(controller.value).toBe(1);
      expect(host.updateCount).toBeGreaterThan(initialUpdateCount);
    });

    it('should only trigger update when selected value changes', () => {
      const host = new MockHost();
      const controller = createStoreController(host, useTestStore, (s) => s.count);

      host.connectedCallback();

      const initialUpdateCount = host.updateCount;

      // Change name (not selected)
      useTestStore.getState().setName('new name');

      // Should NOT trigger update since selector only watches count
      expect(host.updateCount).toBe(initialUpdateCount);
    });

    it('should work with complex selectors', () => {
      const host = new MockHost();
      const controller = createStoreController(host, useTestStore, (s) => ({
        count: s.count,
        name: s.name,
      }));

      host.connectedCallback();

      expect(controller.value.count).toBe(0);
      expect(controller.value.name).toBe('initial');

      useTestStore.getState().increment();
      expect(controller.value.count).toBe(1);
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe on disconnect', () => {
      const host = new MockHost();
      const controller = createStoreController(host, useTestStore, (s) => s.count);

      host.connectedCallback();
      host.disconnectedCallback();

      const updateCountAfterDisconnect = host.updateCount;

      // Change store after disconnect
      useTestStore.getState().increment();

      // Should NOT trigger update after disconnect
      expect(host.updateCount).toBe(updateCountAfterDisconnect);
    });

    it('should handle cleanup errors gracefully', () => {
      const host = new MockHost();
      const controller = createStoreController(host, useTestStore, (s) => s.count);

      host.connectedCallback();

      // Should not throw when disconnecting
      expect(() => host.disconnectedCallback()).not.toThrow();
    });

    it('should handle multiple connect/disconnect cycles', () => {
      const host = new MockHost();
      const controller = createStoreController(host, useTestStore, (s) => s.count);

      // Connect/disconnect multiple times
      host.connectedCallback();
      host.disconnectedCallback();
      host.connectedCallback();
      host.disconnectedCallback();
      host.connectedCallback();

      useTestStore.getState().increment();

      expect(controller.value).toBe(1);
    });
  });

  describe('Actions', () => {
    it('should get actions from store', () => {
      const host = new MockHost();
      const controller = createStoreController(host, useTestStore, (s) => s.count);

      const increment = controller.getAction('increment');

      expect(typeof increment).toBe('function');
      increment();

      expect(useTestStore.getState().count).toBe(1);
    });

    it('should access full state', () => {
      const host = new MockHost();
      const controller = createStoreController(host, useTestStore, (s) => s.count);

      const state = controller.getState();

      expect(state.count).toBe(0);
      expect(state.name).toBe('initial');
    });
  });

  describe('Multiple Controllers', () => {
    it('should support multiple controllers in same host', () => {
      const host = new MockHost();
      const countController = createStoreController(host, useTestStore, (s) => s.count);
      const nameController = createStoreController(host, useTestStore, (s) => s.name);

      host.connectedCallback();

      expect(countController.value).toBe(0);
      expect(nameController.value).toBe('initial');

      useTestStore.getState().increment();
      useTestStore.getState().setName('updated');

      expect(countController.value).toBe(1);
      expect(nameController.value).toBe('updated');
    });
  });
});
