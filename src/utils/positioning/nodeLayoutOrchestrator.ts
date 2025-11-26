/**
 * Orchestrates the complete node layout within a cluster
 */

import { GraphNode } from '../../data/mockGraphData';
import { Cluster, PositionedNode, ClusterLayoutConfig } from '../../types/cluster';
import { calculateLayerRadius, groupNodesByRole, shouldUseSectors } from './layerPositioning';
import { ROLE_SECTORS, ROLE_ORDER, calculateAnglesInSector, getAngleSpan } from './angleCalculation';
import { positionTestNodes } from './testNodePositioning';

/**
 * Positions all nodes within a cluster
 */
export function layoutClusterNodes(
  cluster: Cluster,
  config: ClusterLayoutConfig
): PositionedNode[] {
  const positioned: PositionedNode[] = [];
  
  // Separate test nodes from regular nodes
  const { regularNodes, testNodes } = separateTestNodes(cluster);
  
  // Group regular nodes by layer
  const nodesByLayer = groupNodesByLayer(regularNodes, cluster);
  
  // Position regular nodes layer by layer
  const layers = Array.from(nodesByLayer.keys()).sort((a, b) => a - b);
  
  layers.forEach(layer => {
    const nodesInLayer = nodesByLayer.get(layer)!;
    const layerPositions = positionNodesInLayer(
      layer,
      nodesInLayer,
      cluster,
      config
    );
    positioned.push(...layerPositions);
  });
  
  // Position test nodes as satellites
  const testPositions = positionTestNodes(testNodes, cluster, positioned, config);
  positioned.push(...testPositions);
  
  return positioned;
}

/**
 * Separates test nodes from regular nodes
 */
function separateTestNodes(cluster: Cluster): {
  regularNodes: GraphNode[];
  testNodes: GraphNode[];
} {
  const regularNodes: GraphNode[] = [];
  const testNodes: GraphNode[] = [];
  
  cluster.nodes.forEach(node => {
    const metadata = cluster.metadata.get(node.id)!;
    if (metadata.role === 'test') {
      testNodes.push(node);
    } else {
      regularNodes.push(node);
    }
  });
  
  return { regularNodes, testNodes };
}

/**
 * Groups nodes by their layer
 */
function groupNodesByLayer(
  nodes: GraphNode[],
  cluster: Cluster
): Map<number, GraphNode[]> {
  const nodesByLayer = new Map<number, GraphNode[]>();
  
  nodes.forEach(node => {
    const metadata = cluster.metadata.get(node.id)!;
    const layer = metadata.layer;
    if (!nodesByLayer.has(layer)) {
      nodesByLayer.set(layer, []);
    }
    nodesByLayer.get(layer)!.push(node);
  });
  
  return nodesByLayer;
}

/**
 * Positions all nodes in a specific layer
 */
function positionNodesInLayer(
  layer: number,
  nodes: GraphNode[],
  cluster: Cluster,
  config: ClusterLayoutConfig
): PositionedNode[] {
  const positioned: PositionedNode[] = [];
  const radius = calculateLayerRadius(layer, nodes.length, config);
  
  // Group nodes by role for angular positioning
  const nodesByRole = groupNodesByRole(nodes, cluster);
  const activeRoles = Array.from(nodesByRole.keys());
  const useSectors = shouldUseSectors(activeRoles, nodes.length);
  
  // Position each role group
  ROLE_ORDER.forEach(role => {
    const nodesForRole = nodesByRole.get(role) || [];
    if (nodesForRole.length === 0) return;
    
    const { startAngle, angleSpan } = getRoleAngleRange(role, useSectors);
    
    // Position each node in the role group
    nodesForRole.forEach((node, i) => {
      const angle = calculateAnglesInSector(
        startAngle,
        angleSpan,
        nodesForRole.length,
        i,
        0.05 // edge padding
      );
      
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const metadata = cluster.metadata.get(node.id)!;
      
      positioned.push({
        node,
        clusterId: cluster.id,
        localX: x,
        localY: y,
        targetRadius: radius,
        targetAngle: angle,
        metadata
      });
    });
  });
  
  return positioned;
}

/**
 * Gets angle range for a role
 */
function getRoleAngleRange(
  role: string,
  useSectors: boolean
): { startAngle: number; angleSpan: number } {
  if (!useSectors) {
    return { startAngle: 0, angleSpan: 2 * Math.PI };
  }
  
  const sector = ROLE_SECTORS[role];
  if (!sector) {
    return { startAngle: 0, angleSpan: 2 * Math.PI };
  }
  
  const angleSpan = getAngleSpan(sector.start, sector.end);
  return { startAngle: sector.start, angleSpan };
}
