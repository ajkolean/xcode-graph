/**
 * Tests for GraphInteractionFullController
 * Ensures pan, zoom, and drag interactions work correctly
 */

import { aTimeout } from '@open-wc/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClusterPosition, NodePosition } from '@/shared/schemas';
import { MockHost } from '@/test-utils';
import { GraphInteractionFullController } from './graph-interaction-full.controller';

describe('GraphInteractionFullController', () => {
  let host: MockHost;
  let controller: GraphInteractionFullController;
  let mockSvgElement: SVGSVGElement;

  beforeEach(() => {
    host = new MockHost();

    const nodePositions = new Map<string, NodePosition>([
      ['n1', { id: 'n1', x: 100, y: 100, vx: 0, vy: 0, clusterId: 'c1', radius: 10 }],
      ['n2', { id: 'n2', x: 200, y: 200, vx: 0, vy: 0, clusterId: 'c1', radius: 10 }],
    ]);

    const clusterPositions = new Map<string, ClusterPosition>([
      ['c1', { id: 'c1', x: 0, y: 0, vx: 0, vy: 0, width: 400, height: 400, nodeCount: 2 }],
    ]);

    controller = new GraphInteractionFullController(host, {
      zoom: 1,
      finalNodePositions: nodePositions,
      clusterPositions,
    });

    // Create mock SVG element
    mockSvgElement = {
      getBoundingClientRect: vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
      }),
      tagName: 'svg',
    } as unknown as SVGSVGElement;

    controller.setSvgElement(mockSvgElement);
  });

  describe('Initialization', () => {
    it('should create controller with config', () => {
      expect(controller).toBeDefined();
      expect(controller.zoom).toBe(1);
    });

    it('should register with host', () => {
      const newHost = new MockHost();
      const newController = new GraphInteractionFullController(newHost, {
        zoom: 1,
        finalNodePositions: new Map(),
        clusterPositions: new Map(),
      });
      expect(newHost.getControllers()).toContain(newController);
    });

    it('should initialize with default pan position', () => {
      expect(controller.pan.x).toBe(400);
      expect(controller.pan.y).toBe(300);
    });

    it('should start with no drag state', () => {
      expect(controller.isDragging).toBe(false);
      expect(controller.draggedNode).toBeNull();
      expect(controller.hasMoved).toBe(false);
    });

    it('should track SVG element', () => {
      expect(controller.hasSvgElement()).toBe(true);
    });
  });

  describe('Configuration Updates', () => {
    it('should update zoom', () => {
      controller.updateConfig({ zoom: 2 });
      expect(controller.zoom).toBe(2);
    });

    it('should update node positions', () => {
      const newPositions = new Map<string, NodePosition>([
        ['n3', { id: 'n3', x: 300, y: 300, vx: 0, vy: 0, clusterId: 'c1', radius: 10 }],
      ]);

      controller.updateConfig({ finalNodePositions: newPositions });
      expect(controller.finalNodePositions).toBe(newPositions);
    });

    it('should update cluster positions', () => {
      const newPositions = new Map<string, ClusterPosition>([
        ['c2', { id: 'c2', x: 100, y: 100, vx: 0, vy: 0, width: 200, height: 200, nodeCount: 0 }],
      ]);

      controller.updateConfig({ clusterPositions: newPositions });
      expect(controller.clusterPositions).toBe(newPositions);
    });

    it('should update multiple properties at once', () => {
      controller.updateConfig({
        zoom: 1.5,
        finalNodePositions: new Map(),
      });

      expect(controller.zoom).toBe(1.5);
      expect(controller.finalNodePositions.size).toBe(0);
    });
  });

  describe('Canvas Panning', () => {
    it('should start pan on SVG mousedown', () => {
      const event = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });
      Object.defineProperty(event, 'target', {
        value: mockSvgElement,
        writable: false,
      });

      controller.handleMouseDown(event);

      expect(controller.isDragging).toBe(true);
      expect(controller.hasMoved).toBe(false);
    });

    it('should not start pan on non-SVG mousedown', () => {
      const event = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });
      Object.defineProperty(event, 'target', {
        value: document.createElement('div'),
        writable: false,
      });

      controller.handleMouseDown(event);

      expect(controller.isDragging).toBe(false);
    });

    it('should pan canvas on mousemove', () => {
      // Start drag
      const downEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });
      Object.defineProperty(downEvent, 'target', {
        value: mockSvgElement,
        writable: false,
      });
      controller.handleMouseDown(downEvent);

      const initialPanX = controller.pan.x;
      const initialPanY = controller.pan.y;

      // Move mouse
      const moveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
      });
      controller.handleMouseMove(moveEvent);

      expect(controller.pan.x).not.toBe(initialPanX);
      expect(controller.pan.y).not.toBe(initialPanY);
      expect(controller.hasMoved).toBe(true);
    });

    it('should stop pan on mouseup', () => {
      // Start drag
      const downEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });
      Object.defineProperty(downEvent, 'target', {
        value: mockSvgElement,
        writable: false,
      });
      controller.handleMouseDown(downEvent);

      // Move
      const moveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
      });
      controller.handleMouseMove(moveEvent);

      // Release
      controller.handleMouseUp();

      expect(controller.isDragging).toBe(false);
    });

    it('should request host update during pan', () => {
      const initialUpdateCount = host.updateCount;

      const downEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });
      Object.defineProperty(downEvent, 'target', {
        value: mockSvgElement,
        writable: false,
      });
      controller.handleMouseDown(downEvent);

      const moveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
      });
      controller.handleMouseMove(moveEvent);

      expect(host.updateCount).toBeGreaterThan(initialUpdateCount);
    });
  });

  describe('Node Dragging', () => {
    it('should start node drag', () => {
      const event = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });

      controller.handleNodeMouseDown('n1', event);

      expect(controller.draggedNode).toBe('n1');
      expect(controller.hasMoved).toBe(false);
    });

    it('should update node position during drag', () => {
      // Start node drag
      const downEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });
      controller.handleNodeMouseDown('n1', downEvent);

      // Move mouse
      const moveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
      });
      controller.handleMouseMove(moveEvent);

      expect(controller.manualNodePositions.has('n1')).toBe(true);
      expect(controller.hasMoved).toBe(true);
    });

    it('should stop propagation on node mousedown', () => {
      const event = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      controller.handleNodeMouseDown('n1', event);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should clear dragged node on mouseup', () => {
      const downEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });
      controller.handleNodeMouseDown('n1', downEvent);

      expect(controller.draggedNode).toBe('n1');

      controller.handleMouseUp();

      expect(controller.draggedNode).toBeNull();
    });

    it('should transform coordinates relative to cluster', () => {
      controller.handleNodeMouseDown('n1', new MouseEvent('mousedown'));

      const moveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
      });
      controller.handleMouseMove(moveEvent);

      const manualPos = controller.manualNodePositions.get('n1');
      expect(manualPos).toBeDefined();
      expect(typeof manualPos?.x).toBe('number');
      expect(typeof manualPos?.y).toBe('number');
    });
  });

  describe('Movement Tracking', () => {
    it('should track movement during pan', () => {
      const downEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });
      Object.defineProperty(downEvent, 'target', {
        value: mockSvgElement,
        writable: false,
      });
      controller.handleMouseDown(downEvent);

      expect(controller.hasMoved).toBe(false);

      const moveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
      });
      controller.handleMouseMove(moveEvent);

      expect(controller.hasMoved).toBe(true);
    });

    it('should reset hasMoved after mouseup', async () => {
      const downEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });
      Object.defineProperty(downEvent, 'target', {
        value: mockSvgElement,
        writable: false,
      });
      controller.handleMouseDown(downEvent);

      const moveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
      });
      controller.handleMouseMove(moveEvent);

      controller.handleMouseUp();

      // Wait for timeout
      await aTimeout(10);

      expect(controller.hasMoved).toBe(false);
    });
  });

  describe('Manual Position Storage', () => {
    it('should store manual node positions', () => {
      controller.handleNodeMouseDown('n1', new MouseEvent('mousedown'));

      const moveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
      });
      controller.handleMouseMove(moveEvent);

      expect(controller.manualNodePositions.has('n1')).toBe(true);
    });

    it('should update existing manual positions', () => {
      // First drag
      controller.handleNodeMouseDown('n1', new MouseEvent('mousedown'));
      controller.handleMouseMove(new MouseEvent('mousemove', { clientX: 150, clientY: 150 }));

      const firstPos = controller.manualNodePositions.get('n1');
      const firstX = firstPos?.x;

      // Second drag
      controller.handleMouseUp();
      controller.handleNodeMouseDown('n1', new MouseEvent('mousedown'));
      controller.handleMouseMove(new MouseEvent('mousemove', { clientX: 200, clientY: 200 }));

      const secondPos = controller.manualNodePositions.get('n1');
      const secondX = secondPos?.x;

      // Positions should be different
      expect(secondX).not.toBe(firstX);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing SVG element gracefully', () => {
      const noSvgController = new GraphInteractionFullController(host, {
        zoom: 1,
        finalNodePositions: new Map(),
        clusterPositions: new Map(),
      });

      expect(() => {
        noSvgController.handleNodeMouseDown('n1', new MouseEvent('mousedown'));
        noSvgController.handleMouseMove(new MouseEvent('mousemove'));
      }).not.toThrow();
    });

    it('should handle missing node gracefully', () => {
      expect(() => {
        controller.handleNodeMouseDown('nonexistent', new MouseEvent('mousedown'));
        controller.handleMouseMove(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
      }).not.toThrow();
    });

    it('should handle missing cluster gracefully', () => {
      // Add node without cluster
      controller.finalNodePositions.set('n3', {
        id: 'n3',
        x: 100,
        y: 100,
        vx: 0,
        vy: 0,
        clusterId: 'nonexistent',
        radius: 10,
      });

      expect(() => {
        controller.handleNodeMouseDown('n3', new MouseEvent('mousedown'));
        controller.handleMouseMove(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
      }).not.toThrow();
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should implement hostConnected', () => {
      expect(() => {
        host.connectedCallback();
      }).not.toThrow();
    });

    it('should cleanup on hostDisconnected', () => {
      // Start drag
      const downEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
      });
      Object.defineProperty(downEvent, 'target', {
        value: mockSvgElement,
        writable: false,
      });
      controller.handleMouseDown(downEvent);

      controller.handleNodeMouseDown('n1', new MouseEvent('mousedown'));

      host.disconnectedCallback();

      expect(controller.isDragging).toBe(false);
      expect(controller.draggedNode).toBeNull();
    });

    it('should handle cleanup errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // skipcq: JS-0321

      expect(() => {
        host.disconnectedCallback();
      }).not.toThrow();

      expect(controller.isDragging).toBe(false);
      expect(controller.draggedNode).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid mousedown events', () => {
      const event1 = new MouseEvent('mousedown', { clientX: 100, clientY: 100 });
      Object.defineProperty(event1, 'target', { value: mockSvgElement, writable: false });

      const event2 = new MouseEvent('mousedown', { clientX: 150, clientY: 150 });
      Object.defineProperty(event2, 'target', { value: mockSvgElement, writable: false });

      controller.handleMouseDown(event1);
      controller.handleMouseDown(event2);

      expect(controller.isDragging).toBe(true);
    });

    it('should handle mousemove without mousedown', () => {
      expect(() => {
        controller.handleMouseMove(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
      }).not.toThrow();
    });

    it('should handle mouseup without mousedown', () => {
      expect(() => {
        controller.handleMouseUp();
      }).not.toThrow();
    });
  });
});
