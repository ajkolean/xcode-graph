/**
 * Port-Based Edge Routing
 *
 * Computes port positions on cluster boundaries and routes edges through them.
 * Creates a "highway" effect where edges going to similar directions share ports.
 */

import type { ClusterPosition, NodePosition } from '@shared/schemas';
import type { GraphEdge } from '@shared/schemas/graph.schema';
import type { ClusterEdge } from '../cluster-graph';
import type { LayoutConfig } from '../config';
import type { ClusterPort, PortSide, RoutedEdge } from '../types';

// ============================================================================
// Port Side Computation
// ============================================================================

/**
 * Determine which side of a cluster a port should be on based on direction to target.
 * Uses the angle from source cluster center to target cluster center.
 */
export function computePortSide(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
): PortSide {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const angle = Math.atan2(dy, dx);

  // Quadrant boundaries (in radians):
  // EAST: -π/4 to π/4
  // SOUTH: π/4 to 3π/4
  // WEST: 3π/4 to π or -π to -3π/4
  // NORTH: -3π/4 to -π/4

  if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
    return 'EAST';
  }
  if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) {
    return 'SOUTH';
  }
  if (angle >= (-3 * Math.PI) / 4 && angle < -Math.PI / 4) {
    return 'NORTH';
  }
  return 'WEST';
}

/**
 * Get the opposite side of a given port side
 */
function getOppositeSide(side: PortSide): PortSide {
  switch (side) {
    case 'NORTH':
      return 'SOUTH';
    case 'SOUTH':
      return 'NORTH';
    case 'EAST':
      return 'WEST';
    case 'WEST':
      return 'EAST';
  }
}

// ============================================================================
// Port Position Computation
// ============================================================================

interface PortRequirement {
  clusterId: string;
  side: PortSide;
  targetClusterId: string;
  weight: number;
}

/**
 * Compute port positions for all clusters based on their edges.
 *
 * Algorithm:
 * 1. Group cluster edges by source cluster and direction
 * 2. For each side of each cluster, distribute ports evenly along the boundary
 * 3. Order ports by edge weight (heavier edges get more central positions)
 */
export function computeClusterPorts(
  clusterPositions: Map<string, ClusterPosition>,
  clusterEdges: ClusterEdge[],
  config: LayoutConfig,
): Map<string, ClusterPort[]> {
  const result = new Map<string, ClusterPort[]>();

  // Initialize empty port arrays for each cluster
  for (const clusterId of clusterPositions.keys()) {
    result.set(clusterId, []);
  }

  // Step 1: Collect port requirements per cluster per side
  const portRequirements = new Map<string, Map<PortSide, PortRequirement[]>>();

  for (const clusterId of clusterPositions.keys()) {
    portRequirements.set(
      clusterId,
      new Map<PortSide, PortRequirement[]>([
        ['NORTH', []],
        ['SOUTH', []],
        ['EAST', []],
        ['WEST', []],
      ]),
    );
  }

  // Process each cluster edge to determine port requirements
  for (const edge of clusterEdges) {
    const sourcePos = clusterPositions.get(edge.source);
    const targetPos = clusterPositions.get(edge.target);

    if (!sourcePos || !targetPos) continue;

    // Determine exit side for source cluster
    const exitSide = computePortSide(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y);

    // Add port requirement for source (exit)
    const sourceReqs = portRequirements.get(edge.source);
    if (sourceReqs) {
      sourceReqs.get(exitSide)?.push({
        clusterId: edge.source,
        side: exitSide,
        targetClusterId: edge.target,
        weight: edge.weight,
      });
    }

    // Determine entry side for target cluster (opposite of exit direction from target's perspective)
    const entrySide = getOppositeSide(exitSide);

    // Add port requirement for target (entry)
    const targetReqs = portRequirements.get(edge.target);
    if (targetReqs) {
      targetReqs.get(entrySide)?.push({
        clusterId: edge.target,
        side: entrySide,
        targetClusterId: edge.source,
        weight: edge.weight,
      });
    }
  }

  // Step 2: Create ports for each cluster side
  for (const [clusterId, sideReqs] of portRequirements) {
    const clusterPos = clusterPositions.get(clusterId);
    if (!clusterPos) continue;

    const clusterPorts: ClusterPort[] = [];

    for (const [side, requirements] of sideReqs) {
      if (requirements.length === 0) continue;

      // Sort by weight (descending) so heavier edges get central positions
      requirements.sort((a, b) => b.weight - a.weight);

      // Limit ports per side
      const limitedReqs = requirements.slice(0, config.maxPortsPerSide);

      // Calculate port positions along the boundary
      const ports = computePortPositionsOnSide(
        clusterId,
        side,
        clusterPos,
        limitedReqs.length,
        config,
      );

      clusterPorts.push(...ports);
    }

    result.set(clusterId, clusterPorts);
  }

  return result;
}

