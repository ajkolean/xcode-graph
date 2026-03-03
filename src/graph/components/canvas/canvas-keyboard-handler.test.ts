import { NodeType, Origin, Platform } from '@shared/schemas';
import type { GraphNode } from '@shared/schemas/graph.types';
import { describe, expect, it, vi } from 'vitest';
import type { InteractionState } from './canvas-interaction-handler';
import { handleKeyDown, type KeyboardContext } from './canvas-keyboard-handler';

function createState(overrides?: Partial<InteractionState>): InteractionState {
  return {
    pan: { x: 100, y: 200 },
    zoom: 1,
    isDragging: false,
    draggedNodeId: null,
    draggedClusterId: null,
    lastMousePos: { x: 0, y: 0 },
    clickedEmptySpace: false,
    hasMoved: false,
    hoveredNode: null,
    hoveredCluster: null,
    ...overrides,
  };
}

function createNode(id: string): GraphNode {
  return {
    id,
    name: `Node-${id}`,
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Internal,
    project: 'TestProject',
    deploymentTargets: {},
    buildSettings: {},
  };
}

function createContext(overrides?: Partial<KeyboardContext>): KeyboardContext {
  return {
    state: createState(),
    nodes: [],
    selectedNode: null,
    dispatchCanvasEvent: vi.fn(),
    dispatchEvent: vi.fn(() => true),
    ...overrides,
  };
}

function keyEvent(key: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, cancelable: true });
}

describe('canvas-keyboard-handler', () => {
  describe('arrow key panning', () => {
    it('pans up on ArrowUp and returns true', () => {
      const ctx = createContext();
      const result = handleKeyDown(keyEvent('ArrowUp'), ctx);
      expect(result).toBe(true);
      expect(ctx.state.pan.y).toBe(250);
    });

    it('pans down on ArrowDown and returns true', () => {
      const ctx = createContext();
      const result = handleKeyDown(keyEvent('ArrowDown'), ctx);
      expect(result).toBe(true);
      expect(ctx.state.pan.y).toBe(150);
    });

    it('pans left on ArrowLeft and returns true', () => {
      const ctx = createContext();
      const result = handleKeyDown(keyEvent('ArrowLeft'), ctx);
      expect(result).toBe(true);
      expect(ctx.state.pan.x).toBe(150);
    });

    it('pans right on ArrowRight and returns true', () => {
      const ctx = createContext();
      const result = handleKeyDown(keyEvent('ArrowRight'), ctx);
      expect(result).toBe(true);
      expect(ctx.state.pan.x).toBe(50);
    });
  });

  describe('zoom shortcuts', () => {
    it('dispatches zoom-in on + key', () => {
      const ctx = createContext();
      const result = handleKeyDown(keyEvent('+'), ctx);
      expect(result).toBe(false);
      expect(ctx.dispatchEvent).toHaveBeenCalledOnce();
      const event = (ctx.dispatchEvent as ReturnType<typeof vi.fn>).mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe('zoom-in');
    });

    it('dispatches zoom-in on = key', () => {
      const ctx = createContext();
      handleKeyDown(keyEvent('='), ctx);
      const event = (ctx.dispatchEvent as ReturnType<typeof vi.fn>).mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe('zoom-in');
    });

    it('dispatches zoom-out on - key', () => {
      const ctx = createContext();
      handleKeyDown(keyEvent('-'), ctx);
      const event = (ctx.dispatchEvent as ReturnType<typeof vi.fn>).mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe('zoom-out');
    });

    it('dispatches zoom-reset on 0 key', () => {
      const ctx = createContext();
      handleKeyDown(keyEvent('0'), ctx);
      const event = (ctx.dispatchEvent as ReturnType<typeof vi.fn>).mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe('zoom-reset');
    });
  });

  describe('node selection via Enter/Space', () => {
    it('selects hovered node on Enter', () => {
      const node = createNode('n1');
      const ctx = createContext({
        state: createState({ hoveredNode: 'n1' }),
        nodes: [node],
      });

      handleKeyDown(keyEvent('Enter'), ctx);

      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('node-select', { node });
    });

    it('selects hovered node on Space', () => {
      const node = createNode('n1');
      const ctx = createContext({
        state: createState({ hoveredNode: 'n1' }),
        nodes: [node],
      });

      handleKeyDown(keyEvent(' '), ctx);

      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('node-select', { node });
    });

    it('deselects node if it is already selected', () => {
      const node = createNode('n1');
      const ctx = createContext({
        state: createState({ hoveredNode: 'n1' }),
        nodes: [node],
        selectedNode: node,
      });

      handleKeyDown(keyEvent('Enter'), ctx);

      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('node-select', { node: null });
    });

    it('does nothing when no node is hovered', () => {
      const ctx = createContext();
      handleKeyDown(keyEvent('Enter'), ctx);
      expect(ctx.dispatchCanvasEvent).not.toHaveBeenCalled();
    });

    it('does nothing when hovered node ID does not match any node', () => {
      const ctx = createContext({
        state: createState({ hoveredNode: 'nonexistent' }),
        nodes: [createNode('n1')],
      });
      handleKeyDown(keyEvent('Enter'), ctx);
      expect(ctx.dispatchCanvasEvent).not.toHaveBeenCalled();
    });
  });

  describe('Escape deselection', () => {
    it('deselects both node and cluster on Escape', () => {
      const ctx = createContext();
      handleKeyDown(keyEvent('Escape'), ctx);
      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('node-select', { node: null });
      expect(ctx.dispatchCanvasEvent).toHaveBeenCalledWith('cluster-select', { clusterId: null });
    });
  });

  describe('unrecognized keys', () => {
    it('returns false for unrecognized keys', () => {
      const ctx = createContext();
      const result = handleKeyDown(keyEvent('a'), ctx);
      expect(result).toBe(false);
      expect(ctx.dispatchCanvasEvent).not.toHaveBeenCalled();
      expect(ctx.dispatchEvent).not.toHaveBeenCalled();
    });

    it('does not modify pan for unrecognized keys', () => {
      const ctx = createContext();
      handleKeyDown(keyEvent('z'), ctx);
      expect(ctx.state.pan).toEqual({ x: 100, y: 200 });
    });
  });
});
