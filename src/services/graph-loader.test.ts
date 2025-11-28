/**
 * Tests for Progressive Graph Loader
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLinearChain, createProjectGraph } from '../fixtures';
import { GraphLoader, type LoadProgress } from './graph-loader';

describe('GraphLoader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('loadGraphProgressive', () => {
    it('should load graph in chunks', async () => {
      const { nodes, edges } = createLinearChain(250); // 250 nodes
      const loader = new GraphLoader({ chunkSize: 50, delayBetweenChunks: 1 });

      const progressUpdates: LoadProgress[] = [];

      const loadPromise = loader.loadGraphProgressive(nodes, edges, (progress) => {
        progressUpdates.push(progress);
      });

      // Run all timers multiple times to handle async iteration
      while (progressUpdates.length < 6) {
        await vi.advanceTimersToNextTimerAsync();
        if (vi.getTimerCount() === 0) break;
      }
      await loadPromise;

      // Should have multiple chunk updates (250/50 = 5 chunks + 1 complete = 6)
      expect(progressUpdates.length).toBeGreaterThan(5);

      // Last update should be complete
      const lastUpdate = progressUpdates[progressUpdates.length - 1];
      expect(lastUpdate.type).toBe('complete');
      expect(lastUpdate.percentage).toBe(100);
      expect(lastUpdate.loadedNodes).toBe(250);
    });

    it('should handle empty graph', async () => {
      const loader = new GraphLoader();
      const progressUpdates: LoadProgress[] = [];

      const loadPromise = loader.loadGraphProgressive([], [], (progress) => {
        progressUpdates.push(progress);
      });

      await vi.runAllTimersAsync();
      await loadPromise;

      expect(progressUpdates).toHaveLength(1);
      expect(progressUpdates[0].type).toBe('complete');
      expect(progressUpdates[0].loadedNodes).toBe(0);
    });

    it('should calculate correct progress percentages', async () => {
      const { nodes, edges } = createLinearChain(100);
      const loader = new GraphLoader({ chunkSize: 25, delayBetweenChunks: 1 });

      const progressUpdates: LoadProgress[] = [];

      const loadPromise = loader.loadGraphProgressive(nodes, edges, (progress) => {
        progressUpdates.push(progress);
      });

      await vi.runAllTimersAsync();
      await loadPromise;

      // Check percentages increase
      const percentages = progressUpdates.map((p) => p.percentage);
      for (let i = 1; i < percentages.length; i++) {
        expect(percentages[i]).toBeGreaterThanOrEqual(percentages[i - 1]);
      }

      // Final should be 100%
      expect(percentages[percentages.length - 1]).toBe(100);
    });

    it('should include chunk data in progress updates', async () => {
      const { nodes, edges } = createLinearChain(50);
      const loader = new GraphLoader({ chunkSize: 20, delayBetweenChunks: 1 });

      let firstChunk: LoadProgress | null = null;

      const loadPromise = loader.loadGraphProgressive(nodes, edges, (progress) => {
        if (progress.type === 'chunk' && !firstChunk) {
          firstChunk = progress;
        }
      });

      await vi.runAllTimersAsync();
      await loadPromise;

      expect(firstChunk).not.toBeNull();
      expect(firstChunk?.chunk).toBeDefined();
      expect(firstChunk?.chunk?.nodes.length).toBeLessThanOrEqual(20);
    });
  });

  describe('loadByClusterPriority', () => {
    it('should load priority clusters first', async () => {
      const { nodes, edges } = createProjectGraph();
      const loader = new GraphLoader({
        chunkSize: 100,
        delayBetweenChunks: 1,
        priorityClusterIds: ['App'],
      });

      // Group nodes into clusters
      const clusters = [
        {
          id: 'App',
          name: 'App',
          type: 'project' as const,
          origin: 'local' as const,
          nodes: nodes.filter((n) => n.project === 'App'),
        },
        {
          id: 'Features',
          name: 'Features',
          type: 'project' as const,
          origin: 'local' as const,
          nodes: nodes.filter((n) => n.project === 'Features'),
        },
      ];

      const progressUpdates: LoadProgress[] = [];

      const loadPromise = loader.loadByClusterPriority(clusters, nodes, edges, (progress) => {
        progressUpdates.push(progress);
      });

      await vi.runAllTimersAsync();
      await loadPromise;

      // First chunk should have App cluster nodes
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0].chunk?.nodes.some((n) => n.project === 'App')).toBe(true);
    });
  });

  describe('estimateLoadTime', () => {
    it('should estimate instant load for small graphs', () => {
      const loader = new GraphLoader({ chunkSize: 100 });
      const estimate = loader.estimateLoadTime(50);

      expect(estimate.recommendation).toBe('instant');
      expect(estimate.chunks).toBe(1);
    });

    it('should recommend fast load for medium graphs', () => {
      const loader = new GraphLoader({ chunkSize: 100 });
      const estimate = loader.estimateLoadTime(300);

      expect(estimate.recommendation).toBe('fast');
      expect(estimate.chunks).toBeGreaterThan(1);
    });

    it('should recommend progressive load for large graphs', () => {
      const loader = new GraphLoader({ chunkSize: 100 });
      const estimate = loader.estimateLoadTime(1000);

      expect(estimate.recommendation).toBe('progressive');
      expect(estimate.chunks).toBe(10);
    });

    it('should calculate correct chunk count', () => {
      const loader = new GraphLoader({ chunkSize: 50 });

      expect(loader.estimateLoadTime(100).chunks).toBe(2);
      expect(loader.estimateLoadTime(150).chunks).toBe(3);
      expect(loader.estimateLoadTime(200).chunks).toBe(4);
    });
  });

  describe('Performance', () => {
    it('should load large graphs without blocking', async () => {
      const { nodes, edges } = createLinearChain(500);
      const loader = new GraphLoader({ chunkSize: 100, delayBetweenChunks: 5 });

      const progressUpdates: LoadProgress[] = [];
      const loadPromise = loader.loadGraphProgressive(nodes, edges, (progress) => {
        progressUpdates.push(progress);
      });

      await vi.runAllTimersAsync();
      await loadPromise;

      // Should complete with all chunks processed
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1].type).toBe('complete');
    });

    it('should yield to UI between chunks', async () => {
      const { nodes, edges } = createLinearChain(100);
      const loader = new GraphLoader({ chunkSize: 25, delayBetweenChunks: 10 });

      const progressUpdates: LoadProgress[] = [];
      const loadPromise = loader.loadGraphProgressive(nodes, edges, (progress) => {
        progressUpdates.push(progress);
      });

      // Run all timers to handle async iteration
      while (progressUpdates.length < 5) {
        await vi.advanceTimersToNextTimerAsync();
        if (vi.getTimerCount() === 0) break;
      }
      await loadPromise;

      // 100 nodes / 25 chunk size = 4 chunks + 1 complete = 5 updates
      expect(progressUpdates.length).toBe(5);
      expect(progressUpdates.filter((p) => p.type === 'chunk').length).toBe(4);
    });
  });
});
