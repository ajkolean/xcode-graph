import * as d3Force2D from 'd3-force';
import * as d3Force3D from 'd3-force-3d';
import forceClustering from 'd3-force-clustering';

import type { LayoutConfig, LayoutOptions } from '../config';
import type { SimNode, SimLink, ClusterCenter, D3ForceModule } from '../types';
import type { PreparationResult } from './preparation';

import {
  forceClusterBoundary,
  forceClusterRadial,
} from '../forces/cluster-boundary';
import { forceClusterGlobal } from '../forces/cluster-global';
import { forceDependencyHang } from '../forces/dependency-hang';

/**
 * Get the appropriate d3-force module based on dimension
 */
function getD3(dimension: '2d' | '3d'): D3ForceModule {
  return (dimension === '3d' ? d3Force3D : d3Force2D) as unknown as D3ForceModule;
}

/**
 * Run the physics simulation
 */
export function runSimulation(
  data: PreparationResult,
  config: LayoutConfig,
  options: LayoutOptions,
): void {
  const { simNodes, simLinks, clusterCenters, strataResult, fanIn, clusterStrataResult, crossClusterWeights, clusterSizes } = data;
  const dimension = options.dimension ?? '2d';
  const d3 = getD3(dimension);

  // 1. Create Forces
  
  // A. Standard forces
  const linkForce = d3.forceLink(simLinks)
    .id((d: any) => d.id)
    .distance((l: any) =>
      l.sameCluster ? config.linkDistance : config.linkDistance * config.crossClusterDistanceMul,
    )
    .strength((l: any) =>
      l.sameCluster ? config.linkStrength : config.linkStrength * config.crossClusterStrengthMul,
    );

  const chargeForce = d3.forceManyBody().strength(config.nodeCharge);
  
  const collideForce = d3.forceCollide()
    .radius(config.nodeRadius + config.nodeCollisionPadding);

  // B. Cluster Packing (standard d3-force-clustering)
  const clusteringForce = forceClustering()
    .strength(config.clusterStrength)
    .distanceMin(config.clusterDistanceMin)
    .clusterId((d: any) => d.clusterId);

  // C. Custom Cluster Constraints (Boundary & Radial)
  const boundaryForce = forceClusterBoundary()
    .centers(clusterCenters as any) // map mismatch fix
    .padding(config.nodeRadius + 10);

  const radialForce = forceClusterRadial()
    .centers(clusterCenters as any)
    .clusterSizes(clusterSizes)
    .strength(config.radialStrength)
    .radius((nodeId, clusterRadius) => {
      // Use callback from options to determine role-based radius
      // If no callback, we can't easily do role-based, so fallback to generic
      // (logic from computeNodeTargetRadius needs to be here or injected)
      
      // Since we decoupled logic, we expect the caller to might want to control this.
      // But for now, we'll implement a simple default or use the provided Z offset logic?
      // No, Z offset is for Z. Radius is for XY.
      // Let's rely on a simplified default for now to be pure.
      // Or we can inject a radius provider.
      return clusterRadius * 0.5; // Default behavior
    });
    
  // Re-inject role-based logic via options if needed (TODO: Enhance options)

  // D. Global Cluster Physics (The "Meta Force")
  const globalClusterForce = forceClusterGlobal()
    .centers(clusterCenters);
  
  // Configure sub-forces of the meta-force
  globalClusterForce.repulsion()
    .strength(config.clusterRepulsionStrength)
    .padding(config.clusterPadding)
    .weights(crossClusterWeights)
    .yScale(config.clusterRepulsionYScale);

  globalClusterForce.attraction()
    .strength(config.clusterAttractionStrength)
    .weights(crossClusterWeights)
    .activationDistance(config.clusterAttractionActivationDist);

  globalClusterForce.anchor()
    .strength(config.clusterStrataAnchorStrength)
    .targets(data.clusterTargetPositions);

  globalClusterForce.bounding()
    .maxRadius(config.clusterBoundingRadius)
    .strength(config.clusterBoundingStrength);

  globalClusterForce.alignment()
    .strength(config.clusterStrataAlignmentStrength)
    .stratum(clusterStrataResult.clusterStratum)
    .spacing(config.clusterStrataSpacing);

  globalClusterForce.centering()
    .strength(config.clusterCenteringStrength);

  // E. Dependency Hang
  const hangForce = forceDependencyHang()
    .links(simLinks)
    .gap(config.hangGap)
    .strength(config.hangStrength);

  // F. Strata Y Force
  const strataYForce = d3.forceY((d: any) => {
    const stratum = strataResult.nodeStratum.get(d.id) ?? 0;
    return stratum * config.layerSpacing;
  }).strength(config.layerStrength);

  // 2. Setup Simulation
  const simulation = d3.forceSimulation(simNodes)
    .force('link', linkForce)
    .force('charge', chargeForce)
    .force('collision', collideForce)
    .force('cluster', clusteringForce)
    .force('boundary', boundaryForce)
    .force('radial', radialForce)
    .force('globalCluster', globalClusterForce)
    .force('hang', hangForce)
    .force('strataY', strataYForce)
    .force('center', d3.forceCenter(0, 0));

  // 3. 3D Specifics
  if (dimension === '3d') {
    if ('numDimensions' in simulation) {
      (simulation as any).numDimensions(3);
    }

    if ('forceZ' in d3) {
      const zForce = (d3 as any).forceZ((d: any) => {
        const fi = fanIn.get(d.id) ?? 0;
        const stratum = strataResult.nodeStratum.get(d.id) ?? 0;
        
        // Use injected Z offset callback
        const roleOffset = options.getNodeZOffset ? options.getNodeZOffset(d.id) : 0;

        return Math.log2(fi + 1) * 80 - stratum * 25 + roleOffset * config.zRoleStrength;
      }).strength(config.zStratumStrength);

      (simulation as any).force('meaningfulZ', zForce);
      (simulation as any).force('zCenter', (d3 as any).forceZ(0).strength(config.zCenterStrength));
    }
  }

  // 4. Run Execution
  simulation.stop();
  simulation.tick(config.iterations);

  // 5. Finalize (Z Clamping)
  if (dimension === '3d') {
    for (const node of simNodes) {
      if (node.z !== undefined) {
        node.z = Math.max(config.zClampMin, Math.min(config.zClampMax, node.z));
      }
    }
  }
}
