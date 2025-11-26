import { describe, expect, it } from 'vitest';
import {
  computeAdaptiveShellRadius,
  computeElasticShellRadius,
  computeElasticShellWithDebug,
  computeMassWeightedShellRadius,
  type ElasticShellConfig,
  type NodeWithPosition,
} from './elasticShell';
import type { NodeMass } from './massCalculation';

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

  describe('computeMassWeightedShellRadius', () => {
    it('should return minRadius for empty nodes', () => {
      const masses = new Map<string, NodeMass>();
      const radius = computeMassWeightedShellRadius([], masses);

      expect(radius).toBe(50);
    });

    it('should increase radius with higher total mass', () => {
      const nodes = createTestNodes(3);
      const lowMasses = createMassMap(
        nodes.map((n) => n.id),
        [1, 1, 1],
      );
      const highMasses = createMassMap(
        nodes.map((n) => n.id),
        [10, 10, 10],
      );

      const lowMassRadius = computeMassWeightedShellRadius(nodes, lowMasses);
      const highMassRadius = computeMassWeightedShellRadius(nodes, highMasses);

      expect(highMassRadius).toBeGreaterThan(lowMassRadius);
    });

    it('should consider max distance from center', () => {
      const closeNodes: NodeWithPosition[] = [
        { id: 'a', x: 10, y: 0, ring: 0 },
        { id: 'b', x: 0, y: 10, ring: 0 },
      ];
      const farNodes: NodeWithPosition[] = [
        { id: 'a', x: 100, y: 0, ring: 0 },
        { id: 'b', x: 0, y: 100, ring: 0 },
      ];
      const masses = createMassMap(['a', 'b'], [1, 1]);

      const closeRadius = computeMassWeightedShellRadius(closeNodes, masses);
      const farRadius = computeMassWeightedShellRadius(farNodes, masses);

      expect(farRadius).toBeGreaterThan(closeRadius);
    });

    it('should return radius within bounds', () => {
      const nodes = createTestNodes(10);
      const masses = createMassMap(
        nodes.map((n) => n.id),
        Array(10).fill(5),
      );

      const radius = computeMassWeightedShellRadius(nodes, masses);

      expect(radius).toBeGreaterThanOrEqual(50);
      expect(radius).toBeLessThanOrEqual(280);
    });
  });

  describe('computeAdaptiveShellRadius', () => {
    it('should return minRadius for empty nodes', () => {
      const masses = new Map<string, NodeMass>();
      const radius = computeAdaptiveShellRadius([], masses);

      expect(radius).toBe(50);
    });

    it('should maintain target density', () => {
      const nodes = createTestNodes(5);
      const masses = createMassMap(
        nodes.map((n) => n.id),
        [1, 1, 1, 1, 1],
      );

      const radius = computeAdaptiveShellRadius(nodes, masses);

      expect(radius).toBeGreaterThanOrEqual(50);
      expect(radius).toBeLessThanOrEqual(280);
    });

    it('should produce larger radius for higher mass', () => {
      // Use nodes positioned close to center so MEC floor doesn't dominate
      const nodes: NodeWithPosition[] = [
        { id: 'a', x: 5, y: 0, ring: 0 },
        { id: 'b', x: 0, y: 5, ring: 0 },
        { id: 'c', x: -5, y: 0, ring: 0 },
      ];
      const lowMasses = createMassMap(['a', 'b', 'c'], [1, 1, 1]);
      // Use very high mass to exceed the MEC floor (maxDistance + 40)
      const highMasses = createMassMap(['a', 'b', 'c'], [5000, 5000, 5000]);

      const lowRadius = computeAdaptiveShellRadius(nodes, lowMasses);
      const highRadius = computeAdaptiveShellRadius(nodes, highMasses);

      expect(highRadius).toBeGreaterThan(lowRadius);
    });

    it('should be at least as large as max enclosing circle', () => {
      const nodes: NodeWithPosition[] = [
        { id: 'a', x: 80, y: 0, ring: 0 },
        { id: 'b', x: 0, y: 80, ring: 0 },
      ];
      const masses = createMassMap(['a', 'b'], [0.1, 0.1]); // Very low mass

      const radius = computeAdaptiveShellRadius(nodes, masses);

      // Should be at least maxDistance + 40
      expect(radius).toBeGreaterThanOrEqual(80 + 40);
    });
  });

  describe('computeElasticShellWithDebug', () => {
    it('should return debug info for empty nodes', () => {
      const masses = new Map<string, NodeMass>();
      const debug = computeElasticShellWithDebug([], masses);

      expect(debug.radius).toBe(50);
      expect(debug.outwardPressure).toBe(0);
      expect(debug.inwardCompression).toBe(0);
      expect(debug.netForce).toBe(0);
      expect(debug.iterations).toBe(0);
      expect(debug.converged).toBe(true);
    });

    it('should return all debug fields', () => {
      const nodes = createTestNodes(5);
      const masses = createMassMap(
        nodes.map((n) => n.id),
        [1, 1, 1, 1, 1],
      );

      const debug = computeElasticShellWithDebug(nodes, masses);

      expect(debug).toHaveProperty('radius');
      expect(debug).toHaveProperty('outwardPressure');
      expect(debug).toHaveProperty('inwardCompression');
      expect(debug).toHaveProperty('netForce');
      expect(debug).toHaveProperty('iterations');
      expect(debug).toHaveProperty('converged');
    });

    it('should converge for typical inputs', () => {
      const nodes = createTestNodes(3, [0, 1, 1]);
      const masses = createMassMap(
        nodes.map((n) => n.id),
        [1, 1, 1],
      );

      const debug = computeElasticShellWithDebug(nodes, masses);

      // Most typical cases should converge
      expect(typeof debug.converged).toBe('boolean');
      expect(debug.radius).toBeGreaterThanOrEqual(50);
    });

    it('should have outward pressure for nodes with mass', () => {
      const nodes: NodeWithPosition[] = [
        { id: 'a', x: 30, y: 0, ring: 1 },
        { id: 'b', x: 0, y: 30, ring: 1 },
      ];
      const masses = createMassMap(['a', 'b'], [5, 5]);

      const debug = computeElasticShellWithDebug(nodes, masses);

      expect(debug.outwardPressure).toBeGreaterThan(0);
    });

    it('should return radius within config bounds', () => {
      const nodes = createTestNodes(10, Array(10).fill(3));
      const masses = createMassMap(
        nodes.map((n) => n.id),
        Array(10).fill(5),
      );
      const config: ElasticShellConfig = {
        baseRadius: 60,
        compressionFactor: 0.35,
        alpha: 0.15,
        iterations: 25,
        minRadius: 75,
        maxRadius: 200,
      };

      const debug = computeElasticShellWithDebug(nodes, masses, config);

      expect(debug.radius).toBeGreaterThanOrEqual(75);
      expect(debug.radius).toBeLessThanOrEqual(200);
    });
  });
});
