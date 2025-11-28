import { describe, expect, it } from 'vitest';
import { computeElasticShellRadius, type ElasticShellConfig, type NodeWithPosition } from './elastic-shell';
import type { NodeMass } from './mass';

describe('elasticShell', () => {
  // Helper to create test nodes
  function createTestNodes(count: number, ringDistribution: number[] = []): NodeWithPosition[] {
    const nodes: NodeWithPosition[] = [];
    for (let i = 0; i < count; i++) {
      const ring = ringDistribution[i] ?? Math.floor(i / 2);
      const angle = (2 * Math.PI * i) / count;
      const distance = 20 + ring * 30;
      nodes.push({
        id: `node-${i}`,
        x: distance * Math.cos(angle),
        y: distance * Math.sin(angle),
        ring,
      });
    }
    return nodes;
  }

  // Helper to create mass map
  function createMassMap(nodeIds: string[], masses: number[]): Map<string, NodeMass> {
    const map = new Map<string, NodeMass>();
    nodeIds.forEach((id, i) => {
      map.set(id, {
        mass: masses[i] ?? 1.0,
        fanIn: 0,
        fanOut: 0,
        transitiveIn: 0,
        transitiveOut: 0,
      });
    });
    return map;
  }

  describe('computeElasticShellRadius', () => {
    it('should return minRadius for empty nodes', () => {
      const masses = new Map<string, NodeMass>();
      const radius = computeElasticShellRadius([], masses);

      expect(radius).toBe(50); // Default minRadius
    });

    it('should return a radius within bounds', () => {
      const nodes = createTestNodes(5);
      const masses = createMassMap(
        nodes.map((n) => n.id),
        [1, 1, 1, 1, 1],
      );

      const radius = computeElasticShellRadius(nodes, masses);

      expect(radius).toBeGreaterThanOrEqual(50); // minRadius
      expect(radius).toBeLessThanOrEqual(280); // maxRadius
    });

    it('should increase radius with more nodes', () => {
      const smallNodes = createTestNodes(3);
      const largeNodes = createTestNodes(10);
      const smallMasses = createMassMap(
        smallNodes.map((n) => n.id),
        Array(3).fill(1),
      );
      const largeMasses = createMassMap(
        largeNodes.map((n) => n.id),
        Array(10).fill(1),
      );

      const smallRadius = computeElasticShellRadius(smallNodes, smallMasses);
      const largeRadius = computeElasticShellRadius(largeNodes, largeMasses);

      // Larger node set should generally produce equal or larger radius
      expect(largeRadius).toBeGreaterThanOrEqual(smallRadius);
    });

    it('should increase radius with higher rings', () => {
      const ring0Nodes = createTestNodes(3, [0, 0, 0]);
      const ring2Nodes = createTestNodes(3, [2, 2, 2]);
      const masses = createMassMap(['node-0', 'node-1', 'node-2'], [1, 1, 1]);

      const ring0Radius = computeElasticShellRadius(ring0Nodes, masses);
      const ring2Radius = computeElasticShellRadius(ring2Nodes, masses);

      expect(ring2Radius).toBeGreaterThan(ring0Radius);
    });

    it('should respect custom config minRadius', () => {
      const nodes = createTestNodes(1, [0]);
      const masses = createMassMap(['node-0'], [1]);
      const config: ElasticShellConfig = {
        baseRadius: 60,
        compressionFactor: 0.35,
        alpha: 0.15,
        iterations: 25,
        minRadius: 100,
        maxRadius: 300,
      };

      const radius = computeElasticShellRadius(nodes, masses, config);

      expect(radius).toBeGreaterThanOrEqual(100);
    });

    it('should respect custom config maxRadius', () => {
      const nodes = createTestNodes(20, Array(20).fill(5)); // High ring values
      const masses = createMassMap(
        nodes.map((n) => n.id),
        Array(20).fill(10), // High masses
      );
      const config: ElasticShellConfig = {
        baseRadius: 60,
        compressionFactor: 0.35,
        alpha: 0.15,
        iterations: 25,
        minRadius: 50,
        maxRadius: 150,
      };

      const radius = computeElasticShellRadius(nodes, masses, config);

      expect(radius).toBeLessThanOrEqual(150);
    });

    it('should handle nodes at center (0,0)', () => {
      const nodes: NodeWithPosition[] = [{ id: 'center', x: 0, y: 0, ring: 0 }];
      const masses = createMassMap(['center'], [1]);

      const radius = computeElasticShellRadius(nodes, masses);

      expect(radius).toBeGreaterThanOrEqual(50);
    });

    it('should handle missing mass data', () => {
      const nodes = createTestNodes(3);
      const emptyMasses = new Map<string, NodeMass>();

      // Should not throw, uses default mass
      const radius = computeElasticShellRadius(nodes, emptyMasses);

      expect(radius).toBeGreaterThanOrEqual(50);
    });
  });

});
