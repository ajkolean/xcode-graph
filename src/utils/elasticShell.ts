/**
 * Elastic Shell: Cluster boundaries as flexible membranes
 *
 * Each cluster has a circular boundary that behaves like a soft elastic membrane:
 * - Shell applies inward compression (wants to stay small)
 * - Nodes apply outward pressure (based on mass, ring, distance)
 * - Equilibrium finds the minimum necessary radius
 *
 * Result: Tight when nodes are few, expands for high-mass systems
 */

import type { NodeMass } from './massCalculation';

export interface ElasticShellConfig {
  baseRadius: number; // Starting point
  compressionFactor: number; // How hard shell resists expansion
  alpha: number; // Damping (convergence speed)
  iterations: number; // Number of relaxation steps
  minRadius: number; // Floor (never smaller than this)
  maxRadius: number; // Ceiling (never larger than this)
}

const DEFAULT_ELASTIC_CONFIG: ElasticShellConfig = {
  baseRadius: 60, // Reduced from 80
  compressionFactor: 0.35, // Increased from 0.25 (shell pulls even harder!)
  alpha: 0.15,
  iterations: 25,
  minRadius: 50, // Reduced from 60
  maxRadius: 280, // Reduced from 300
};

export interface NodeWithPosition {
  id: string;
  x: number; // Relative to cluster center
  y: number; // Relative to cluster center
  ring: number;
  mass?: number;
}

/**
 * Compute elastic shell radius for a cluster
 *
 * The shell finds equilibrium between:
 * - Inward compression (shell wants to shrink)
 * - Outward pressure from nodes (mass-based)
 */
export function computeElasticShellRadius(
  nodes: NodeWithPosition[],
  masses: Map<string, NodeMass>,
  config: ElasticShellConfig = DEFAULT_ELASTIC_CONFIG,
): number {
  if (nodes.length === 0) return config.minRadius;

  // Step 1: Initial guess based on maximum ring
  const maxRing = Math.max(...nodes.map((n) => n.ring), 0);
  let radius = config.baseRadius + maxRing * 40; // Reduced from 65 to 40

  // Ensure within bounds
  radius = Math.max(config.minRadius, Math.min(config.maxRadius, radius));

  // Step 2: Iterative relaxation
  for (let iter = 0; iter < config.iterations; iter++) {
    // Compute outward pressure from nodes
    const outwardPressure = computeOutwardPressure(nodes, masses);

    // Compute inward compression from shell
    const idealRadius = config.baseRadius + maxRing * 40; // Reduced from 65 to 40
    const inwardCompression = (radius - idealRadius) * config.compressionFactor;

    // Net force
    const netForce = outwardPressure - inwardCompression;

    // Update radius
    radius += netForce * config.alpha;

    // Clamp to bounds
    radius = Math.max(config.minRadius, Math.min(config.maxRadius, radius));

    // Early exit if converged
    if (Math.abs(netForce) < 0.5) {
      break;
    }
  }

  // Step 3: Minimal padding (shell wants to be tight!)
  const padding = 20; // Reduced from 40
  radius = radius + padding;

  // Final clamp
  return Math.max(config.minRadius, Math.min(config.maxRadius, radius));
}

/**
 * Compute total outward pressure from all nodes
 *
 * Each node pushes outward based on:
 * - Its mass (heavier nodes push harder)
 * - Its distance from center (outer nodes push more)
 * - Its ring index (inner rings push less)
 */
function computeOutwardPressure(nodes: NodeWithPosition[], masses: Map<string, NodeMass>): number {
  let totalPressure = 0;

  for (const node of nodes) {
    // Get node mass (default to 1.0 if not computed)
    const massData = masses.get(node.id);
    const mass = massData ? massData.mass : 1.0;

    // Distance from cluster center
    const distFromCenter = Math.sqrt(node.x * node.x + node.y * node.y);

    // Avoid division by zero
    if (distFromCenter < 1) continue;

    // Ring influence (inner rings push less, outer rings push more)
    const ringFactor = 1 + node.ring * 0.3;

    // Pressure formula: mass × ringFactor / distance²
    // (Inverse square law - like gravity!)
    const pressure = (mass * ringFactor) / (distFromCenter * distFromCenter);

    totalPressure += pressure;
  }

  return totalPressure;
}

/**
 * Compute elastic shell with mass-weighted influence
 *
 * Alternative approach: weight by mass more aggressively
 */
