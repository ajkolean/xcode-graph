import { GraphNode, GraphEdge } from '../data/mockGraphData';
import { Cluster, ClusterNodeMetadata, NodeRole } from '../types/cluster';

/**
 * Analyzes a cluster to determine node roles, anchors, and layers
 */
export function analyzeCluster(cluster: Cluster, allEdges: GraphEdge[]): void {
  const nodeIds = new Set(cluster.nodes.map(n => n.id));
  
  // Build dependency maps
  const dependents = new Map<string, Set<string>>();
  const dependencies = new Map<string, Set<string>>();
  
  cluster.nodes.forEach(node => {
    dependents.set(node.id, new Set());
    dependencies.set(node.id, new Set());
  });

  allEdges.forEach(edge => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      dependencies.get(edge.source)?.add(edge.target);
      dependents.get(edge.target)?.add(edge.source);
    }
  });

  // Count external dependents
  const externalDependents = new Map<string, number>();
  cluster.nodes.forEach(node => {
    const count = allEdges.filter(e => 
      e.target === node.id && !nodeIds.has(e.source)
    ).length;
    externalDependents.set(node.id, count);
  });

  // 1. Identify test nodes and their subjects
  const testNodes = new Set<string>();
  const testSubjects = new Map<string, string[]>();
  
  cluster.nodes.forEach(node => {
    if (node.type === 'test-unit' || node.type === 'test-ui') {
      testNodes.add(node.id);
      
      // Find what this test depends on (its subjects)
      const subjects = Array.from(dependencies.get(node.id) || [])
        .filter(depId => {
          const depNode = cluster.nodes.find(n => n.id === depId);
          return depNode && depNode.type !== 'test-unit' && depNode.type !== 'test-ui';
        });
      
      if (subjects.length > 0) {
        testSubjects.set(node.id, subjects);
      }
    }
  });

  // 2. Identify anchors (entry points)
  const nonTestNodes = cluster.nodes.filter(n => !testNodes.has(n.id));
  const anchors = identifyAnchors(nonTestNodes, dependents, externalDependents);
  cluster.anchors = anchors.map(n => n.id);

  // 3. Assign layers based on internal connectivity (edge count within cluster)
  const layers = assignLayers(nonTestNodes, anchors, dependencies, testNodes);

  // 4. Determine roles and create metadata
  cluster.nodes.forEach(node => {
    const role = determineRole(
      node,
      testNodes.has(node.id),
      cluster.anchors.includes(node.id),
      dependents.get(node.id)?.size || 0
    );

    const metadata: ClusterNodeMetadata = {
      nodeId: node.id,
      role,
      layer: testNodes.has(node.id) ? -1 : (layers.get(node.id) || 0),
      isAnchor: cluster.anchors.includes(node.id),
      hasExternalDependents: (externalDependents.get(node.id) || 0) > 0,
      testSubjects: testSubjects.get(node.id),
      dependencyCount: dependents.get(node.id)?.size || 0,
      dependsOnCount: dependencies.get(node.id)?.size || 0
    };

    cluster.metadata.set(node.id, metadata);
  });
}

/**
 * Identifies anchor nodes (entry points) for a cluster
 * Priority: Apps > CLIs > Most-depended-upon frameworks/libs
 */
export function identifyAnchors(
  nodes: GraphNode[],
  dependents: Map<string, Set<string>>,
  externalDependents: Map<string, number>
): GraphNode[] {
  // 1. Try apps first
  const apps = nodes.filter(n => n.type === 'app');
  if (apps.length > 0) return apps;

  // 2. Try CLIs
  const clis = nodes.filter(n => n.type === 'cli');
  if (clis.length > 0) return clis;

  // 3. Try frameworks/libs with external dependents
  const externalEntryPoints = nodes.filter(n => 
    (n.type === 'framework' || n.type === 'library') &&
    (externalDependents.get(n.id) || 0) > 0
  );
  if (externalEntryPoints.length > 0) {
    // Return the one with most external dependents
    const sorted = externalEntryPoints.sort((a, b) => 
      (externalDependents.get(b.id) || 0) - (externalDependents.get(a.id) || 0)
    );
    return [sorted[0]];
  }

  // 4. Fallback: most-depended-upon node
  const sorted = [...nodes].sort((a, b) => 
    (dependents.get(b.id)?.size || 0) - (dependents.get(a.id)?.size || 0)
  );
  
  return sorted.length > 0 ? [sorted[0]] : [];
}

