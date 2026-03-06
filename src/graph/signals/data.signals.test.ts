/**
 * Data Signals Tests
 *
 * Tests for the data source signals (nodes, edges) and their reset function.
 */

import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SignalSnapshot } from '@/test-utils/signal-helpers';
import { createSignalSnapshot, restoreSignalSnapshot } from '@/test-utils/signal-helpers';
import { edges, nodes, resetDataSignals } from './data.signals';

describe('data.signals', () => {
  let snapshot: SignalSnapshot;

  beforeEach(() => {
    snapshot = createSignalSnapshot([nodes, edges]);
  });

  afterEach(() => {
    restoreSignalSnapshot(snapshot);
  });

  describe('resetDataSignals', () => {
    it('should reset nodes and edges to empty arrays', () => {
      const testNodes: GraphNode[] = [
        {
          id: 'a',
          name: 'Node A',
          type: NodeType.Framework,
          platform: Platform.iOS,
          origin: Origin.Local,
        },
      ];
      const testEdges: GraphEdge[] = [{ source: 'a', target: 'b' }];

      nodes.set(testNodes);
      edges.set(testEdges);

      expect(nodes.get()).toHaveLength(1);
      expect(edges.get()).toHaveLength(1);

      resetDataSignals();

      expect(nodes.get()).toHaveLength(0);
      expect(edges.get()).toHaveLength(0);
    });

    it('should be safe to call when already empty', () => {
      resetDataSignals();

      expect(nodes.get()).toHaveLength(0);
      expect(edges.get()).toHaveLength(0);
    });
  });
});
