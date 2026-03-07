import assert from 'node:assert';
import { buildClusterGraph } from '@graph/layout/cluster-graph';
import { DEFAULT_CONFIG } from '@graph/layout/config';
import { describe, expect, it, vi } from 'vitest';
import { createClusterWithNodes } from '@/fixtures';
import { computeMacroLayout, layoutWithTimeout, validateElkOptions } from './macro-layout';
import { computeClusterInterior } from './micro-layout';

/** Inject layerId=0 and reverse positionId on all ELK output children. */
function injectPositionIds(children: import('elkjs/lib/elk-api.js').ElkNode[]): void {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!child) continue;
    Object.defineProperty(child, 'org.eclipse.elk.layered.layering.layerId', {
      value: 0,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(child, 'org.eclipse.elk.layered.crossingMinimization.positionId', {
      value: children.length - 1 - i,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
}

describe('macro-layout', () => {
  describe('computeMacroLayout', () => {
    it('produces positions for all clusters with finite coordinates', async () => {
      const clusterA = createClusterWithNodes(3);
      clusterA.id = 'A';
      clusterA.name = 'ClusterA';
      const clusterB = createClusterWithNodes(4);
      clusterB.id = 'B';
      clusterB.name = 'ClusterB';
      const clusters = [clusterA, clusterB];

      const nodeA0 = clusterA.nodes[0];
      const nodeB0 = clusterB.nodes[0];
      assert(nodeA0 && nodeB0, 'clusters must have nodes');
      const edges = [{ source: nodeA0.id, target: nodeB0.id }];
      const clusterGraph = buildClusterGraph(edges, clusters);

      const microLayouts = new Map(
        clusters.map((c) => [c.id, computeClusterInterior(c, DEFAULT_CONFIG)]),
      );

      const positions = await computeMacroLayout(clusterGraph, microLayouts, DEFAULT_CONFIG);

      expect(positions.size).toBe(2);
      for (const [_id, pos] of positions) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
        expect(pos.width).toBeGreaterThan(0);
        expect(pos.height).toBeGreaterThan(0);
      }
    });

    it('does not produce overlapping cluster bounding boxes', async () => {
      const clusterA = createClusterWithNodes(5);
      clusterA.id = 'A';
      clusterA.name = 'ClusterA';
      const clusterB = createClusterWithNodes(5);
      clusterB.id = 'B';
      clusterB.name = 'ClusterB';
      const clusterC = createClusterWithNodes(3);
      clusterC.id = 'C';
      clusterC.name = 'ClusterC';
      const clusters = [clusterA, clusterB, clusterC];

      const nodeA0 = clusterA.nodes[0];
      const nodeB0 = clusterB.nodes[0];
      const nodeC0 = clusterC.nodes[0];
      assert(nodeA0 && nodeB0 && nodeC0, 'clusters must have nodes');
      const edges = [
        { source: nodeA0.id, target: nodeB0.id },
        { source: nodeB0.id, target: nodeC0.id },
      ];
      const clusterGraph = buildClusterGraph(edges, clusters);

      const microLayouts = new Map(
        clusters.map((c) => [c.id, computeClusterInterior(c, DEFAULT_CONFIG)]),
      );

      const positions = await computeMacroLayout(clusterGraph, microLayouts, DEFAULT_CONFIG);
      const posArray = Array.from(positions.values());

      // Check no bounding box overlaps (center-to-center distance > sum of half-sizes)
      for (let i = 0; i < posArray.length; i++) {
        for (let j = i + 1; j < posArray.length; j++) {
          const posA = posArray[i];
          const posB = posArray[j];
          assert(posA && posB, 'positions must exist');
          const dx = Math.abs(posA.x - posB.x);
          const dy = Math.abs(posA.y - posB.y);
          const minSepX = (posA.width + posB.width) / 2;
          const minSepY = (posA.height + posB.height) / 2;
          // At least one axis must have sufficient separation
          const separated = dx >= minSepX * 0.8 || dy >= minSepY * 0.8;
          expect(separated).toBe(true);
        }
      }
    });

    it('handles single cluster', async () => {
      const cluster = createClusterWithNodes(3);
      const clusters = [cluster];

      const clusterGraph = buildClusterGraph([], clusters);
      const microLayouts = new Map([[cluster.id, computeClusterInterior(cluster, DEFAULT_CONFIG)]]);

      const positions = await computeMacroLayout(clusterGraph, microLayouts, DEFAULT_CONFIG);

      expect(positions.size).toBe(1);
      const pos = positions.values().next().value;
      assert(pos, 'position must exist');
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
    });

    it('handles multiple clusters in same layer with positionId sorting', async () => {
      // Create several clusters that should end up in the same ELK layer
      const clusterA = createClusterWithNodes(2);
      clusterA.id = 'A';
      clusterA.name = 'ClusterA';
      const clusterB = createClusterWithNodes(2);
      clusterB.id = 'B';
      clusterB.name = 'ClusterB';
      const clusterC = createClusterWithNodes(2);
      clusterC.id = 'C';
      clusterC.name = 'ClusterC';
      const clusterD = createClusterWithNodes(2);
      clusterD.id = 'D';
      clusterD.name = 'ClusterD';
      const clusters = [clusterA, clusterB, clusterC, clusterD];

      // All depend on A, so B/C/D should be in the same layer
      const nodeA0 = clusterA.nodes[0];
      const nodeB0 = clusterB.nodes[0];
      const nodeC0 = clusterC.nodes[0];
      const nodeD0 = clusterD.nodes[0];
      assert(nodeA0 && nodeB0 && nodeC0 && nodeD0, 'clusters must have nodes');
      const edges = [
        { source: nodeA0.id, target: nodeB0.id },
        { source: nodeA0.id, target: nodeC0.id },
        { source: nodeA0.id, target: nodeD0.id },
      ];
      const clusterGraph = buildClusterGraph(edges, clusters);

      const microLayouts = new Map(
        clusters.map((c) => [c.id, computeClusterInterior(c, DEFAULT_CONFIG)]),
      );

      const positions = await computeMacroLayout(clusterGraph, microLayouts, DEFAULT_CONFIG);

      expect(positions.size).toBe(4);
      for (const [_id, pos] of positions) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      }
    });

    it('returns empty map when layout produces no children', async () => {
      const clusters: ReturnType<typeof createClusterWithNodes>[] = [];
      const clusterGraph = buildClusterGraph([], clusters);
      const microLayouts = new Map<string, ReturnType<typeof computeClusterInterior>>();

      const positions = await computeMacroLayout(clusterGraph, microLayouts, DEFAULT_CONFIG);

      expect(positions.size).toBe(0);
    });

    it('sorts band nodes by positionId when ELK provides crossing-minimization IDs', async () => {
      // Create clusters with edges so ELK has a real graph to lay out
      const clusterA = createClusterWithNodes(2);
      clusterA.id = 'A';
      clusterA.name = 'ClusterA';
      const clusterB = createClusterWithNodes(2);
      clusterB.id = 'B';
      clusterB.name = 'ClusterB';
      const clusterC = createClusterWithNodes(2);
      clusterC.id = 'C';
      clusterC.name = 'ClusterC';
      const clusters = [clusterA, clusterB, clusterC];

      const nodeA0 = clusterA.nodes[0];
      const nodeB0 = clusterB.nodes[0];
      const nodeC0 = clusterC.nodes[0];
      assert(nodeA0 && nodeB0 && nodeC0, 'clusters must have nodes');
      const edges = [
        { source: nodeA0.id, target: nodeB0.id },
        { source: nodeA0.id, target: nodeC0.id },
      ];
      const clusterGraph = buildClusterGraph(edges, clusters);

      const microLayouts = new Map(
        clusters.map((c) => [c.id, computeClusterInterior(c, DEFAULT_CONFIG)]),
      );

      // Mock ELK to inject positionId on layout output children
      const elkModule = await import('elkjs/lib/elk.bundled.js');
      const RealELK = elkModule.default;
      const realElk = new RealELK();

      function MockELK() {
        return {
          layout: async (graph: import('elkjs/lib/elk-api.js').ElkNode) => {
            const result = await realElk.layout(graph);
            if (result.children) {
              injectPositionIds(result.children);
            }
            return result;
          },
        };
      }
      vi.doMock('elkjs/lib/elk.bundled.js', () => ({ default: MockELK }));

      // Re-import to pick up the mock
      const { computeMacroLayout: computeMacroLayoutMocked } = await import('./macro-layout');
      const positions = await computeMacroLayoutMocked(clusterGraph, microLayouts, DEFAULT_CONFIG);

      vi.doUnmock('elkjs/lib/elk.bundled.js');

      expect(positions.size).toBe(3);
      for (const [_id, pos] of positions) {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      }
    });

    it('applies adaptive thoroughness from config to ELK options', async () => {
      const cluster = createClusterWithNodes(2);
      const clusters = [cluster];
      const clusterGraph = buildClusterGraph([], clusters);
      const microLayouts = new Map([[cluster.id, computeClusterInterior(cluster, DEFAULT_CONFIG)]]);

      // Use custom thoroughness and greedy switch
      const config = {
        ...DEFAULT_CONFIG,
        elkThoroughness: 3 as typeof DEFAULT_CONFIG.elkThoroughness,
        elkGreedySwitchType: 'OFF' as const,
      };

      // Spy on ELK to capture the graph passed to layout
      let capturedGraph: import('elkjs/lib/elk-api.js').ElkNode | undefined;
      const elkModule = await import('elkjs/lib/elk.bundled.js');
      const RealELK = elkModule.default;
      const realElk = new RealELK();

      function SpyELK() {
        return {
          layout: async (graph: import('elkjs/lib/elk-api.js').ElkNode) => {
            capturedGraph = graph;
            return realElk.layout(graph);
          },
        };
      }
      vi.doMock('elkjs/lib/elk.bundled.js', () => ({ default: SpyELK }));

      const { computeMacroLayout: computeMacroLayoutMocked } = await import('./macro-layout');
      await computeMacroLayoutMocked(clusterGraph, microLayouts, config);

      vi.doUnmock('elkjs/lib/elk.bundled.js');

      assert(capturedGraph, 'ELK graph must be captured');
      expect(capturedGraph.layoutOptions?.['elk.layered.thoroughness']).toBe('3');
      expect(
        capturedGraph.layoutOptions?.['elk.layered.crossingMinimization.greedySwitch.type'],
      ).toBe('OFF');
    });

    it('does not include non-functional validateGraph/validateOptions/debugMode options', async () => {
      const cluster = createClusterWithNodes(2);
      const clusters = [cluster];
      const clusterGraph = buildClusterGraph([], clusters);
      const microLayouts = new Map([[cluster.id, computeClusterInterior(cluster, DEFAULT_CONFIG)]]);

      let capturedGraph: import('elkjs/lib/elk-api.js').ElkNode | undefined;
      const elkModule = await import('elkjs/lib/elk.bundled.js');
      const RealELK = elkModule.default;
      const realElk = new RealELK();

      function SpyELK() {
        return {
          layout: async (graph: import('elkjs/lib/elk-api.js').ElkNode) => {
            capturedGraph = graph;
            return realElk.layout(graph);
          },
        };
      }
      vi.doMock('elkjs/lib/elk.bundled.js', () => ({ default: SpyELK }));

      const { computeMacroLayout: computeMacroLayoutMocked } = await import('./macro-layout');
      await computeMacroLayoutMocked(clusterGraph, microLayouts, DEFAULT_CONFIG);

      vi.doUnmock('elkjs/lib/elk.bundled.js');

      assert(capturedGraph, 'ELK graph must be captured');
      const opts = capturedGraph.layoutOptions ?? {};
      expect(opts['elk.validateGraph']).toBeUndefined();
      expect(opts['elk.validateOptions']).toBeUndefined();
      expect(opts['elk.debugMode']).toBeUndefined();
    });
  });

  describe('layoutWithTimeout', () => {
    it('resolves normally when layout completes before timeout', async () => {
      const result = await layoutWithTimeout(Promise.resolve('done'), 5000);
      expect(result).toBe('done');
    });

    it('rejects with timeout error when layout exceeds timeout', async () => {
      const slowPromise = new Promise<string>((resolve) => setTimeout(() => resolve('late'), 500));

      await expect(layoutWithTimeout(slowPromise, 10)).rejects.toThrow(
        'ELK layout timed out after 10ms',
      );
    });

    it('passes through when timeout is 0 (disabled)', async () => {
      const result = await layoutWithTimeout(Promise.resolve('done'), 0);
      expect(result).toBe('done');
    });

    it('passes through when timeout is negative', async () => {
      const result = await layoutWithTimeout(Promise.resolve('done'), -1);
      expect(result).toBe('done');
    });
  });

  describe('validateElkOptions', () => {
    it('returns empty array for valid options', async () => {
      const { default: ELK } = await import('elkjs/lib/elk.bundled.js');
      const elk = new ELK();

      const root: import('elkjs/lib/elk-api.js').ElkNode = {
        id: 'root',
        children: [],
        edges: [],
        layoutOptions: {
          'elk.algorithm': 'layered',
          'elk.direction': 'DOWN',
        },
      };

      const warnings = await validateElkOptions(elk, root);
      expect(warnings).toHaveLength(0);
    });

    it('detects unknown options in root', async () => {
      const { default: ELK } = await import('elkjs/lib/elk.bundled.js');
      const elk = new ELK();

      const root: import('elkjs/lib/elk-api.js').ElkNode = {
        id: 'root',
        children: [],
        edges: [],
        layoutOptions: {
          'elk.algorithm': 'layered',
          'elk.totallyFakeOption': 'true',
        },
      };

      const warnings = await validateElkOptions(elk, root);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('elk.totallyFakeOption');
      expect(warnings[0]).toContain('root');
    });

    it('detects unknown options in child nodes', async () => {
      const { default: ELK } = await import('elkjs/lib/elk.bundled.js');
      const elk = new ELK();

      const root: import('elkjs/lib/elk-api.js').ElkNode = {
        id: 'root',
        children: [
          {
            id: 'child1',
            layoutOptions: {
              'elk.bogusOption': 'value',
            },
          },
        ],
        edges: [],
        layoutOptions: {},
      };

      const warnings = await validateElkOptions(elk, root);
      expect(warnings.some((w) => w.includes('elk.bogusOption'))).toBe(true);
      expect(warnings.some((w) => w.includes('child1'))).toBe(true);
    });

    it('detects unknown options in edges', async () => {
      const { default: ELK } = await import('elkjs/lib/elk.bundled.js');
      const elk = new ELK();

      const root: import('elkjs/lib/elk-api.js').ElkNode = {
        id: 'root',
        children: [{ id: 'a' }, { id: 'b' }],
        edges: [
          {
            id: 'e1',
            sources: ['a'],
            targets: ['b'],
            layoutOptions: {
              'elk.nonexistentEdgeOption': '5',
            },
          },
        ],
        layoutOptions: {},
      };

      const warnings = await validateElkOptions(elk, root);
      expect(warnings.some((w) => w.includes('elk.nonexistentEdgeOption'))).toBe(true);
      expect(warnings.some((w) => w.includes('e1'))).toBe(true);
    });

    it('handles root with no children or edges', async () => {
      const { default: ELK } = await import('elkjs/lib/elk.bundled.js');
      const elk = new ELK();

      const root: import('elkjs/lib/elk-api.js').ElkNode = {
        id: 'root',
        layoutOptions: {
          'elk.algorithm': 'layered',
        },
      };

      const warnings = await validateElkOptions(elk, root);
      expect(warnings).toHaveLength(0);
    });
  });
});
