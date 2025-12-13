import { type SimulationNodeDatum } from 'd3-force';
import type { SimNode, ClusterCenter } from '../types';
import {
  forceClusterRepulsion,
  forceClusterAttraction,
} from './cluster-repulsion';
import {
  forceClusterStrataAnchor,
  forceClusterBoundingRadius,
  forceClusterStrataAlignment,
  forceClusterXCentering,
} from './cluster-strata-force';

/**
 * Meta-force that manages the global cluster physics loop.
 * 
 * Replaces the manual simulation loop from the original implementation.
 * It coordinates:
 * 1. Updating cluster centers based on node positions
 * 2. Applying cluster-level forces (repulsion, attraction, strata)
 * 3. Moving nodes to follow their cluster centers
 */
export function forceClusterGlobal() {
  let nodes: SimNode[] = [];
  let clusterCenters: ClusterCenter[] = [];
  let clusterCenterMap = new Map<string, ClusterCenter>();
  
  // Sub-forces
  const repel = forceClusterRepulsion();
  const attract = forceClusterAttraction();
  const anchor = forceClusterStrataAnchor();
  const bound = forceClusterBoundingRadius();
  const align = forceClusterStrataAlignment();
  const center = forceClusterXCentering();

  function updateCenters() {
    const sums = new Map<string, { sumX: number; sumY: number; count: number }>();
    
    // Initialize
    for (const c of clusterCenters) {
      sums.set(c.id, { sumX: 0, sumY: 0, count: 0 });
    }

    // Accumulate
    for (const node of nodes) {
      if (!node.clusterId) continue;
      const acc = sums.get(node.clusterId);
      if (acc) {
        acc.sumX += node.x;
        acc.sumY += node.y;
        acc.count++;
      }
    }

    // Update
    for (const c of clusterCenters) {
      const acc = sums.get(c.id);
      if (acc && acc.count > 0) {
        c.cx = acc.sumX / acc.count;
        c.cy = acc.sumY / acc.count;
      }
    }
  }

  function force(alpha: number) {
    // 1. Update centers from current node positions
    // Track previous positions to calculate delta
    const prevPos = new Map<string, { x: number; y: number }>();
    for (const c of clusterCenters) {
      prevPos.set(c.id, { x: c.cx, y: c.cy });
    }

    updateCenters();

    // 2. Apply forces to cluster centers
    // These forces modify c.cx/c.cy in place
    repel(alpha);
    attract(alpha);
    anchor(alpha);
    bound(alpha);
    align(alpha);
    center(alpha);

    // 3. Move nodes by the delta of their cluster center
    for (const c of clusterCenters) {
      const prev = prevPos.get(c.id);
      if (!prev) continue;

      const dx = c.cx - prev.x;
      const dy = c.cy - prev.y;

      if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
        // Find nodes for this cluster - this is O(N) inside the loop, 
        // effectively O(C*N) where C is clusters. 
        // Optimization: Pre-group nodes or just iterate nodes once.
        // Let's iterate nodes once below.
      }
    }

    // Optimized node movement
    for (const node of nodes) {
      if (!node.clusterId) continue;
      const c = clusterCenterMap.get(node.clusterId);
      const prev = c ? prevPos.get(c.id) : null;
      
      if (c && prev) {
        const dx = c.cx - prev.x;
        const dy = c.cy - prev.y;
        node.x += dx;
        node.y += dy;
      }
    }
  }

  force.initialize = (n: SimulationNodeDatum[]) => {
    nodes = n as SimNode[];
    // Initialize sub-forces with cluster centers
    // This requires clusterCenters to be set via configuration
    const centerArray = Array.from(clusterCenterMap.values());
    clusterCenters = centerArray;
    
    // Initialize sub-forces manually since they aren't registered to the main sim
    // We pass the cluster centers as "nodes" to these forces
    const clustersAsNodes = centerArray as unknown as SimulationNodeDatum[];
    repel.initialize(clustersAsNodes);
    attract.initialize(clustersAsNodes);
    anchor.initialize(clustersAsNodes);
    bound.initialize(clustersAsNodes);
    align.initialize(clustersAsNodes);
    center.initialize(clustersAsNodes);
  };

  // Configuration methods
  force.centers = (centers: Map<string, ClusterCenter>) => {
    clusterCenterMap = centers;
    return force;
  };

  // Expose sub-forces for configuration
  force.repulsion = () => repel;
  force.attraction = () => attract;
  force.anchor = () => anchor;
  force.bounding = () => bound;
  force.alignment = () => align;
  force.centering = () => center;

  return force;
}