export function computeMassWeightedShellRadius(
  nodes: NodeWithPosition[],
  masses: Map<string, NodeMass>,
  config: ElasticShellConfig = DEFAULT_ELASTIC_CONFIG,
): number {
  if (nodes.length === 0) return config.minRadius;

  // Find the maximum distance of any node (MEC approach)
  let maxDistance = 0;
  let totalMass = 0;

  for (const node of nodes) {
    const dist = Math.sqrt(node.x * node.x + node.y * node.y);
    maxDistance = Math.max(maxDistance, dist);

    const massData = masses.get(node.id);
    if (massData) {
      totalMass += massData.mass;
    }
  }

  // Base radius from MEC
  let radius = maxDistance;

  // Mass expansion factor (more mass = larger shell)
  const massExpansionFactor = Math.log(1 + totalMass) * 15;
  radius += massExpansionFactor;

  // Add padding
  const padding = 50;
  radius += padding;

  // Clamp
  return Math.max(config.minRadius, Math.min(config.maxRadius, radius));
}

/**
 * Compute adaptive shell radius based on node density
 *
 * Creates tighter clusters when nodes are dense,
 * looser clusters when nodes are sparse
 */
export function computeAdaptiveShellRadius(
  nodes: NodeWithPosition[],
  masses: Map<string, NodeMass>,
  config: ElasticShellConfig = DEFAULT_ELASTIC_CONFIG,
): number {
  if (nodes.length === 0) return config.minRadius;

  // Compute density: total mass / area
  let totalMass = 0;
  let maxDistance = 0;

  for (const node of nodes) {
    const dist = Math.sqrt(node.x * node.x + node.y * node.y);
    maxDistance = Math.max(maxDistance, dist);

    const massData = masses.get(node.id);
    if (massData) {
      totalMass += massData.mass;
    }
  }

  // Current area
  const currentArea = Math.PI * maxDistance * maxDistance;
  const _density = currentArea > 0 ? totalMass / currentArea : 0;

  // Target density (higher = tighter clusters)
  const targetDensity = 0.15;

  // Compute radius to achieve target density
  // area = totalMass / targetDensity
  // radius = sqrt(area / π)
  const targetArea = totalMass / targetDensity;
  let radius = Math.sqrt(targetArea / Math.PI);

  // Ensure it's at least as large as MEC
  radius = Math.max(radius, maxDistance + 40);

  // Clamp
  return Math.max(config.minRadius, Math.min(config.maxRadius, radius));
}

/**
 * Simple visualization helper: show shell state
 */
export interface ShellDebugInfo {
  radius: number;
  outwardPressure: number;
  inwardCompression: number;
  netForce: number;
  iterations: number;
  converged: boolean;
}

/**
 * Compute shell with debug information
 */
export function computeElasticShellWithDebug(
  nodes: NodeWithPosition[],
  masses: Map<string, NodeMass>,
  config: ElasticShellConfig = DEFAULT_ELASTIC_CONFIG,
): ShellDebugInfo {
  if (nodes.length === 0) {
    return {
      radius: config.minRadius,
      outwardPressure: 0,
      inwardCompression: 0,
      netForce: 0,
      iterations: 0,
      converged: true,
    };
  }

  const maxRing = Math.max(...nodes.map((n) => n.ring), 0);
  let radius = config.baseRadius + maxRing * 40; // Reduced from 65 to 40
  radius = Math.max(config.minRadius, Math.min(config.maxRadius, radius));

  let finalOutward = 0;
  let finalInward = 0;
  let finalNet = 0;
  let converged = false;

  for (let iter = 0; iter < config.iterations; iter++) {
    finalOutward = computeOutwardPressure(nodes, masses);

    const idealRadius = config.baseRadius + maxRing * 40; // Reduced from 65 to 40
    finalInward = (radius - idealRadius) * config.compressionFactor;

    finalNet = finalOutward - finalInward;

    radius += finalNet * config.alpha;
    radius = Math.max(config.minRadius, Math.min(config.maxRadius, radius));

    if (Math.abs(finalNet) < 0.5) {
      converged = true;
      break;
    }
  }

  const padding = 40;
  radius = radius + padding;
  radius = Math.max(config.minRadius, Math.min(config.maxRadius, radius));

  return {
    radius,
    outwardPressure: finalOutward,
    inwardCompression: finalInward,
    netForce: finalNet,
    iterations: config.iterations,
    converged,
  };
}