/**
 * Assigns layer numbers based on internal connectivity (edge count within cluster)
 * Nodes with more internal edges are placed in inner rings (lower layer numbers)
 * Nodes with fewer internal edges are placed in outer rings (higher layer numbers)
 */
export function assignLayers(
  nodes: GraphNode[],
  anchors: GraphNode[],
  dependencies: Map<string, Set<string>>,
  testNodes: Set<string>
): Map<string, number> {
  const layers = new Map<string, number>();
  
  // Calculate internal edge count for each node
  const internalEdgeCounts = new Map<string, number>();
  
  nodes.forEach(node => {
    if (testNodes.has(node.id)) return;
    
    const deps = dependencies.get(node.id) || new Set();
    const nodeIds = new Set(nodes.map(n => n.id));
    
    // Count edges that are within this cluster (both dependencies and dependents)
    let internalCount = 0;
    
    // Count internal dependencies
    deps.forEach(depId => {
      if (nodeIds.has(depId) && !testNodes.has(depId)) {
        internalCount++;
      }
    });
    
    // Count internal dependents (reverse edges)
    nodes.forEach(otherNode => {
      if (otherNode.id !== node.id && !testNodes.has(otherNode.id)) {
        const otherDeps = dependencies.get(otherNode.id) || new Set();
        if (otherDeps.has(node.id)) {
          internalCount++;
        }
      }
    });
    
    internalEdgeCounts.set(node.id, internalCount);
  });
  
  // Anchors always get layer 0
  anchors.forEach(anchor => {
    layers.set(anchor.id, 0);
  });
  
  // Sort remaining nodes by internal edge count (descending)
  const nonAnchorNodes = nodes.filter(n => 
    !anchors.some(a => a.id === n.id) && !testNodes.has(n.id)
  );
  
  const sortedByConnectivity = [...nonAnchorNodes].sort((a, b) => {
    const countA = internalEdgeCounts.get(a.id) || 0;
    const countB = internalEdgeCounts.get(b.id) || 0;
    return countB - countA; // Higher connectivity first
  });
  
  // Distribute into layers with balanced node counts
  // Aim for 3-6 nodes per layer for optimal radial distribution
  if (sortedByConnectivity.length > 0) {
    const targetNodesPerLayer = 4; // Optimal for radial layout
    const numLayers = Math.max(2, Math.ceil(sortedByConnectivity.length / targetNodesPerLayer));
    const nodesPerLayer = Math.ceil(sortedByConnectivity.length / numLayers);
    
    sortedByConnectivity.forEach((node, index) => {
      // Assign layer based on position in sorted array
      const layer = Math.min(numLayers, Math.floor(index / nodesPerLayer) + 1);
      layers.set(node.id, layer);
    });
  }

  return layers;
}

/**
 * Determines the role of a node
 */
export function determineRole(
  node: GraphNode,
  isTest: boolean,
  isAnchor: boolean,
  dependentCount: number
): NodeRole {
  if (isTest) return 'test';
  if (isAnchor) return 'entry';
  
  if (node.type === 'cli') return 'tool';
  
  // High-dependency frameworks/libs are internal-framework
  if ((node.type === 'framework' || node.type === 'package') && dependentCount >= 3) {
    return 'internal-framework';
  }
  
  if (node.type === 'framework' || node.type === 'package') {
    return 'internal-framework';
  }
  
  if (node.type === 'library') {
    return dependentCount >= 2 ? 'internal-lib' : 'utility';
  }
  
  return 'utility';
}