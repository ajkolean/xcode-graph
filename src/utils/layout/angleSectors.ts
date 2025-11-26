/**
 * Angular sector definitions for role-based positioning
 * Maps node roles to angular regions on the ring
 */

import { GraphNode } from '../../data/mockGraphData';

export interface RoleSector {
  start: number;  // Start angle in radians
  span: number;   // Span in radians
}

/**
 * Role-based angular sectors for positioning
 * Entry nodes at top, frameworks right, etc.
 */
export const ROLE_SECTORS: Record<string, RoleSector> = {
  'entry': { start: -Math.PI / 2, span: 2 * Math.PI / 3 },           // Top
  'internal-framework': { start: Math.PI / 6, span: Math.PI / 2 },   // Right
  'internal-lib': { start: 2 * Math.PI / 3, span: 7 * Math.PI / 12 }, // Bottom
  'utility': { start: 7 * Math.PI / 6, span: Math.PI / 3 },          // Left
  'tool': { start: 3 * Math.PI / 2, span: Math.PI / 2 }              // Top-left
};

/**
 * Distributes nodes around a ring with role-based sectors
 */
export function distributeNodesOnRing(
  nodesByRole: Map<string, GraphNode[]>,
  radius: number
): Array<{ node: GraphNode; x: number; y: number; angle: number }> {
  const result: Array<{ node: GraphNode; x: number; y: number; angle: number }> = [];
  
  const roles = Array.from(nodesByRole.keys());
  const totalNodes = Array.from(nodesByRole.values()).reduce((sum, nodes) => sum + nodes.length, 0);
  
  // If single role with many nodes, use full circle
  if (roles.length === 1 && totalNodes > 6) {
    const nodes = nodesByRole.get(roles[0])!;
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      result.push({
        node,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        angle
      });
    });
    return result;
  }
  
  // Multiple roles - use sectors
  roles.forEach(role => {
    const nodes = nodesByRole.get(role)!;
    const sector = ROLE_SECTORS[role] || { start: 0, span: Math.PI * 2 };
    
    nodes.forEach((node, i) => {
      const t = nodes.length === 1 ? 0.5 : i / (nodes.length - 1);
      const angle = sector.start + t * sector.span;
      
      result.push({
        node,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        angle
      });
    });
  });
  
  return result;
}
