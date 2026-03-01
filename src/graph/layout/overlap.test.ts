import type { ClusterPosition } from '@shared/schemas';
import { describe, expect, it } from 'vitest';
import { xcodeGraphData } from '@/fixtures/xcode-graph-data';
import { analyzeCluster } from './cluster-analysis';
import { groupIntoClusters } from './cluster-grouping';
import { computeHierarchicalLayout } from './engine';

function checkCircularOverlap(
  c1: ClusterPosition,
  c2: ClusterPosition,
): { isOverlap: boolean; dist: number; minSpace: number } {
  const rad1 = Math.max(c1.width, c1.height) / 2;
  const rad2 = Math.max(c2.width, c2.height) / 2;
  const dist = Math.hypot(c1.x - c2.x, c1.y - c2.y);
  const minSpace = rad1 + rad2 - 1.0;
  return { isOverlap: dist < minSpace, dist, minSpace };
}

function findOverlappingPairs(positions: ClusterPosition[]): string[] {
  const failures: string[] = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const c1 = positions[i];
      const c2 = positions[j];
      if (!c1 || !c2) continue;
      const { isOverlap, dist, minSpace } = checkCircularOverlap(c1, c2);

      if (isOverlap) {
        failures.push(
          `${c1.id} vs ${c2.id} (Dist: ${dist.toFixed(1)}, Required: ${minSpace.toFixed(1)})`,
        );
      }
    }
  }

  return failures;
}

describe('Layout Overlap', () => {
  it('should not produce overlapping clusters in Tuist graph', async () => {
    const { nodes, edges } = xcodeGraphData;

    // 1. Prepare Clusters (mimic LayoutController)
    const clusters = groupIntoClusters(nodes, edges);
    for (const c of clusters) {
      analyzeCluster(c, edges);
    }

    // 2. Run Layout
    const result = await computeHierarchicalLayout(nodes, edges, clusters, {});
    const positions = Array.from(result.clusterPositions.values());

    // 3. Check Overlaps
    const failures = findOverlappingPairs(positions);

    if (failures.length > 0) {
      console.warn(`Found ${failures.length} overlapping cluster pairs:`);
      for (const f of failures.slice(0, 10)) {
        console.warn(f);
      }
    }

    expect(failures.length).toBe(0);
  }, 10000); // Increase timeout for ELK
});
