import { describe, expect, it } from 'vitest';
import { computeNodeMasses, selectMassBasedAnchor } from './mass';

// Test fixtures
const createTestNodes = () => [
  { id: 'core', type: 'framework' },
  { id: 'featureA', type: 'framework' },
  { id: 'featureB', type: 'framework' },
  { id: 'util', type: 'library' },
  { id: 'testCore', type: 'test-unit' }, // Should be excluded from mass calculation
];

const createTestEdges = () => [
  // Both features depend on core
  { from: 'featureA', to: 'core' },
  { from: 'featureB', to: 'core' },
  // Core depends on util
  { from: 'core', to: 'util' },
  // Test depends on core
  { from: 'testCore', to: 'core' },
];

describe('massCalculation', () => {
  describe('computeNodeMasses', () => {
    it('should compute mass for each non-test node', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();

      const masses = computeNodeMasses(nodes, edges);

      // Test nodes should be excluded
      expect(masses.has('testCore')).toBe(false);

      // Main nodes should have mass
      expect(masses.has('core')).toBe(true);
      expect(masses.has('featureA')).toBe(true);
      expect(masses.has('featureB')).toBe(true);
      expect(masses.has('util')).toBe(true);
    });

    it('should calculate fan-in correctly', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();

      const masses = computeNodeMasses(nodes, edges);

      // core has 2 incoming (from featureA and featureB) - test edge excluded
      expect(masses.get('core')?.fanIn).toBe(2);

      // util has 1 incoming (from core)
      expect(masses.get('util')?.fanIn).toBe(1);

      // features have 0 incoming
      expect(masses.get('featureA')?.fanIn).toBe(0);
      expect(masses.get('featureB')?.fanIn).toBe(0);
    });

    it('should calculate fan-out correctly', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();

      const masses = computeNodeMasses(nodes, edges);

      // core has 1 outgoing (to util)
      expect(masses.get('core')?.fanOut).toBe(1);

      // features have 1 outgoing each (to core)
      expect(masses.get('featureA')?.fanOut).toBe(1);
      expect(masses.get('featureB')?.fanOut).toBe(1);

      // util has 0 outgoing
      expect(masses.get('util')?.fanOut).toBe(0);
    });

    it('should give higher mass to nodes with more dependents (fan-in)', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();

      const masses = computeNodeMasses(nodes, edges);

      const coreMass = masses.get('core')!.mass;
      const featureAMass = masses.get('featureA')!.mass;

      // Core has higher fan-in, should have more mass
      expect(coreMass).toBeGreaterThan(featureAMass);
    });

    it('should handle empty input', () => {
      const masses = computeNodeMasses([], []);

      expect(masses.size).toBe(0);
    });

    it('should handle nodes with no edges', () => {
      const nodes = [{ id: 'isolated', type: 'framework' }];

      const masses = computeNodeMasses(nodes, []);

      expect(masses.has('isolated')).toBe(true);
      expect(masses.get('isolated')?.fanIn).toBe(0);
      expect(masses.get('isolated')?.fanOut).toBe(0);
    });
  });

  describe('selectMassBasedAnchor', () => {
    it('should return node with highest mass', () => {
      const nodes = createTestNodes();
      const edges = createTestEdges();

      const anchor = selectMassBasedAnchor(nodes, edges);

      // Core should be selected as anchor (highest mass due to fan-in)
      expect(anchor).toBe('core');
    });

    it('should return null for empty input', () => {
      const anchor = selectMassBasedAnchor([], []);

      expect(anchor).toBeNull();
    });

    it('should return null when only test nodes exist', () => {
      const nodes = [
        { id: 'test1', type: 'test-unit' },
        { id: 'test2', type: 'test-ui' },
      ];

      const anchor = selectMassBasedAnchor(nodes, []);

      expect(anchor).toBeNull();
    });

    it('should return the single node when only one exists', () => {
      const nodes = [{ id: 'single', type: 'framework' }];

      const anchor = selectMassBasedAnchor(nodes, []);

      expect(anchor).toBe('single');
    });
  });

});
