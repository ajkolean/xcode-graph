/**
 * Node categorization utilities
 * Separates nodes into anchors, regular, and test nodes
 */

import { GraphNode } from '../../data/mockGraphData';
import { Cluster } from '../../types/cluster';

export interface CategorizedNodes {
  anchorNodes: GraphNode[];
  regularNodes: GraphNode[];
  testNodes: GraphNode[];
}

/**
 * Categorizes nodes into anchors, regular, and tests
 * Ensures all nodes have metadata
 */
export function categorizeNodes(cluster: Cluster): CategorizedNodes {
  const anchorNodes: GraphNode[] = [];
  const regularNodes: GraphNode[] = [];
  const testNodes: GraphNode[] = [];
  
  cluster.nodes.forEach(node => {
    const metadata = cluster.metadata.get(node.id);
    
    // Safety check - if no metadata, treat as regular node with default layer
    if (!metadata) {
      // Create default metadata for this node
      cluster.metadata.set(node.id, {
        layer: 1,
        role: 'internal-lib',
        isAnchor: false
      });
      regularNodes.push(node);
      return;
    }
    
    if (metadata.role === 'test') {
      testNodes.push(node);
    } else if (metadata.isAnchor) {
      anchorNodes.push(node);
    } else {
      regularNodes.push(node);
    }
  });
  
  return { anchorNodes, regularNodes, testNodes };
}

/**
 * Groups nodes by their metadata layer
 */
export function groupNodesByLayer(nodes: GraphNode[], cluster: Cluster): Map<number, GraphNode[]> {
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
 * Groups nodes by their role
 */
export function groupNodesByRole(nodes: GraphNode[], cluster: Cluster): Map<string, GraphNode[]> {
  const byRole = new Map<string, GraphNode[]>();
  
  nodes.forEach(node => {
    const metadata = cluster.metadata.get(node.id)!;
    const role = metadata.role;
    
    if (!byRole.has(role)) {
      byRole.set(role, []);
    }
    byRole.get(role)!.push(node);
  });
  
  return byRole;
}
