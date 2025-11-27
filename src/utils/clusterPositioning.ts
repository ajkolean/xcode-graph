import type { GraphNode } from '../data/mockGraphData';
import {
  type Cluster,
  type ClusterLayoutConfig,
  DEFAULT_CLUSTER_CONFIG,
  type PositionedNode,
} from '../types/cluster';

// Helper: Calculate sector angles for a role
function calculateSectorAngles(
  role: string,
  roleSectors: Record<string, { start: number; end: number }>,
  useSectors: boolean,
): { startAngle: number; angleSpan: number } {
  if (!useSectors) {
    return { startAngle: 0, angleSpan: 2 * Math.PI };
  }

  const sector = roleSectors[role];
  const startAngle = sector.start;
  let endAngle = sector.end;

  if (endAngle < startAngle) {
    endAngle += 2 * Math.PI;
  }

  return { startAngle, angleSpan: endAngle - startAngle };
}

// Helper: Calculate angle for a node within a sector
function calculateNodeAngle(
  nodeIndex: number,
  totalNodes: number,
  startAngle: number,
  angleSpan: number,
  useSectors: boolean,
): number {
  if (totalNodes === 1) {
    return startAngle + angleSpan / 2;
  }

  const padding = useSectors ? 0.1 : 0;
  const usableSpan = angleSpan * (1 - padding * 2);
  const angle = startAngle + angleSpan * padding + (nodeIndex / (totalNodes - 1)) * usableSpan;

  // Normalize angle to [-π, π]
  return ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
}

// Helper: Position nodes within a sector
function positionNodesInSector(
  nodesForRole: GraphNode[],
  startAngle: number,
  angleSpan: number,
  useSectors: boolean,
  radius: number,
  centerX: number,
  centerY: number,
  cluster: Cluster,
  positioned: PositionedNode[],
): void {
  for (let i = 0; i < nodesForRole.length; i++) {
    const node = nodesForRole[i];
    const metadata = cluster.metadata.get(node.id)!;
    const angle = calculateNodeAngle(i, nodesForRole.length, startAngle, angleSpan, useSectors);

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    positioned.push({
      node,
      x,
      y,
      clusterId: cluster.id,
      metadata,
      localX: x,
      localY: y,
      targetRadius: radius,
      targetAngle: angle,
    });
  }
}

/**
 * Calculates initial radial positions for nodes in a cluster
 */
