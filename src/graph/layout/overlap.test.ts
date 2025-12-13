import { describe, expect, it } from 'vitest';
import { tuistGraphData } from '@/fixtures/tuist-graph-data';
import { analyzeCluster } from './cluster-analysis';
import { groupIntoClusters } from './cluster-grouping';
import { computeHierarchicalLayout } from './engine';

describe('Layout Overlap', () => {
  it('should not produce overlapping clusters in Tuist graph', async () => {
    const { nodes, edges } = tuistGraphData;

    // 1. Prepare Clusters (mimic LayoutController)
    const clusters = groupIntoClusters(nodes, edges);
    clusters.forEach((c) => analyzeCluster(c, edges));

    // 2. Run Layout
    // Default config uses the newly tuned spacing values
    const result = await computeHierarchicalLayout(nodes, edges, clusters, {
      dimension: '2d',
    });

    const positions = Array.from(result.clusterPositions.values());

    // 3. Check Overlaps
    let overlapCount = 0;
    const failures: string[] = [];

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const c1 = positions[i];
        const c2 = positions[j];

        // Rectangular Overlap Check
        // Positions from engine are Center coordinates
        const r1 = {
          left: c1.x - c1.width / 2,
          right: c1.x + c1.width / 2,
          top: c1.y - c1.height / 2,
          bottom: c1.y + c1.height / 2,
        };
        const r2 = {
          left: c2.x - c2.width / 2,
          right: c2.x + c2.width / 2,
          top: c2.y - c2.height / 2,
          bottom: c2.y + c2.height / 2,
        };

        const isRectOverlap = !(
          r2.left >= r1.right ||
          r2.right <= r1.left ||
          r2.top >= r1.bottom ||
          r2.bottom <= r1.top
        );

        // Circular Overlap Check (Visual)
        // We use circular rendering, so this is critical
        // Including a small epsilon for floating point issues
        const rad1 = Math.max(c1.width, c1.height) / 2;
        const rad2 = Math.max(c2.width, c2.height) / 2;
        const dist = Math.hypot(c1.x - c2.x, c1.y - c2.y);
        const minSpace = rad1 + rad2 - 1.0;

        const isCircleOverlap = dist < minSpace;

        // We care mostly if BOTH overlap, or if Circles overlap significantly
        if (isCircleOverlap) {
          overlapCount++;
          failures.push(
            `${c1.id} vs ${c2.id} (Dist: ${dist.toFixed(1)}, Required: ${minSpace.toFixed(1)})`,
          );
        }
      }
    }

    if (overlapCount > 0) {
      console.warn(`Found ${overlapCount} overlapping cluster pairs:`);
      failures.slice(0, 10).forEach((f) => console.warn(f));
    }

    expect(overlapCount).toBe(0);
  }, 10000); // Increase timeout for ELK
});