/**
 * Compute port positions along one side of a cluster boundary.
 */
function computePortPositionsOnSide(
  clusterId: string,
  side: PortSide,
  clusterPos: ClusterPosition,
  portCount: number,
  config: LayoutConfig,
): ClusterPort[] {
  const ports: ClusterPort[] = [];

  if (portCount === 0) return ports;

  const halfWidth = clusterPos.width / 2;
  const halfHeight = clusterPos.height / 2;
  const margin = config.portMargin;

  // Calculate the usable length along this side (excluding margins)
  let sideLength: number;
  let startX: number;
  let startY: number;
  let dx: number;
  let dy: number;

  switch (side) {
    case 'NORTH':
      sideLength = clusterPos.width - 2 * margin;
      startX = clusterPos.x - halfWidth + margin;
      startY = clusterPos.y - halfHeight;
      dx = sideLength / (portCount + 1);
      dy = 0;
      break;
    case 'SOUTH':
      sideLength = clusterPos.width - 2 * margin;
      startX = clusterPos.x - halfWidth + margin;
      startY = clusterPos.y + halfHeight;
      dx = sideLength / (portCount + 1);
      dy = 0;
      break;
    case 'EAST':
      sideLength = clusterPos.height - 2 * margin;
      startX = clusterPos.x + halfWidth;
      startY = clusterPos.y - halfHeight + margin;
      dx = 0;
      dy = sideLength / (portCount + 1);
      break;
    case 'WEST':
      sideLength = clusterPos.height - 2 * margin;
      startX = clusterPos.x - halfWidth;
      startY = clusterPos.y - halfHeight + margin;
      dx = 0;
      dy = sideLength / (portCount + 1);
      break;
  }

  // Create evenly distributed ports
  for (let i = 0; i < portCount; i++) {
    ports.push({
      id: `${clusterId}_${side}_${i}`,
      clusterId,
      side,
      x: startX + dx * (i + 1),
      y: startY + dy * (i + 1),
      index: i,
    });
  }

  return ports;
}

// ============================================================================
// Edge-to-Port Assignment
// ============================================================================

interface EdgePortAssignment {
  sourceClusterId: string;
  targetClusterId: string;
  sourcePort: ClusterPort;
  targetPort: ClusterPort;
  weight: number;
}

/**
 * Assign cluster edges to their corresponding ports.
 */
function assignClusterEdgesToPorts(
  clusterEdges: ClusterEdge[],
  clusterPorts: Map<string, ClusterPort[]>,
  clusterPositions: Map<string, ClusterPosition>,
): Map<string, EdgePortAssignment> {
  const assignments = new Map<string, EdgePortAssignment>();

  for (const edge of clusterEdges) {
    const sourcePos = clusterPositions.get(edge.source);
    const targetPos = clusterPositions.get(edge.target);

    if (!sourcePos || !targetPos) continue;

    const exitSide = computePortSide(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y);
    const entrySide = getOppositeSide(exitSide);

    const sourcePorts = clusterPorts.get(edge.source) ?? [];
    const targetPorts = clusterPorts.get(edge.target) ?? [];

    // Find best matching port on source side
    const sourcePort = findBestPort(sourcePorts, exitSide, targetPos.x, targetPos.y);
    // Find best matching port on target side
    const targetPort = findBestPort(targetPorts, entrySide, sourcePos.x, sourcePos.y);

    if (sourcePort && targetPort) {
      const key = `${edge.source}->${edge.target}`;
      assignments.set(key, {
        sourceClusterId: edge.source,
        targetClusterId: edge.target,
        sourcePort,
        targetPort,
        weight: edge.weight,
      });
    }
  }

  return assignments;
}

/**
 * Find the best port on a given side based on proximity to target direction.
 */
