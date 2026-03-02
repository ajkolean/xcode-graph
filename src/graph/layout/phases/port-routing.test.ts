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
      const targets = ['B', 'C', 'D'];
      const clusterEdges: ClusterEdge[] = Array.from({ length: 20 }, (_, i) => {
        const target = targets[i % 3];
        assert(target, 'target must exist');
        return { source: 'A', target, weight: 1, tieStrength: 1 };
      });

      const config = { ...DEFAULT_CONFIG, maxPortsPerSide: 3 } as unknown as LayoutConfig;
      const ports = computeClusterPorts(positions, clusterEdges, config);

      // Cluster A's east side should have at most 3 ports
      const aPorts = ports.get('A') ?? [];
      const eastPorts = aPorts.filter((p) => p.side === 'EAST');
      expect(eastPorts.length).toBeLessThanOrEqual(3);
    });

    it('creates SOUTH/NORTH ports for vertically separated clusters', () => {
      const positions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 0, 0)],
        ['B', createClusterPos('B', 0, 500)],
      ]);
      const clusterEdges: ClusterEdge[] = [{ source: 'A', target: 'B', weight: 1, tieStrength: 1 }];

      const ports = computeClusterPorts(positions, clusterEdges, DEFAULT_CONFIG);

      const portsA = ports.get('A') ?? [];
      const portsB = ports.get('B') ?? [];
      // A should have SOUTH port (target is below), B should have NORTH port (source is above)
      expect(portsA.some((p) => p.side === 'SOUTH')).toBe(true);
      expect(portsB.some((p) => p.side === 'NORTH')).toBe(true);
    });

    it('creates WEST/EAST ports for leftward separated clusters', () => {
      const positions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 500, 0)],
        ['B', createClusterPos('B', 0, 0)],
      ]);
      const clusterEdges: ClusterEdge[] = [{ source: 'A', target: 'B', weight: 1, tieStrength: 1 }];

      const ports = computeClusterPorts(positions, clusterEdges, DEFAULT_CONFIG);

      const portsA = ports.get('A') ?? [];
      const portsB = ports.get('B') ?? [];
      // A should have WEST port (target is to the left), B should have EAST port
      expect(portsA.some((p) => p.side === 'WEST')).toBe(true);
      expect(portsB.some((p) => p.side === 'EAST')).toBe(true);
    });

    it('creates NORTH ports for upward-separated clusters', () => {
      const positions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 0, 500)],
        ['B', createClusterPos('B', 0, 0)],
      ]);
      const clusterEdges: ClusterEdge[] = [{ source: 'A', target: 'B', weight: 1, tieStrength: 1 }];

      const ports = computeClusterPorts(positions, clusterEdges, DEFAULT_CONFIG);

      const portsA = ports.get('A') ?? [];
      // A should have NORTH port (target is above)
      expect(portsA.some((p) => p.side === 'NORTH')).toBe(true);
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

    it('routes cross-cluster edges with horizontal port orientations (east-west)', () => {
      const clusterPositions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 0, 0)],
        ['B', createClusterPos('B', 600, 0)],
      ]);
      const clusterEdges: ClusterEdge[] = [{ source: 'A', target: 'B', weight: 2, tieStrength: 2 }];

      const config = { ...DEFAULT_CONFIG, portRoutingEnabled: true } as LayoutConfig;
      const clusterPorts = computeClusterPorts(clusterPositions, clusterEdges, config);

      const nodePositions = new Map<string, NodePosition>([
        ['n1', { id: 'n1', clusterId: 'A', x: 10, y: 0, vx: 0, vy: 0, radius: 6 }],
        ['n2', { id: 'n2', clusterId: 'B', x: 10, y: 0, vx: 0, vy: 0, radius: 6 }],
      ]);
      const nodeToCluster = new Map([
        ['n1', 'A'],
        ['n2', 'B'],
      ]);
      const edges = [{ source: 'n1', target: 'n2' }];

      const routed = computeRoutedEdges(
        edges,
        nodePositions,
        clusterPositions,
        clusterPorts,
        clusterEdges,
        nodeToCluster,
        config,
      );

      expect(routed.length).toBeGreaterThan(0);
      const first = routed[0];
      expect(first).toBeDefined();
      if (first) {
        expect(first.sourceClusterId).toBe('A');
        expect(first.targetClusterId).toBe('B');
        expect(first.waypoints.length).toBeGreaterThan(0);
      }
    });

    it('routes cross-cluster edges with vertical port orientations (north-south)', () => {
      const clusterPositions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 0, 0)],
        ['B', createClusterPos('B', 0, 600)],
      ]);
      const clusterEdges: ClusterEdge[] = [{ source: 'A', target: 'B', weight: 2, tieStrength: 2 }];

      const config = { ...DEFAULT_CONFIG, portRoutingEnabled: true } as LayoutConfig;
      const clusterPorts = computeClusterPorts(clusterPositions, clusterEdges, config);

      const nodePositions = new Map<string, NodePosition>([
        ['n1', { id: 'n1', clusterId: 'A', x: 0, y: 10, vx: 0, vy: 0, radius: 6 }],
        ['n2', { id: 'n2', clusterId: 'B', x: 0, y: 10, vx: 0, vy: 0, radius: 6 }],
      ]);
      const nodeToCluster = new Map([
        ['n1', 'A'],
        ['n2', 'B'],
      ]);
      const edges = [{ source: 'n1', target: 'n2' }];

      const routed = computeRoutedEdges(
        edges,
        nodePositions,
        clusterPositions,
        clusterPorts,
        clusterEdges,
        nodeToCluster,
        config,
      );

      expect(routed.length).toBeGreaterThan(0);
      const first = routed[0];
      expect(first).toBeDefined();
      if (first) {
        expect(first.waypoints.length).toBe(2);
      }
    });

    it('routes diagonal cluster edges producing 2 waypoints', () => {
      // A at (0,0), B at (400,400): angle=atan2(400,400)=π/4 → SOUTH exit, NORTH entry (both vertical)
      const clusterPositions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 0, 0)],
        ['B', createClusterPos('B', 400, 400)],
      ]);
      const clusterEdges: ClusterEdge[] = [{ source: 'A', target: 'B', weight: 2, tieStrength: 2 }];

      const config = { ...DEFAULT_CONFIG, portRoutingEnabled: true } as LayoutConfig;
      const clusterPorts = computeClusterPorts(clusterPositions, clusterEdges, config);

      const nodePositions = new Map<string, NodePosition>([
        ['n1', { id: 'n1', clusterId: 'A', x: 0, y: 0, vx: 0, vy: 0, radius: 6 }],
        ['n2', { id: 'n2', clusterId: 'B', x: 0, y: 0, vx: 0, vy: 0, radius: 6 }],
      ]);
      const nodeToCluster = new Map([
        ['n1', 'A'],
        ['n2', 'B'],
      ]);
      const edges = [{ source: 'n1', target: 'n2' }];

      const routed = computeRoutedEdges(
        edges,
        nodePositions,
        clusterPositions,
        clusterPorts,
        clusterEdges,
        nodeToCluster,
        config,
      );

      expect(routed.length).toBeGreaterThan(0);
      const first = routed[0];
      expect(first).toBeDefined();
      if (first) {
        // Same-orientation (vertical) produces 2 waypoints
        expect(first.waypoints.length).toBe(2);
      }
    });

    it('produces correct waypoint coordinates for horizontal routing', () => {
      const clusterPositions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 0, 0)],
        ['B', createClusterPos('B', 600, 0)],
      ]);
      const clusterEdges: ClusterEdge[] = [{ source: 'A', target: 'B', weight: 2, tieStrength: 2 }];

      const config = { ...DEFAULT_CONFIG, portRoutingEnabled: true } as LayoutConfig;
      const clusterPorts = computeClusterPorts(clusterPositions, clusterEdges, config);

      const nodePositions = new Map<string, NodePosition>([
        ['n1', { id: 'n1', clusterId: 'A', x: 10, y: 0, vx: 0, vy: 0, radius: 6 }],
        ['n2', { id: 'n2', clusterId: 'B', x: 10, y: 0, vx: 0, vy: 0, radius: 6 }],
      ]);
      const nodeToCluster = new Map([
        ['n1', 'A'],
        ['n2', 'B'],
      ]);
      const edges = [{ source: 'n1', target: 'n2' }];

      const routed = computeRoutedEdges(
        edges,
        nodePositions,
        clusterPositions,
        clusterPorts,
        clusterEdges,
        nodeToCluster,
        config,
      );

      expect(routed.length).toBe(1);
      const first = routed[0];
      expect(first).toBeDefined();
      if (first) {
        // Horizontal routing: 2 waypoints forming a vertical midline connector
        expect(first.waypoints.length).toBe(2);
        // Both waypoints should share the same X (midline)
        expect(first.waypoints[0]?.x).toBe(first.waypoints[1]?.x);
        expect(first.sourcePort.side).toBe('EAST');
        expect(first.targetPort.side).toBe('WEST');
      }
    });

    it('produces correct waypoint coordinates for vertical routing', () => {
      const clusterPositions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 0, 0)],
        ['B', createClusterPos('B', 0, 600)],
      ]);
      const clusterEdges: ClusterEdge[] = [{ source: 'A', target: 'B', weight: 2, tieStrength: 2 }];

      const config = { ...DEFAULT_CONFIG, portRoutingEnabled: true } as LayoutConfig;
      const clusterPorts = computeClusterPorts(clusterPositions, clusterEdges, config);

      const nodePositions = new Map<string, NodePosition>([
        ['n1', { id: 'n1', clusterId: 'A', x: 0, y: 10, vx: 0, vy: 0, radius: 6 }],
        ['n2', { id: 'n2', clusterId: 'B', x: 0, y: 10, vx: 0, vy: 0, radius: 6 }],
      ]);
      const nodeToCluster = new Map([
        ['n1', 'A'],
        ['n2', 'B'],
      ]);
      const edges = [{ source: 'n1', target: 'n2' }];

      const routed = computeRoutedEdges(
        edges,
        nodePositions,
        clusterPositions,
        clusterPorts,
        clusterEdges,
        nodeToCluster,
        config,
      );

      expect(routed.length).toBe(1);
      const first = routed[0];
      expect(first).toBeDefined();
      if (first) {
        // Vertical routing: 2 waypoints forming a horizontal midline connector
        expect(first.waypoints.length).toBe(2);
        // Both waypoints should share the same Y (midline)
        expect(first.waypoints[0]?.y).toBe(first.waypoints[1]?.y);
        expect(first.sourcePort.side).toBe('SOUTH');
        expect(first.targetPort.side).toBe('NORTH');
      }
    });

    it('skips edges where node positions are missing', () => {
      const clusterPositions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 0, 0)],
        ['B', createClusterPos('B', 500, 0)],
      ]);
      const clusterEdges: ClusterEdge[] = [{ source: 'A', target: 'B', weight: 1, tieStrength: 1 }];

      const config = { ...DEFAULT_CONFIG, portRoutingEnabled: true } as LayoutConfig;
      const clusterPorts = computeClusterPorts(clusterPositions, clusterEdges, config);

      // Node positions map is empty - no node positions available
      const nodePositions = new Map<string, NodePosition>();
      const nodeToCluster = new Map([
        ['n1', 'A'],
        ['n2', 'B'],
      ]);
      const edges = [{ source: 'n1', target: 'n2' }];

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

    it('skips edges where cluster port assignment is missing', () => {
      const clusterPositions = new Map<string, ClusterPosition>([
        ['A', createClusterPos('A', 0, 0)],
        ['B', createClusterPos('B', 500, 0)],
      ]);
      // No cluster edges means no port assignments
      const clusterEdges: ClusterEdge[] = [];

      const config = { ...DEFAULT_CONFIG, portRoutingEnabled: true } as LayoutConfig;
      const clusterPorts = computeClusterPorts(clusterPositions, clusterEdges, config);

      const nodePositions = new Map<string, NodePosition>([
        ['n1', { id: 'n1', clusterId: 'A', x: 0, y: 0, vx: 0, vy: 0, radius: 6 }],
        ['n2', { id: 'n2', clusterId: 'B', x: 0, y: 0, vx: 0, vy: 0, radius: 6 }],
      ]);
      const nodeToCluster = new Map([
        ['n1', 'A'],
        ['n2', 'B'],
      ]);
      const edges = [{ source: 'n1', target: 'n2' }];

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
  });

  describe('computePortSide edge cases', () => {
    it('returns WEST for a target directly to the left and slightly above', () => {
      expect(computePortSide(0, 0, -100, -10)).toBe('WEST');
    });

    it('returns WEST for a target at 180 degrees (pure left)', () => {
      expect(computePortSide(0, 0, -100, 0)).toBe('WEST');
    });
  });
});
