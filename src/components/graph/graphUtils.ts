/**
 * @deprecated This file is being phased out. Use individual utility modules instead:
 * - utils/graph/nodeSizing.ts for node size calculations
 * - utils/graph/nodeColors.ts for color utilities
 * - utils/graph/nodeConnections.ts for connection analysis
 * - utils/graph/nodeVisibility.ts for visibility logic
 */

import { GraphNode, GraphEdge } from '../../data/mockGraphData';
import { generateColor } from '../../utils/colorGenerator';
import { getConnectedNodes as getConnectedNodesService } from '../../services/graphService';

export function getNodeSize(node: GraphNode, edges: GraphEdge[]): number {
  const depCount = edges.filter(e => 
    e.source === node.id || e.target === node.id
  ).length;
  
  let baseSize = 10;
  if (node.type === 'app') baseSize = 18;
  else if (node.type === 'framework') baseSize = 14;
  else if (node.type === 'library') baseSize = 12;
  else if (node.type === 'cli') baseSize = 14;
  else if (node.type === 'test-unit' || node.type === 'test-ui') baseSize = 8;
  else if (node.type === 'package') baseSize = 12;
  
  const scaleFactor = 1 + Math.min(depCount * 0.03, 0.3);
  return baseSize * scaleFactor;
}

export function getNodeTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    'app': '#6F2CFF',
    'framework': '#0280B9',
    'library': '#28A745',
    'test-unit': '#9C27B0',
    'test-ui': '#E91E63',
    'cli': '#FD791C',
    'package': '#FF9800'
  };
  return colorMap[type] || '#6F2CFF';
}

export function getProjectColor(projectName: string): string {
  return generateColor(projectName, 'project');
}

/**
 * Get all nodes connected to a given node
 * @deprecated Use graphService.getConnectedNodes instead for more detailed info
 */
export function getConnectedNodes(nodeId: string, edges: GraphEdge[]): Set<string> {
  const { dependencies, dependents } = getConnectedNodesService(nodeId, edges);
  return new Set([...dependencies, ...dependents]);
}