function findBestPort(
  ports: ClusterPort[],
  side: PortSide,
  targetX: number,
  targetY: number,
): ClusterPort | undefined {
  const sidePorts = ports.filter((p) => p.side === side);
  if (sidePorts.length === 0) return undefined;

  // Find port closest to the line toward the target
  let bestPort = sidePorts[0];
  let bestDist = Number.POSITIVE_INFINITY;

  for (const port of sidePorts) {
    // Distance from port to the target direction
    const dist = Math.hypot(port.x - targetX, port.y - targetY);
    if (dist < bestDist) {
      bestDist = dist;
      bestPort = port;
    }
  }

  return bestPort;
}

// ============================================================================
// Routed Edge Computation
// ============================================================================

/**
 * Compute routed edges for all node-level edges that cross cluster boundaries.
 */
export function computeRoutedEdges(
  edges: GraphEdge[],
  nodePositions: Map<string, NodePosition>,
  clusterPositions: Map<string, ClusterPosition>,
  clusterPorts: Map<string, ClusterPort[]>,
  clusterEdges: ClusterEdge[],
  nodeToCluster: Map<string, string>,
  config: LayoutConfig,
): RoutedEdge[] {
  if (!config.portRoutingEnabled) {
    return [];
  }

  const routedEdges: RoutedEdge[] = [];

  // First, get cluster-level port assignments
  const clusterPortAssignments = assignClusterEdgesToPorts(
    clusterEdges,
    clusterPorts,
    clusterPositions,
  );

  // Process each node-level edge
  for (const edge of edges) {
    const sourceClusterId = nodeToCluster.get(edge.source);
    const targetClusterId = nodeToCluster.get(edge.target);

    // Skip intra-cluster edges
    if (!sourceClusterId || !targetClusterId || sourceClusterId === targetClusterId) {
      continue;
    }

    // Get the cluster-level port assignment
    const assignmentKey = `${sourceClusterId}->${targetClusterId}`;
    const assignment = clusterPortAssignments.get(assignmentKey);

    if (!assignment) continue;

    // Get node positions (relative to cluster center)
    const sourceNodePos = nodePositions.get(edge.source);
    const targetNodePos = nodePositions.get(edge.target);

    if (!sourceNodePos || !targetNodePos) continue;

    // Compute waypoints for the routed edge
    // Simple approach: straight line from source port to target port
    // More advanced: add bend points to create orthogonal routing
    const waypoints = computeWaypoints(
      assignment.sourcePort,
      assignment.targetPort,
      clusterPositions.get(sourceClusterId),
      clusterPositions.get(targetClusterId),
    );

    routedEdges.push({
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
      sourceClusterId,
      targetClusterId,
      sourcePort: assignment.sourcePort,
      targetPort: assignment.targetPort,
      waypoints,
      weight: assignment.weight,
    });
  }

  return routedEdges;
}

/**
 * Compute intermediate waypoints between two ports.
 * Creates orthogonal routing with bend points.
 */
function computeWaypoints(
  sourcePort: ClusterPort,
  targetPort: ClusterPort,
  _sourceCluster?: ClusterPosition,
  _targetCluster?: ClusterPosition,
): Array<{ x: number; y: number }> {
  const waypoints: Array<{ x: number; y: number }> = [];

  // Calculate midpoint for a simple two-segment orthogonal route
  const midX = (sourcePort.x + targetPort.x) / 2;
  const midY = (sourcePort.y + targetPort.y) / 2;

  // Determine routing based on port orientations
  if (
    (sourcePort.side === 'EAST' || sourcePort.side === 'WEST') &&
    (targetPort.side === 'EAST' || targetPort.side === 'WEST')
  ) {
    // Horizontal exit and entry - route via vertical midline
    waypoints.push({ x: midX, y: sourcePort.y });
    waypoints.push({ x: midX, y: targetPort.y });
  } else if (
    (sourcePort.side === 'NORTH' || sourcePort.side === 'SOUTH') &&
    (targetPort.side === 'NORTH' || targetPort.side === 'SOUTH')
  ) {
    // Vertical exit and entry - route via horizontal midline
    waypoints.push({ x: sourcePort.x, y: midY });
    waypoints.push({ x: targetPort.x, y: midY });
  } else {
    // Mixed orientation - single bend point
    if (sourcePort.side === 'EAST' || sourcePort.side === 'WEST') {
      // Exit horizontal, enter vertical
      waypoints.push({ x: targetPort.x, y: sourcePort.y });
    } else {
      // Exit vertical, enter horizontal
      waypoints.push({ x: sourcePort.x, y: targetPort.y });
    }
  }

  return waypoints;
}
