/**
 * UI Signals Tests
 *
 * Tests for resetUISignals() and signal default values.
 */

import { ActiveTab, DEFAULT_ACTIVE_TAB } from '@shared/schemas';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SignalSnapshot } from '@/test-utils/signal-helpers';
import { createSignalSnapshot, restoreSignalSnapshot } from '@/test-utils/signal-helpers';
import {
  activeTab,
  baseZoom,
  enableAnimation,
  previewFilter,
  resetUISignals,
  zoom,
} from './ui.signals';

describe('ui.signals', () => {
  let snapshot: SignalSnapshot;

  beforeEach(() => {
    snapshot = createSignalSnapshot([activeTab, zoom, baseZoom, enableAnimation, previewFilter]);
  });

  afterEach(() => {
    restoreSignalSnapshot(snapshot);
  });

  describe('default values', () => {
    it('should have correct default values', () => {
      resetUISignals();

      expect(activeTab.get()).toBe(DEFAULT_ACTIVE_TAB);
      expect(zoom.get()).toBe(1);
      expect(baseZoom.get()).toBe(1);
      expect(enableAnimation.get()).toBe(false);
      expect(previewFilter.get()).toBeNull();
    });
  });

  describe('resetUISignals', () => {
    it('should reset activeTab to default', () => {
      activeTab.set(ActiveTab.Overview);
      expect(activeTab.get()).toBe(ActiveTab.Overview);

      resetUISignals();

      expect(activeTab.get()).toBe(DEFAULT_ACTIVE_TAB);
    });

    it('should reset zoom to 1', () => {
      zoom.set(2.5);
      expect(zoom.get()).toBe(2.5);

      resetUISignals();

      expect(zoom.get()).toBe(1);
    });

    it('should reset baseZoom to 1', () => {
      baseZoom.set(0.5);
      expect(baseZoom.get()).toBe(0.5);

      resetUISignals();

      expect(baseZoom.get()).toBe(1);
    });

    it('should reset enableAnimation to false', () => {
      enableAnimation.set(true);
      expect(enableAnimation.get()).toBe(true);

      resetUISignals();

      expect(enableAnimation.get()).toBe(false);
    });

    it('should reset previewFilter to null', () => {
      previewFilter.set({ type: 'nodeType', value: 'framework' });
      expect(previewFilter.get()).toEqual({ type: 'nodeType', value: 'framework' });

      resetUISignals();

      expect(previewFilter.get()).toBeNull();
    });

    it('should reset all 5 signals at once from non-default values', () => {
      activeTab.set(ActiveTab.Overview);
      zoom.set(3.0);
      baseZoom.set(0.75);
      enableAnimation.set(true);
      previewFilter.set({ type: 'platform', value: 'iOS' });

      resetUISignals();

      expect(activeTab.get()).toBe(DEFAULT_ACTIVE_TAB);
      expect(zoom.get()).toBe(1);
      expect(baseZoom.get()).toBe(1);
      expect(enableAnimation.get()).toBe(false);
      expect(previewFilter.get()).toBeNull();
    });
  });
});
