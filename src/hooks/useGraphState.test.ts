import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createNode } from '../test/fixtures';
import { useGraphState } from './useGraphState';

describe('useGraphState', () => {
  describe('initial state', () => {
    it('should have null selectedNode initially', () => {
      const { result } = renderHook(() => useGraphState());

      expect(result.current.selectedNode).toBeNull();
    });

    it('should have null selectedCluster initially', () => {
      const { result } = renderHook(() => useGraphState());

      expect(result.current.selectedCluster).toBeNull();
    });

    it('should have null hoveredNode initially', () => {
      const { result } = renderHook(() => useGraphState());

      expect(result.current.hoveredNode).toBeNull();
    });

    it('should have empty searchQuery initially', () => {
      const { result } = renderHook(() => useGraphState());

      expect(result.current.searchQuery).toBe('');
    });

    it('should have default viewMode initially', () => {
      const { result } = renderHook(() => useGraphState());

      expect(result.current.viewMode).toBe('full'); // DEFAULT_VIEW_MODE
    });

    it('should have zoom of 1 initially', () => {
      const { result } = renderHook(() => useGraphState());

      expect(result.current.zoom).toBe(1);
    });

    it('should have animation disabled initially', () => {
      const { result } = renderHook(() => useGraphState());

      expect(result.current.enableAnimation).toBe(false);
    });

    it('should have null previewFilter initially', () => {
      const { result } = renderHook(() => useGraphState());

      expect(result.current.previewFilter).toBeNull();
    });
  });

  describe('setSelectedNode', () => {
    it('should update selectedNode', () => {
      const { result } = renderHook(() => useGraphState());
      const node = createNode({ id: 'test', name: 'Test' });

      act(() => {
        result.current.setSelectedNode(node);
      });

      expect(result.current.selectedNode).toEqual(node);
    });

    it('should allow clearing selectedNode', () => {
      const { result } = renderHook(() => useGraphState());
      const node = createNode({ id: 'test', name: 'Test' });

      act(() => {
        result.current.setSelectedNode(node);
      });
      act(() => {
        result.current.setSelectedNode(null);
      });

      expect(result.current.selectedNode).toBeNull();
    });
  });

  describe('setSelectedCluster', () => {
    it('should update selectedCluster', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setSelectedCluster('cluster-1');
      });

      expect(result.current.selectedCluster).toBe('cluster-1');
    });

    it('should allow clearing selectedCluster', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setSelectedCluster('cluster-1');
      });
      act(() => {
        result.current.setSelectedCluster(null);
      });

      expect(result.current.selectedCluster).toBeNull();
    });
  });

  describe('setHoveredNode', () => {
    it('should update hoveredNode', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setHoveredNode('node-1');
      });

      expect(result.current.hoveredNode).toBe('node-1');
    });
  });

  describe('setSearchQuery', () => {
    it('should update searchQuery', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setSearchQuery('test query');
      });

      expect(result.current.searchQuery).toBe('test query');
    });
  });

  describe('setViewMode', () => {
    it('should update viewMode to focused', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setViewMode('focused');
      });

      expect(result.current.viewMode).toBe('focused');
    });

    it('should update viewMode to dependents', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setViewMode('dependents');
      });

      expect(result.current.viewMode).toBe('dependents');
    });

    it('should update viewMode to both', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setViewMode('both');
      });

      expect(result.current.viewMode).toBe('both');
    });
  });

  describe('setZoom', () => {
    it('should update zoom', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setZoom(1.5);
      });

      expect(result.current.zoom).toBe(1.5);
    });

    it('should allow zoom less than 1', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setZoom(0.5);
      });

      expect(result.current.zoom).toBe(0.5);
    });
  });

  describe('setEnableAnimation', () => {
    it('should enable animation', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setEnableAnimation(true);
      });

      expect(result.current.enableAnimation).toBe(true);
    });

    it('should disable animation', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setEnableAnimation(true);
      });
      act(() => {
        result.current.setEnableAnimation(false);
      });

      expect(result.current.enableAnimation).toBe(false);
    });
  });

  describe('setPreviewFilter', () => {
    it('should set nodeType preview filter', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setPreviewFilter({ type: 'nodeType', value: 'framework' });
      });

      expect(result.current.previewFilter).toEqual({ type: 'nodeType', value: 'framework' });
    });

    it('should set platform preview filter', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setPreviewFilter({ type: 'platform', value: 'iOS' });
      });

      expect(result.current.previewFilter).toEqual({ type: 'platform', value: 'iOS' });
    });

    it('should set cluster preview filter', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setPreviewFilter({ type: 'cluster', value: 'Core' });
      });

      expect(result.current.previewFilter).toEqual({ type: 'cluster', value: 'Core' });
    });

    it('should clear preview filter', () => {
      const { result } = renderHook(() => useGraphState());

      act(() => {
        result.current.setPreviewFilter({ type: 'nodeType', value: 'app' });
      });
      act(() => {
        result.current.setPreviewFilter(null);
      });

      expect(result.current.previewFilter).toBeNull();
    });
  });
});
