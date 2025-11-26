/**
 * Ring radius and spacing calculations
 * Used for deterministic radial node positioning
 */

import { ClusterLayoutConfig } from '../../types/cluster';

/**
 * Calculates ring radius based on layer and node count
 * Ensures enough space for all nodes without overlap
 * Scales with total cluster size for visual variety
 */
export function calculateRingRadius(
  layer: number,
  nodeCount: number,
  config: ClusterLayoutConfig,
  totalClusterNodeCount?: number
): number {
  // Scale base spacing based on cluster density
  // Small clusters (1-5 nodes): 0.7x spacing (tighter)
  // Medium clusters (6-10 nodes): 1.0x spacing (normal)
  // Large clusters (11-20 nodes): 1.3x spacing (more room)
  // XL clusters (20+ nodes): 1.5x spacing (spacious)
  let scaleFactor = 1.0;
  if (totalClusterNodeCount) {
    if (totalClusterNodeCount <= 5) {
      scaleFactor = 0.65;
    } else if (totalClusterNodeCount <= 8) {
      scaleFactor = 0.85;
    } else if (totalClusterNodeCount <= 12) {
      scaleFactor = 1.0;
    } else if (totalClusterNodeCount <= 16) {
      scaleFactor = 1.2;
    } else {
      scaleFactor = 1.4;
    }
  }
  
  const baseRadius = config.layerSpacing * layer * scaleFactor;
  
  // Ensure enough circumference for nodes
  const minSpacing = config.minNodeSpacing;
  const requiredCircumference = nodeCount * minSpacing;
  const minRadius = requiredCircumference / (2 * Math.PI);
  
  return Math.max(baseRadius, minRadius);
}

/**
 * Calculates angle for positioning a node on a ring
 */
export function calculateNodeAngle(
  index: number,
  totalNodes: number,
  angleOffset: number = 0
): number {
  const angleStep = (Math.PI * 2) / totalNodes;
  return angleOffset + index * angleStep;
}

/**
 * Converts polar coordinates to cartesian
 */
export function polarToCartesian(
  radius: number,
  angle: number
): { x: number; y: number } {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}