export function calculateRadialPositions(
  cluster: Cluster,
  config: ClusterLayoutConfig = DEFAULT_CLUSTER_CONFIG,
): PositionedNode[] {
  const positioned: PositionedNode[] = [];
  const centerX = 0;
  const centerY = 0;

  // Group nodes by layer and role
  const nodesByLayer = new Map<number, GraphNode[]>();
  const testNodes: GraphNode[] = [];

  cluster.nodes.forEach((node) => {
    const metadata = cluster.metadata.get(node.id)!;

    if (metadata.role === 'test') {
      testNodes.push(node);
    } else {
      const layer = metadata.layer;
      if (!nodesByLayer.has(layer)) {
        nodesByLayer.set(layer, []);
      }
      nodesByLayer.get(layer)!.push(node);
    }
  });

  // Position non-test nodes by layer with angular grouping by role
  const layers = Array.from(nodesByLayer.keys()).sort((a, b) => a - b);

  layers.forEach((layer) => {
    const nodesInLayer = nodesByLayer.get(layer)!;
    const baseRadius = layer === 0 ? 0 : config.layerSpacing * layer;

    // Calculate required spacing for this layer
    // Account for node size + label space (labels are ~30px below nodes)
    const nodeSpacing = config.minNodeSpacing;
    const requiredCircumference = nodesInLayer.length * nodeSpacing;
    const minRadiusForSpacing = requiredCircumference / (2 * Math.PI);

    // Use the larger of base radius or required radius for proper spacing
    const adjustedRadius = layer === 0 ? 0 : Math.max(baseRadius, minRadiusForSpacing);

    // Group nodes by role for angular positioning
    const nodesByRole = new Map<string, GraphNode[]>();
    nodesInLayer.forEach((node) => {
      const metadata = cluster.metadata.get(node.id)!;
      const role = metadata.role;
      if (!nodesByRole.has(role)) {
        nodesByRole.set(role, []);
      }
      nodesByRole.get(role)!.push(node);
    });

    // Define angular sectors for each role (in radians)
    const roleSectors: Record<string, { start: number; end: number }> = {
      entry: { start: -Math.PI / 2, end: Math.PI / 6 }, // Top (270° to 30°)
      'internal-framework': { start: Math.PI / 6, end: (2 * Math.PI) / 3 }, // Right (30° to 120°)
      'internal-lib': { start: (2 * Math.PI) / 3, end: (7 * Math.PI) / 6 }, // Bottom (120° to 210°)
      utility: { start: (7 * Math.PI) / 6, end: (3 * Math.PI) / 2 }, // Left (210° to 270°)
      tool: { start: (3 * Math.PI) / 2, end: 2 * Math.PI }, // Left-top (270° to 360°)
    };

    // If there's only one role with all nodes, distribute evenly around full circle
    const activeRoles = Array.from(nodesByRole.keys());
    const useSectors = activeRoles.length > 1 || nodesInLayer.length <= 6;

    // Position each role group within its sector (or full circle if single role)
    const roles = ['entry', 'internal-framework', 'internal-lib', 'utility', 'tool'];
    for (const role of roles) {
      const nodesForRole = nodesByRole.get(role) || [];
      if (nodesForRole.length === 0) continue;

      const { startAngle, angleSpan } = calculateSectorAngles(role, roleSectors, useSectors);
      positionNodesInSector(nodesForRole, startAngle, angleSpan, useSectors, adjustedRadius, centerX, centerY, cluster, positioned);
    }
  });

  // Position test nodes as satellites around their subjects
  positionTestNodes(testNodes, cluster, positioned, config, centerX, centerY, layers);

  return positioned;
}

/**
 * Positions test nodes as satellites around their subject nodes
 */
function positionTestNodes(
  testNodes: GraphNode[],
  cluster: Cluster,
  positioned: PositionedNode[],
  config: ClusterLayoutConfig,
  centerX: number,
  centerY: number,
  layers: number[],
): void {
  testNodes.forEach((testNode) => {
    const metadata = cluster.metadata.get(testNode.id)!;
    const subjects = metadata.testSubjects || [];

    if (subjects.length === 0) {
      // No clear subject, place in outer ring
      const maxRadius = Math.max(
        config.layerSpacing * (layers.length + 1),
        config.layerSpacing * 2,
      );
      positioned.push({
        node: testNode,
        x: centerX + maxRadius,
        y: centerY,
        clusterId: cluster.id,
        metadata,
        localX: maxRadius,
        localY: 0,
        targetRadius: maxRadius,
        targetAngle: 0,
      });
      return;
    }

    // Position around primary subject (or between multiple subjects)
    if (subjects.length === 1) {
      positionSingleSubjectTest(
        testNode,
        subjects[0],
        cluster,
        positioned,
        config,
        centerX,
        centerY,
        testNodes,
      );
    } else {
      positionMultiSubjectTest(testNode, subjects, cluster, positioned, config, centerX, centerY);
    }
  });
}

/**
 * Position a test node that has a single subject
 */
