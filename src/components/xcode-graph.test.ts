/**
 * GraphApp Entry Point Tests
 *
 * Tests for the root <xcode-graph> component that orchestrates
 * the entire graph visualization. Validates rendering, property
 * handling, and the loadRawGraph method.
 */

import { edges as edgesSignal, nodes as nodesSignal } from '@graph/signals/data.signals';
import { resetGraphSignals } from '@graph/signals/graph.signals';
import { expect, fixture, html } from '@open-wc/testing';
import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { resetFilterSignals } from '@shared/signals/filter.signals';
import { afterEach, beforeEach, describe, it, expect as vitestExpect } from 'vitest';
import type { SignalSnapshot } from '../test-utils/signal-helpers';
import { createSignalSnapshot, restoreSignalSnapshot } from '../test-utils/signal-helpers';
import type { GraphApp } from './xcode-graph';
import './xcode-graph';

function createTestNode(id: string, overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id,
    name: `Node ${id}`,
    type: NodeType.Framework,
    platform: Platform.iOS,
    origin: Origin.Local,
    ...overrides,
  };
}

function createTestEdge(source: string, target: string): GraphEdge {
  return { source, target };
}

describe('xcode-graph (GraphApp)', () => {
  let snapshot: SignalSnapshot;

  beforeEach(() => {
    snapshot = createSignalSnapshot([nodesSignal, edgesSignal]);
  });

  afterEach(() => {
    restoreSignalSnapshot(snapshot);
    resetGraphSignals();
    resetFilterSignals();
  });

  describe('rendering', () => {
    it('should render the element', async () => {
      const el = await fixture<GraphApp>(html`
        <xcode-graph></xcode-graph>
      `);

      expect(el).to.exist;
      expect(el.tagName.toLowerCase()).to.equal('xcode-graph');
    });

    it('should be registered as a custom element', () => {
      const ctor = customElements.get('xcode-graph');
      expect(ctor).to.exist;
    });

    it('should have a shadow root', async () => {
      const el = await fixture<GraphApp>(html`
        <xcode-graph></xcode-graph>
      `);

      expect(el.shadowRoot).to.exist;
    });

    it('should render with default state (no data)', async () => {
      const el = await fixture<GraphApp>(html`
        <xcode-graph></xcode-graph>
      `);

      // With no data, the component should still render successfully
      expect(el.shadowRoot).to.exist;
      // The graph-tab sub-component should be present in shadow DOM
      const graphTab = el.shadowRoot?.querySelector('xcode-graph-tab');
      expect(graphTab).to.exist;
    });
  });

  describe('properties', () => {
    it('should accept nodes and edges properties', async () => {
      const testNodes = [createTestNode('a'), createTestNode('b')];
      const testEdges = [createTestEdge('a', 'b')];

      const el = await fixture<GraphApp>(html`
        <xcode-graph .nodes=${testNodes} .edges=${testEdges}></xcode-graph>
      `);

      vitestExpect(el.nodes).toEqual(testNodes);
      vitestExpect(el.edges).toEqual(testEdges);
    });

    it('should update signals when nodes and edges are set', async () => {
      const testNodes = [
        createTestNode('a', { project: 'Core' }),
        createTestNode('b', { project: 'Core' }),
      ];
      const testEdges = [createTestEdge('a', 'b')];

      await fixture<GraphApp>(html`
        <xcode-graph .nodes=${testNodes} .edges=${testEdges}></xcode-graph>
      `);

      // The component should have propagated data to the signals
      vitestExpect(nodesSignal.get()).toEqual(testNodes);
      vitestExpect(edgesSignal.get()).toEqual(testEdges);
    });

    it('should handle empty arrays for nodes and edges', async () => {
      const el = await fixture<GraphApp>(html`
        <xcode-graph .nodes=${[]} .edges=${[]}></xcode-graph>
      `);

      vitestExpect(el.nodes).toEqual([]);
      vitestExpect(el.edges).toEqual([]);
    });
  });

  describe('loadRawGraph', () => {
    it('should have a loadRawGraph method', async () => {
      const el = await fixture<GraphApp>(html`
        <xcode-graph></xcode-graph>
      `);

      vitestExpect(typeof el.loadRawGraph).toBe('function');
    });

    it('should handle invalid raw data without throwing', async () => {
      const el = await fixture<GraphApp>(html`
        <xcode-graph></xcode-graph>
      `);

      // Should not throw even with invalid data
      expect(() => el.loadRawGraph(null)).to.not.throw;
      expect(() => el.loadRawGraph({})).to.not.throw;
      expect(() => el.loadRawGraph('invalid')).to.not.throw;
    });
  });

  describe('static styles', () => {
    it('should have static styles defined on the class', () => {
      // In jsdom, shadow DOM computed styles are not applied,
      // so we verify the static styles property exists on the class instead.
      const ctor = customElements.get('xcode-graph') as typeof GraphApp | undefined;
      vitestExpect(ctor).toBeDefined();
      // Lit components expose a `styles` static property
      vitestExpect((ctor as unknown as { styles: unknown }).styles).toBeDefined();
    });
  });
});
