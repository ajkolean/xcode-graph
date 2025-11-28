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

import type { NodeMass } from './mass';

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
