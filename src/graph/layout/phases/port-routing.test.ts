import assert from 'node:assert';
import type { ClusterPosition, NodePosition } from '@shared/schemas';
import { describe, expect, it } from 'vitest';
import type { ClusterEdge } from '../cluster-graph';
import { DEFAULT_CONFIG, type LayoutConfig } from '../config';
import { computeClusterPorts, computePortSide, computeRoutedEdges } from './port-routing';

describe('port-routing', () => {
  describe('computePortSide', () => {
    it('returns EAST for a target to the right', () => {
      expect(computePortSide(0, 0, 100, 0)).toBe('EAST');
    });

    it('returns WEST for a target to the left', () => {
      expect(computePortSide(0, 0, -100, 0)).toBe('WEST');
    });

    it('returns SOUTH for a target below', () => {
      expect(computePortSide(0, 0, 0, 100)).toBe('SOUTH');
    });

    it('returns NORTH for a target above', () => {
      expect(computePortSide(0, 0, 0, -100)).toBe('NORTH');
    });

    it('returns EAST for a diagonal target in the east quadrant', () => {
      expect(computePortSide(0, 0, 100, 30)).toBe('EAST');
    });

    it('returns SOUTH for a diagonal target in the south quadrant', () => {
      expect(computePortSide(0, 0, 30, 100)).toBe('SOUTH');
    });
  });

  describe('computeClusterPorts', () => {
    function createClusterPos(id: string, x: number, y: number, size = 200): ClusterPosition {
      return { id, x, y, width: size, height: size, nodeCount: 3, vx: 0, vy: 0 };
    }

    it('creates ports for connected clusters', () => {
      const positions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 0, 0)],
        ['B', createClusterPos('B', 500, 0)],
      ]);
      const clusterEdges: ClusterEdge[] = [{ source: 'A', target: 'B', weight: 2, tieStrength: 2 }];

      const ports = computeClusterPorts(positions, clusterEdges, DEFAULT_CONFIG);

      // Both clusters should have ports
      const portsA = ports.get('A') ?? [];
      const portsB = ports.get('B') ?? [];
      expect(portsA.length).toBeGreaterThan(0);
      expect(portsB.length).toBeGreaterThan(0);
    });

    it('respects maxPortsPerSide limit', () => {
      const positions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 0, 0, 400)],
        ['B', createClusterPos('B', 800, 0)],
        ['C', createClusterPos('C', 1600, 0)],
        ['D', createClusterPos('D', 2400, 0)],
      ]);
      // Many edges from A going east
      const clusterEdges: ClusterEdge[] = Array.from({ length: 20 }, (_, i) => ({
        source: 'A',
        target: ['B', 'C', 'D'][i % 3]!,
        weight: 1,
        tieStrength: 1,
      }));

      const config = { ...DEFAULT_CONFIG, maxPortsPerSide: 3 } as unknown as LayoutConfig;
      const ports = computeClusterPorts(positions, clusterEdges, config);

      // Cluster A's east side should have at most 3 ports
      const aPorts = ports.get('A') ?? [];
      const eastPorts = aPorts.filter((p) => p.side === 'EAST');
      expect(eastPorts.length).toBeLessThanOrEqual(3);
    });

    it('returns empty ports for disconnected clusters', () => {
      const positions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 0, 0)],
        ['B', createClusterPos('B', 500, 0)],
      ]);

      const ports = computeClusterPorts(positions, [], DEFAULT_CONFIG);

      expect(ports.get('A')?.length ?? 0).toBe(0);
      expect(ports.get('B')?.length ?? 0).toBe(0);
    });
  });

  describe('computeRoutedEdges', () => {
    function createClusterPos(id: string, x: number, y: number, size = 200): ClusterPosition {
      return { id, x, y, width: size, height: size, nodeCount: 3, vx: 0, vy: 0 };
    }

    it('skips intra-cluster edges', () => {
      const edges = [{ source: 'n1', target: 'n2' }];
      const nodePositions = new Map<string, NodePosition>([
        ['n1', { id: 'n1', clusterId: 'A', x: 0, y: 0, vx: 0, vy: 0, radius: 6 }],
        ['n2', { id: 'n2', clusterId: 'A', x: 10, y: 0, vx: 0, vy: 0, radius: 6 }],
      ]);
      const clusterPositions = new Map([['A', createClusterPos('A', 0, 0)]]);
      const clusterEdges: ClusterEdge[] = [];
      const nodeToCluster = new Map([
        ['n1', 'A'],
        ['n2', 'A'],
      ]);

      const config = { ...DEFAULT_CONFIG, portRoutingEnabled: true } as LayoutConfig;
      const clusterPorts = new Map([['A', []]]);

      const routed = computeRoutedEdges(
        edges,
        nodePositions,
        clusterPositions,
        clusterPorts,
        clusterEdges,
        nodeToCluster,
        config,
      );

      expect(routed).toHaveLength(0);
    });

    it('returns empty result for empty edge list', () => {
      const config = { ...DEFAULT_CONFIG, portRoutingEnabled: true } as LayoutConfig;

      const routed = computeRoutedEdges([], new Map(), new Map(), new Map(), [], new Map(), config);

      expect(routed).toHaveLength(0);
    });

    it('returns empty result when port routing is disabled', () => {
      const config = { ...DEFAULT_CONFIG, portRoutingEnabled: false } as unknown as LayoutConfig;

      const routed = computeRoutedEdges(
        [{ source: 'n1', target: 'n2' }],
        new Map(),
        new Map(),
        new Map(),
        [],
        new Map(),
        config,
      );

      expect(routed).toHaveLength(0);
    });
  });
});
