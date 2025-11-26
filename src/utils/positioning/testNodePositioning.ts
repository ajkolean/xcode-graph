/**
 * Test node satellite positioning utilities
 */

import { GraphNode } from '../../data/mockGraphData';
import { Cluster, PositionedNode, ClusterLayoutConfig } from '../../types/cluster';

/**
 * Positions test nodes as satellites around their test subjects
 */
export function positionTestNodes(
  testNodes: GraphNode[],
  cluster: Cluster,
  allPositioned: PositionedNode[],
  config: ClusterLayoutConfig
): PositionedNode[] {
  const positioned: PositionedNode[] = [];
  
  testNodes.forEach(testNode => {
    const metadata = cluster.metadata.get(testNode.id)!;
    const testSubjects = metadata.testSubjects || [];
    
    if (testSubjects.length === 0) {
      // No subject - position near center
      positioned.push({
        node: testNode,
        clusterId: cluster.id,
        localX: 0,
        localY: 0,
        metadata
      });
      return;
    }
    
    // Find position of primary test subject
    const subjectId = testSubjects[0];
    const subjectPos = allPositioned.find(p => p.node.id === subjectId);
    
    if (!subjectPos) {
      // Subject not found - position near center
      positioned.push({
        node: testNode,
        clusterId: cluster.id,
        localX: 0,
        localY: 0,
        metadata
      });
      return;
    }
    
    // Calculate test satellite position
    const orbitAngle = calculateTestOrbitAngle(testNode, testSubjects, cluster, allPositioned);
    const orbitRadius = config.testOrbitRadius;
    
    const x = (subjectPos.localX || 0) + Math.cos(orbitAngle) * orbitRadius;
    const y = (subjectPos.localY || 0) + Math.sin(orbitAngle) * orbitRadius;
    
    positioned.push({
      node: testNode,
      clusterId: cluster.id,
      localX: x,
      localY: y,
      metadata
    });
  });
  
  return positioned;
}

/**
 * Calculates orbit angle for a test node to minimize overlap
 */
function calculateTestOrbitAngle(
  testNode: GraphNode,
  testSubjects: string[],
  cluster: Cluster,
  allPositioned: PositionedNode[]
): number {
  // Count how many test nodes are already orbiting this subject
  const subjectId = testSubjects[0];
  const existingTestsAroundSubject = allPositioned.filter(p => {
    const meta = cluster.metadata.get(p.node.id);
    return meta?.role === 'test' && meta.testSubjects?.[0] === subjectId;
  });
  
  const testIndex = existingTestsAroundSubject.length;
  
  // Distribute tests evenly around the subject
  // Start at -90° (top) and go clockwise
  const baseAngle = -Math.PI / 2;
  const angleStep = (2 * Math.PI) / 4; // Max 4 tests per subject
  
  return baseAngle + angleStep * testIndex;
}

/**
 * Checks if a test node has any valid test subjects
 */
export function hasValidTestSubjects(
  testNode: GraphNode,
  cluster: Cluster,
  allPositioned: PositionedNode[]
): boolean {
  const metadata = cluster.metadata.get(testNode.id);
  if (!metadata?.testSubjects || metadata.testSubjects.length === 0) {
    return false;
  }
  
  const subjectId = metadata.testSubjects[0];
  return allPositioned.some(p => p.node.id === subjectId);
}
