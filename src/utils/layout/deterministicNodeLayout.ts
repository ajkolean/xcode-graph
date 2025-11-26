/**
 * Deterministic intra-cluster node layout
 * Ring-based with role-aware positioning, no continuous forces
 * Refactored to use modular utilities
 */

import { GraphNode, GraphEdge } from '../../data/mockGraphData';
import { Cluster, PositionedNode, ClusterLayoutConfig } from '../../types/cluster';
import { categorizeNodes, groupNodesByLayer, groupNodesByRole } from './nodeCategories';
import { calculateRingRadius } from './ringCalculations';
import { distributeNodesOnRing } from './angleSectors';

/**
 * Deterministic ring layout for nodes within a cluster
 */
export function layoutNodesInCluster(
  cluster: Cluster,
  config: ClusterLayoutConfig
): PositionedNode[] {
  const positioned: PositionedNode[] = [];
  
  // Separate nodes by type
  const { anchorNodes, regularNodes, testNodes } = categorizeNodes(cluster);
  
  // Step 1: Place anchor(s) at center
  positionAnchorNodes(anchorNodes, cluster, positioned);
  
  // Step 2: Place regular nodes on rings
  positionRegularNodes(regularNodes, cluster, config, positioned);
  
  // Step 3: Position test nodes as satellites
  positionTestNodes(testNodes, cluster, config, positioned);
  
  return positioned;
}

/**
 * Positions anchor nodes at cluster center
 */
function positionAnchorNodes(
  anchorNodes: GraphNode[],
  cluster: Cluster,
  positioned: PositionedNode[]
): void {
  const centerX = 0;
  const centerY = 0;
  
  if (anchorNodes.length === 0) return;
  
  if (anchorNodes.length === 1) {
    const anchor = anchorNodes[0];
    const metadata = cluster.metadata.get(anchor.id)!;
    positioned.push({
      node: anchor,
      clusterId: cluster.id,
      localX: centerX,
      localY: centerY,
      targetRadius: 0,
      targetAngle: 0,
      metadata
    });
  } else {
    // Multiple anchors - small circle
    const anchorRadius = 30;
    anchorNodes.forEach((anchor, i) => {
      const angle = (i / anchorNodes.length) * Math.PI * 2;
      const metadata = cluster.metadata.get(anchor.id)!;
      positioned.push({
        node: anchor,
        clusterId: cluster.id,
        localX: centerX + Math.cos(angle) * anchorRadius,
        localY: centerY + Math.sin(angle) * anchorRadius,
        targetRadius: anchorRadius,
        targetAngle: angle,
        metadata
      });
    });
  }
}

/**
 * Positions regular nodes on rings based on layer
 */
function positionRegularNodes(
  regularNodes: GraphNode[],
  cluster: Cluster,
  config: ClusterLayoutConfig,
  positioned: PositionedNode[]
): void {
  const nodesByLayer = groupNodesByLayer(regularNodes, cluster);
  const layers = Array.from(nodesByLayer.keys()).sort((a, b) => a - b);
  
  layers.forEach(layer => {
    if (layer === 0) return; // Layer 0 is anchors, already placed
    
    const nodesInLayer = nodesByLayer.get(layer)!;
    const radius = calculateRingRadius(layer, nodesInLayer.length, config, cluster.nodes.length);
    
    // Group by role for angular sectors
    const nodesByRole = groupNodesByRole(nodesInLayer, cluster);
    const angleAssignments = distributeNodesOnRing(nodesByRole, radius);
    
    angleAssignments.forEach(assignment => {
      const metadata = cluster.metadata.get(assignment.node.id)!;
      positioned.push({
        node: assignment.node,
        clusterId: cluster.id,
        localX: assignment.x,
        localY: assignment.y,
        targetRadius: radius,
        targetAngle: assignment.angle,
        metadata
      });
    });
  });
}

/**
 * Positions test nodes as satellites around their subjects
 */
function positionTestNodes(
  testNodes: GraphNode[],
  cluster: Cluster,
  config: ClusterLayoutConfig,
  positioned: PositionedNode[]
): void {
  testNodes.forEach(testNode => {
    const metadata = cluster.metadata.get(testNode.id)!;
    const testSubjects = metadata.testSubjects || [];
    
    if (testSubjects.length === 0) {
      // No subject - place near center
      positioned.push({
        node: testNode,
        clusterId: cluster.id,
        localX: 40,
        localY: 0,
        metadata
      });
      return;
    }
    
    // Find subject position
    const subjectId = testSubjects[0];
    const subjectPos = positioned.find(p => p.node.id === subjectId);
    
    if (!subjectPos) {
      positioned.push({
        node: testNode,
        clusterId: cluster.id,
        localX: 40,
        localY: 0,
        metadata
      });
      return;
    }
    
    // Count existing tests for this subject
    const existingTests = positioned.filter(p => {
      const meta = cluster.metadata.get(p.node.id);
      return meta?.role === 'test' && meta.testSubjects?.[0] === subjectId;
    });
    
    // Distribute around subject
    const testRadius = config.testOrbitRadius;
    const testIndex = existingTests.length;
    const angle = -Math.PI / 2 + (testIndex * Math.PI / 2); // Top, right, bottom, left
    
    positioned.push({
      node: testNode,
      clusterId: cluster.id,
      localX: (subjectPos.localX || 0) + Math.cos(angle) * testRadius,
      localY: (subjectPos.localY || 0) + Math.sin(angle) * testRadius,
      metadata
    });
  });
}