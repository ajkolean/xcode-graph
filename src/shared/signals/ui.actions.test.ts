/**
 * UI Actions Tests
 *
 * Comprehensive tests for UI state mutation functions.
 * Tests tab switching, zoom controls, animation toggle, and preview filters.
 */

import { ActiveTab } from '@shared/schemas';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SignalSnapshot } from '../../test-utils/signal-helpers';
import { createSignalSnapshot, restoreSignalSnapshot } from '../../test-utils/signal-helpers';
import {
  resetZoom,
  setActiveTab,
  setBaseZoom,
  setEnableAnimation,
  setPreviewFilter,
  setZoom,
  toggleAnimation,
  zoomIn,
  zoomOut,
} from './ui.actions';
import { activeTab, baseZoom, enableAnimation, previewFilter, zoom } from './ui.signals';

describe('ui.actions', () => {
  let snapshot: SignalSnapshot;

  beforeEach(() => {
    snapshot = createSignalSnapshot([activeTab, zoom, baseZoom, enableAnimation, previewFilter]);
  });

  afterEach(() => {
    restoreSignalSnapshot(snapshot);
  });

  // ==================== Tab Actions ====================

  describe('setActiveTab', () => {
    it('should allow switching between tabs', () => {
      const tabs: ActiveTab[] = [ActiveTab.Graph, ActiveTab.Overview];

      for (const tab of tabs) {
        setActiveTab(tab);
        expect(activeTab.get()).toBe(tab);
      }
    });

    it('should replace previous tab', () => {
      setActiveTab(ActiveTab.Graph);
      setActiveTab(ActiveTab.Overview);

      expect(activeTab.get()).toBe(ActiveTab.Overview);
    });
  });

  // ==================== Zoom Actions ====================

  describe('setZoom', () => {
    it('should set zoom level', () => {
      setZoom(1.5);

      expect(zoom.get()).toBe(1.5);
    });

    it('should clamp zoom to minimum 0.01', () => {
      setZoom(0.001);

      expect(zoom.get()).toBe(0.01);
    });

    it('should clamp zoom to maximum 5.0', () => {
      setZoom(6.0);

      expect(zoom.get()).toBe(5);
    });

    it('should allow zoom at exact minimum', () => {
      setZoom(0.01);

      expect(zoom.get()).toBe(0.01);
    });

    it('should allow zoom at exact maximum', () => {
      setZoom(5);

      expect(zoom.get()).toBe(5);
    });

    it('should handle negative values by clamping to minimum', () => {
      setZoom(-1);

      expect(zoom.get()).toBe(0.01);
    });

    it('should handle zero by clamping to minimum', () => {
      setZoom(0);

      expect(zoom.get()).toBe(0.01);
    });
  });

  describe('zoomIn', () => {
    it('should increase zoom by 0.1', () => {
      zoom.set(1);

      zoomIn();

      expect(zoom.get()).toBe(1.1);
    });

    it('should not exceed maximum zoom of 5.0', () => {
      zoom.set(4.95);

      zoomIn();

      expect(zoom.get()).toBe(5);
    });

    it('should clamp to maximum when zooming in from 5.0', () => {
      zoom.set(5);

      zoomIn();

      expect(zoom.get()).toBe(5);
    });

    it('should handle multiple zoom in operations', () => {
      zoom.set(1);

      zoomIn();
      zoomIn();
      zoomIn();

      expect(zoom.get()).toBeCloseTo(1.3, 1);
    });
  });

  describe('zoomOut', () => {
    it('should decrease zoom by 0.1', () => {
      zoom.set(1);

      zoomOut();

      expect(zoom.get()).toBeCloseTo(0.9, 1);
    });

    it('should not go below minimum zoom of 0.01', () => {
      zoom.set(0.05);

      zoomOut();

      expect(zoom.get()).toBe(0.01);
    });

    it('should clamp to minimum when zooming out from 0.01', () => {
      zoom.set(0.01);

      zoomOut();

      expect(zoom.get()).toBe(0.01);
    });

    it('should handle multiple zoom out operations', () => {
      zoom.set(1);

      zoomOut();
      zoomOut();
      zoomOut();

      expect(zoom.get()).toBeCloseTo(0.7, 1);
    });
  });

  describe('resetZoom', () => {
    it('should reset zoom to 1.0', () => {
      zoom.set(2.5);

      resetZoom();

      expect(zoom.get()).toBe(1);
    });

    it('should reset zoom from minimum to 1.0', () => {
      zoom.set(0.01);

      resetZoom();

      expect(zoom.get()).toBe(1);
    });
  });

  describe('setBaseZoom', () => {
    it('should set base zoom level', () => {
      setBaseZoom(0.75);

      expect(baseZoom.get()).toBe(0.75);
    });

    it('should allow setting base zoom to different values', () => {
      setBaseZoom(1.5);
      expect(baseZoom.get()).toBe(1.5);

      setBaseZoom(0.3);
      expect(baseZoom.get()).toBe(0.3);
    });
  });

  // ==================== Animation Actions ====================

  describe('toggleAnimation', () => {
    it('should toggle animation from false to true', () => {
      enableAnimation.set(false);

      toggleAnimation();

      expect(enableAnimation.get()).toBe(true);
    });

    it('should toggle animation from true to false', () => {
      enableAnimation.set(true);

      toggleAnimation();

      expect(enableAnimation.get()).toBe(false);
    });

    it('should handle multiple toggles', () => {
      const initial = enableAnimation.get();

      toggleAnimation();
      toggleAnimation();

      expect(enableAnimation.get()).toBe(initial);
    });
  });

  describe('setEnableAnimation', () => {
    it('should replace previous value', () => {
      setEnableAnimation(true);
      setEnableAnimation(false);

      expect(enableAnimation.get()).toBe(false);
    });
  });

  // ==================== Preview Filter Actions ====================

  describe('setPreviewFilter', () => {
    it('should clear preview filter with null', () => {
      setPreviewFilter({ type: 'nodeType', value: 'framework' });

      setPreviewFilter(null);

      expect(previewFilter.get()).toBeNull();
    });

    it('should replace previous preview filter', () => {
      setPreviewFilter({ type: 'nodeType', value: 'framework' });
      setPreviewFilter({ type: 'platform', value: 'iOS' });

      expect(previewFilter.get()).toEqual({ type: 'platform', value: 'iOS' });
    });
  });

  // ==================== Integration Tests ====================

  describe('integration scenarios', () => {
    it('should handle zoom in and out sequence', () => {
      zoom.set(1);

      zoomIn();
      zoomIn();
      zoomOut();

      expect(zoom.get()).toBeCloseTo(1.1, 1);
    });

    it('should handle zoom to limits and reset', () => {
      setZoom(5);
      expect(zoom.get()).toBe(5);

      setZoom(0.01);
      expect(zoom.get()).toBe(0.01);

      resetZoom();
      expect(zoom.get()).toBe(1);
    });

    it('should handle rapid zoom in beyond limit', () => {
      zoom.set(4.5);

      zoomIn();
      zoomIn();
      zoomIn();
      zoomIn();
      zoomIn();

      // Use toBeCloseTo for floating point precision
      expect(zoom.get()).toBeCloseTo(5, 5);
    });

    it('should handle rapid zoom out beyond limit', () => {
      zoom.set(0.3);

      zoomOut();
      zoomOut();
      zoomOut();
      zoomOut();
      zoomOut();

      expect(zoom.get()).toBe(0.01);
    });

    it('should maintain state across multiple operations', () => {
      setActiveTab(ActiveTab.Graph);
      setZoom(1.5);
      setEnableAnimation(true);
      setPreviewFilter({ type: 'nodeType', value: 'framework' });

      expect(activeTab.get()).toBe(ActiveTab.Graph);
      expect(zoom.get()).toBe(1.5);
      expect(enableAnimation.get()).toBe(true);
      expect(previewFilter.get()).toEqual({ type: 'nodeType', value: 'framework' });
    });

    it('should handle animation toggle while other state changes', () => {
      setZoom(1.5);

      toggleAnimation();
      expect(enableAnimation.get()).toBe(true);

      setZoom(1.2);

      toggleAnimation();
      expect(enableAnimation.get()).toBe(false);

      // Zoom should be unaffected
      expect(zoom.get()).toBe(1.2);
    });

    it('should handle preview filter changes during zoom', () => {
      setPreviewFilter({ type: 'nodeType', value: 'framework' });

      zoomIn();
      expect(previewFilter.get()).toEqual({ type: 'nodeType', value: 'framework' });

      setPreviewFilter({ type: 'platform', value: 'iOS' });
      expect(zoom.get()).toBeCloseTo(1.1, 1);
    });
  });
});