function positionSingleSubjectTest(
  testNode: GraphNode,
  subjectId: string,
  cluster: Cluster,
  positioned: PositionedNode[],
  config: ClusterLayoutConfig,
  centerX: number,
  centerY: number,
  testNodes: GraphNode[],
): void {
  const subjectPos = positioned.find((p) => p.node.id === subjectId);
  const metadata = cluster.metadata.get(testNode.id)!;

  if (!subjectPos) {
    // Subject not found, place at origin
    positioned.push({
      node: testNode,
      x: centerX,
      y: centerY + config.testOrbitRadius,
      clusterId: cluster.id,
      metadata,
      localX: 0,
      localY: config.testOrbitRadius,
      targetRadius: config.testOrbitRadius,
      targetAngle: Math.PI / 2,
    });
    return;
  }

  // Calculate satellite position
  // Count how many tests this subject has
  const testsForSubject = testNodes.filter((tn) => {
    const tm = cluster.metadata.get(tn.id)!;
    return tm.testSubjects?.includes(subjectId);
  });
  const testIndex = testsForSubject.indexOf(testNode);
  const testCount = testsForSubject.length;

  // Distribute tests evenly around subject
  const angle = (testIndex / testCount) * 2 * Math.PI;
  const x = subjectPos.x + config.testOrbitRadius * Math.cos(angle);
  const y = subjectPos.y + config.testOrbitRadius * Math.sin(angle);

  positioned.push({
    node: testNode,
    x,
    y,
    clusterId: cluster.id,
    metadata,
    localX: x,
    localY: y,
    targetRadius: config.testOrbitRadius,
    targetAngle: angle,
  });
}

/**
 * Position a test node that has multiple subjects
 */
function positionMultiSubjectTest(
  testNode: GraphNode,
  subjects: string[],
  cluster: Cluster,
  positioned: PositionedNode[],
  config: ClusterLayoutConfig,
  centerX: number,
  centerY: number,
): void {
  const metadata = cluster.metadata.get(testNode.id)!;
  const subjectPositions = subjects
    .map((subjectId) => positioned.find((p) => p.node.id === subjectId))
    .filter((p): p is PositionedNode => p !== undefined);

  if (subjectPositions.length === 0) {
    // No subjects found, place at origin
    positioned.push({
      node: testNode,
      x: centerX,
      y: centerY + config.testOrbitRadius,
      clusterId: cluster.id,
      metadata,
      localX: 0,
      localY: config.testOrbitRadius,
      targetRadius: config.testOrbitRadius,
      targetAngle: Math.PI / 2,
    });
    return;
  }

  // Calculate centroid of subject positions
  const centroidX = subjectPositions.reduce((sum, p) => sum + p.x, 0) / subjectPositions.length;
  const centroidY = subjectPositions.reduce((sum, p) => sum + p.y, 0) / subjectPositions.length;

  // Position slightly outward from centroid
  const angle = Math.atan2(centroidY, centroidX);
  const distance = Math.sqrt(centroidX * centroidX + centroidY * centroidY);
  const offsetDist = distance + config.testOrbitRadius;

  const x = offsetDist * Math.cos(angle);
  const y = offsetDist * Math.sin(angle);

  positioned.push({
    node: testNode,
    x,
    y,
    clusterId: cluster.id,
    metadata,
    localX: x,
    localY: y,
    targetRadius: offsetDist,
    targetAngle: angle,
  });
}

/**
 * Calculate dynamic bounds for a cluster based on actual positioned nodes
 * Creates tight-fitting boxes with minimal padding
 */
export function calculateClusterBounds(
  positionedNodes: PositionedNode[],
  config: ClusterLayoutConfig = DEFAULT_CLUSTER_CONFIG,
): { width: number; height: number; x: number; y: number } {
  // Safety check
  if (!positionedNodes || positionedNodes.length === 0) {
    const minSize = config.layerSpacing * 2 + config.clusterPadding * 2;
    return { width: minSize, height: minSize, x: 0, y: 0 };
  }

  // Find the actual bounding box of positioned nodes
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  positionedNodes.forEach((posNode) => {
    const x = posNode.localX || posNode.x;
    const y = posNode.localY || posNode.y;

    // Account for node size (radius) + label height (~25px below node)
    const nodeRadius = 20;
    const labelSpace = 25;

    minX = Math.min(minX, x - nodeRadius);
    maxX = Math.max(maxX, x + nodeRadius);
    minY = Math.min(minY, y - nodeRadius);
    maxY = Math.max(maxY, y + nodeRadius + labelSpace); // Extra space for labels
  });

  // Calculate dimensions with padding
  const padding = config.clusterPadding;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  // Use actual content size - no artificial minimums!
  // The ring radius scaling already handles visual variety
  const finalWidth = width;
  const finalHeight = height;

  return {
    width: finalWidth,
    height: finalHeight,
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
}
