import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createNode } from '../test/fixtures';
import { useGraphHandlers } from './useGraphHandlers';

describe('useGraphHandlers', () => {
  const createMockSetters = () => ({
    setSelectedNode: vi.fn(),
    setSelectedCluster: vi.fn(),
    setViewMode: vi.fn(),
  });

  describe('handleNodeSelect', () => {
    it('should set selected node and clear cluster', () => {
      const setters = createMockSetters();
      const node = createNode({ id: 'test', name: 'Test' });

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: null,
          viewMode: 'full',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleNodeSelect(node);
      });

      expect(setters.setSelectedNode).toHaveBeenCalledWith(node);
      expect(setters.setSelectedCluster).toHaveBeenCalledWith(null);
      expect(setters.setViewMode).toHaveBeenCalledWith('full');
    });

    it('should handle null node selection', () => {
      const setters = createMockSetters();

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: createNode({ id: 'current', name: 'Current' }),
          viewMode: 'full',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleNodeSelect(null);
      });

      expect(setters.setSelectedNode).toHaveBeenCalledWith(null);
      expect(setters.setSelectedCluster).toHaveBeenCalledWith(null);
    });
  });

  describe('handleClusterSelect', () => {
    it('should set selected cluster and clear node', () => {
      const setters = createMockSetters();

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: createNode({ id: 'node', name: 'Node' }),
          viewMode: 'full',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleClusterSelect('cluster-1');
      });

      expect(setters.setSelectedCluster).toHaveBeenCalledWith('cluster-1');
      expect(setters.setSelectedNode).toHaveBeenCalledWith(null);
      expect(setters.setViewMode).toHaveBeenCalledWith('full');
    });

    it('should handle null cluster selection', () => {
      const setters = createMockSetters();

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: null,
          viewMode: 'full',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleClusterSelect(null);
      });

      expect(setters.setSelectedCluster).toHaveBeenCalledWith(null);
      expect(setters.setSelectedNode).toHaveBeenCalledWith(null);
    });
  });

  describe('handleFocusNode', () => {
    it('should set to focused mode for new node', () => {
      const setters = createMockSetters();
      const node = createNode({ id: 'test', name: 'Test' });

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: null,
          viewMode: 'full',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleFocusNode(node);
      });

      expect(setters.setSelectedNode).toHaveBeenCalledWith(node);
      expect(setters.setViewMode).toHaveBeenCalledWith('focused');
    });

    it('should toggle from focused to full when same node', () => {
      const setters = createMockSetters();
      const node = createNode({ id: 'test', name: 'Test' });

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: node,
          viewMode: 'focused',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleFocusNode(node);
      });

      expect(setters.setViewMode).toHaveBeenCalledWith('full');
    });

    it('should toggle from both to dependents when same node', () => {
      const setters = createMockSetters();
      const node = createNode({ id: 'test', name: 'Test' });

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: node,
          viewMode: 'both',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleFocusNode(node);
      });

      expect(setters.setViewMode).toHaveBeenCalledWith('dependents');
    });

    it('should toggle from dependents to both', () => {
      const setters = createMockSetters();
      const node = createNode({ id: 'test', name: 'Test' });

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: null,
          viewMode: 'dependents',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleFocusNode(node);
      });

      expect(setters.setViewMode).toHaveBeenCalledWith('both');
    });
  });

  describe('handleShowDependents', () => {
    it('should set to dependents mode for new node', () => {
      const setters = createMockSetters();
      const node = createNode({ id: 'test', name: 'Test' });

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: null,
          viewMode: 'full',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleShowDependents(node);
      });

      expect(setters.setSelectedNode).toHaveBeenCalledWith(node);
      expect(setters.setViewMode).toHaveBeenCalledWith('dependents');
    });

    it('should toggle from dependents to full when same node', () => {
      const setters = createMockSetters();
      const node = createNode({ id: 'test', name: 'Test' });

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: node,
          viewMode: 'dependents',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleShowDependents(node);
      });

      expect(setters.setViewMode).toHaveBeenCalledWith('full');
    });

    it('should toggle from both to focused when same node', () => {
      const setters = createMockSetters();
      const node = createNode({ id: 'test', name: 'Test' });

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: node,
          viewMode: 'both',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleShowDependents(node);
      });

      expect(setters.setViewMode).toHaveBeenCalledWith('focused');
    });

    it('should toggle from focused to both', () => {
      const setters = createMockSetters();
      const node = createNode({ id: 'test', name: 'Test' });

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: null,
          viewMode: 'focused',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleShowDependents(node);
      });

      expect(setters.setViewMode).toHaveBeenCalledWith('both');
    });
  });

  describe('handleShowImpact', () => {
    it('should set impact mode and select node', () => {
      const setters = createMockSetters();
      const node = createNode({ id: 'test', name: 'Test' });

      const { result } = renderHook(() =>
        useGraphHandlers({
          selectedNode: null,
          viewMode: 'full',
          ...setters,
        }),
      );

      act(() => {
        result.current.handleShowImpact(node);
      });

      expect(setters.setSelectedNode).toHaveBeenCalledWith(node);
      expect(setters.setViewMode).toHaveBeenCalledWith('impact');
    });
  });
});
