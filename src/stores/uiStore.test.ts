/**
 * Comprehensive tests for uiStore
 * Target: 80%+ coverage
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { type PreviewFilter, useUIStore } from './uiStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useUIStore.setState({
      activeTab: 'graph',
      zoom: 1,
      enableAnimation: false,
      previewFilter: null,
    });
  });

  describe('Initial State', () => {
    it('should have graph as active tab', () => {
      expect(useUIStore.getState().activeTab).toBe('graph');
    });

    it('should have zoom level of 1', () => {
      expect(useUIStore.getState().zoom).toBe(1);
    });

    it('should have animation disabled', () => {
      expect(useUIStore.getState().enableAnimation).toBe(false);
    });

    it('should have no preview filter', () => {
      expect(useUIStore.getState().previewFilter).toBeNull();
    });
  });

  describe('setActiveTab', () => {
    it('should change active tab', () => {
      useUIStore.getState().setActiveTab('overview');

      expect(useUIStore.getState().activeTab).toBe('overview');
    });

    it('should accept all valid tab values', () => {
      const tabs = [
        'overview',
        'builds',
        'test-runs',
        'module-cache',
        'xcode-cache',
        'previews',
        'qa',
        'bundles',
        'graph',
      ] as const;

      for (const tab of tabs) {
        useUIStore.getState().setActiveTab(tab);
        expect(useUIStore.getState().activeTab).toBe(tab);
      }
    });
  });

  describe('setZoom', () => {
    it('should set zoom level', () => {
      useUIStore.getState().setZoom(1.5);

      expect(useUIStore.getState().zoom).toBe(1.5);
    });

    it('should clamp zoom to minimum 0.2', () => {
      useUIStore.getState().setZoom(0.1);

      expect(useUIStore.getState().zoom).toBe(0.2);
    });

    it('should clamp zoom to maximum 2', () => {
      useUIStore.getState().setZoom(5);

      expect(useUIStore.getState().zoom).toBe(2);
    });

    it('should allow values within range', () => {
      useUIStore.getState().setZoom(0.5);
      expect(useUIStore.getState().zoom).toBe(0.5);

      useUIStore.getState().setZoom(1.8);
      expect(useUIStore.getState().zoom).toBe(1.8);
    });
  });

  describe('zoomIn', () => {
    it('should increase zoom by 0.1', () => {
      useUIStore.setState({ zoom: 1.0 });

      useUIStore.getState().zoomIn();

      expect(useUIStore.getState().zoom).toBeCloseTo(1.1, 1);
    });

    it('should respect maximum zoom of 2', () => {
      useUIStore.setState({ zoom: 1.95 });

      useUIStore.getState().zoomIn();

      expect(useUIStore.getState().zoom).toBe(2);
    });

    it('should allow multiple zoom in operations', () => {
      useUIStore.setState({ zoom: 1.0 });

      useUIStore.getState().zoomIn();
      useUIStore.getState().zoomIn();
      useUIStore.getState().zoomIn();

      expect(useUIStore.getState().zoom).toBeCloseTo(1.3, 1);
    });
  });

  describe('zoomOut', () => {
    it('should decrease zoom by 0.1', () => {
      useUIStore.setState({ zoom: 1.0 });

      useUIStore.getState().zoomOut();

      expect(useUIStore.getState().zoom).toBeCloseTo(0.9, 1);
    });

    it('should respect minimum zoom of 0.2', () => {
      useUIStore.setState({ zoom: 0.25 });

      useUIStore.getState().zoomOut();

      expect(useUIStore.getState().zoom).toBe(0.2);
    });

    it('should allow multiple zoom out operations', () => {
      useUIStore.setState({ zoom: 1.5 });

      useUIStore.getState().zoomOut();
      useUIStore.getState().zoomOut();
      useUIStore.getState().zoomOut();

      expect(useUIStore.getState().zoom).toBeCloseTo(1.2, 1);
    });
  });

  describe('resetZoom', () => {
    it('should reset zoom to 1', () => {
      useUIStore.setState({ zoom: 1.5 });

      useUIStore.getState().resetZoom();

      expect(useUIStore.getState().zoom).toBe(1);
    });

    it('should reset from zoomed out', () => {
      useUIStore.setState({ zoom: 0.5 });

      useUIStore.getState().resetZoom();

      expect(useUIStore.getState().zoom).toBe(1);
    });
  });

  describe('toggleAnimation', () => {
    it('should toggle animation on', () => {
      useUIStore.setState({ enableAnimation: false });

      useUIStore.getState().toggleAnimation();

      expect(useUIStore.getState().enableAnimation).toBe(true);
    });

    it('should toggle animation off', () => {
      useUIStore.setState({ enableAnimation: true });

      useUIStore.getState().toggleAnimation();

      expect(useUIStore.getState().enableAnimation).toBe(false);
    });

    it('should toggle multiple times', () => {
      useUIStore.getState().toggleAnimation();
      expect(useUIStore.getState().enableAnimation).toBe(true);

      useUIStore.getState().toggleAnimation();
      expect(useUIStore.getState().enableAnimation).toBe(false);

      useUIStore.getState().toggleAnimation();
      expect(useUIStore.getState().enableAnimation).toBe(true);
    });
  });

  describe('setEnableAnimation', () => {
    it('should enable animation', () => {
      useUIStore.getState().setEnableAnimation(true);

      expect(useUIStore.getState().enableAnimation).toBe(true);
    });

    it('should disable animation', () => {
      useUIStore.setState({ enableAnimation: true });

      useUIStore.getState().setEnableAnimation(false);

      expect(useUIStore.getState().enableAnimation).toBe(false);
    });
  });

  describe('setPreviewFilter', () => {
    it('should set preview filter', () => {
      const filter: PreviewFilter = { type: 'nodeType', value: 'framework' };

      useUIStore.getState().setPreviewFilter(filter);

      expect(useUIStore.getState().previewFilter).toEqual(filter);
    });

    it('should clear preview filter', () => {
      useUIStore.setState({ previewFilter: { type: 'nodeType', value: 'app' } });

      useUIStore.getState().setPreviewFilter(null);

      expect(useUIStore.getState().previewFilter).toBeNull();
    });

    it('should handle different filter types', () => {
      const filterTypes: Array<PreviewFilter> = [
        { type: 'nodeType', value: 'app' },
        { type: 'platform', value: 'iOS' },
        { type: 'origin', value: 'local' },
        { type: 'project', value: 'MyProject' },
        { type: 'package', value: 'Alamofire' },
        { type: 'cluster', value: 'ClusterX' },
      ];

      for (const filter of filterTypes) {
        useUIStore.getState().setPreviewFilter(filter);
        expect(useUIStore.getState().previewFilter).toEqual(filter);
      }
    });
  });

  describe('Subscription and Reactivity', () => {
    it('should notify subscribers when tab changes', () => {
      let callCount = 0;
      const unsubscribe = useUIStore.subscribe(() => {
        callCount++;
      });

      useUIStore.getState().setActiveTab('overview');

      expect(callCount).toBeGreaterThan(0);
      unsubscribe();
    });

    it('should notify subscribers when zoom changes', () => {
      let callCount = 0;
      const unsubscribe = useUIStore.subscribe(() => {
        callCount++;
      });

      useUIStore.getState().zoomIn();

      expect(callCount).toBeGreaterThan(0);
      unsubscribe();
    });
  });
});
