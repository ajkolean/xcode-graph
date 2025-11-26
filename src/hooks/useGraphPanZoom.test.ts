import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGraphPanZoom } from './useGraphPanZoom';

describe('useGraphPanZoom', () => {
  describe('initial state', () => {
    it('should have pan at (0, 0) initially', () => {
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1 }));

      expect(result.current.pan).toEqual({ x: 0, y: 0 });
    });

    it('should not be dragging initially', () => {
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1 }));

      expect(result.current.isDragging).toBe(false);
    });
  });

  describe('handleMouseDown', () => {
    it('should start dragging when clicking on svg element', () => {
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1 }));

      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const mockEvent = {
        target: svgElement,
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleMouseDown(mockEvent);
      });

      expect(result.current.isDragging).toBe(true);
    });

    it('should start dragging when clicking on rect element', () => {
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1 }));

      const rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const mockEvent = {
        target: rectElement,
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleMouseDown(mockEvent);
      });

      expect(result.current.isDragging).toBe(true);
    });

    it('should not start dragging when clicking on other elements', () => {
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1 }));

      const divElement = document.createElement('div');
      const mockEvent = {
        target: divElement,
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleMouseDown(mockEvent);
      });

      expect(result.current.isDragging).toBe(false);
    });
  });

  describe('handleMouseMove', () => {
    it('should update pan when dragging', () => {
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1 }));

      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const mouseDownEvent = {
        target: svgElement,
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleMouseDown(mouseDownEvent);
      });

      const mouseMoveEvent = {
        clientX: 150,
        clientY: 120,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleMouseMove(mouseMoveEvent);
      });

      expect(result.current.pan).toEqual({ x: 50, y: 20 });
    });

    it('should not update pan when not dragging', () => {
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1 }));

      const mouseMoveEvent = {
        clientX: 150,
        clientY: 120,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleMouseMove(mouseMoveEvent);
      });

      expect(result.current.pan).toEqual({ x: 0, y: 0 });
    });
  });

  describe('handleMouseUp', () => {
    it('should stop dragging', () => {
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1 }));

      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const mouseDownEvent = {
        target: svgElement,
        clientX: 100,
        clientY: 100,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleMouseDown(mouseDownEvent);
      });

      expect(result.current.isDragging).toBe(true);

      act(() => {
        result.current.handleMouseUp();
      });

      expect(result.current.isDragging).toBe(false);
    });
  });

  describe('handleWheel', () => {
    it('should increase zoom when scrolling up', () => {
      const onZoomChange = vi.fn();
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1, onZoomChange }));

      const wheelEvent = {
        deltaY: -100,
        preventDefault: vi.fn(),
      } as unknown as React.WheelEvent;

      act(() => {
        result.current.handleWheel(wheelEvent);
      });

      expect(onZoomChange).toHaveBeenCalledWith(1.1);
    });

    it('should decrease zoom when scrolling down', () => {
      const onZoomChange = vi.fn();
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1, onZoomChange }));

      const wheelEvent = {
        deltaY: 100,
        preventDefault: vi.fn(),
      } as unknown as React.WheelEvent;

      act(() => {
        result.current.handleWheel(wheelEvent);
      });

      expect(onZoomChange).toHaveBeenCalledWith(0.9);
    });

    it('should clamp zoom to max 2', () => {
      const onZoomChange = vi.fn();
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1.95, onZoomChange }));

      const wheelEvent = {
        deltaY: -100,
        preventDefault: vi.fn(),
      } as unknown as React.WheelEvent;

      act(() => {
        result.current.handleWheel(wheelEvent);
      });

      expect(onZoomChange).toHaveBeenCalledWith(2);
    });

    it('should clamp zoom to min 0.2', () => {
      const onZoomChange = vi.fn();
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 0.25, onZoomChange }));

      const wheelEvent = {
        deltaY: 100,
        preventDefault: vi.fn(),
      } as unknown as React.WheelEvent;

      act(() => {
        result.current.handleWheel(wheelEvent);
      });

      expect(onZoomChange).toHaveBeenCalledWith(0.2);
    });

    it('should prevent default', () => {
      const onZoomChange = vi.fn();
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1, onZoomChange }));

      const preventDefault = vi.fn();
      const wheelEvent = {
        deltaY: 100,
        preventDefault,
      } as unknown as React.WheelEvent;

      act(() => {
        result.current.handleWheel(wheelEvent);
      });

      expect(preventDefault).toHaveBeenCalled();
    });

    it('should not call onZoomChange if not provided', () => {
      const { result } = renderHook(() => useGraphPanZoom({ zoom: 1 }));

      const wheelEvent = {
        deltaY: -100,
        preventDefault: vi.fn(),
      } as unknown as React.WheelEvent;

      // Should not throw
      act(() => {
        result.current.handleWheel(wheelEvent);
      });
    });
  });
});
