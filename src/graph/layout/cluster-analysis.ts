import { type Cluster, type ClusterNodeMetadata, NodeRole } from '@shared/schemas';
import { type GraphEdge, type GraphNode, NodeType } from '@shared/schemas/graph.types';

/**
 * Analyze a cluster to determine node roles, anchors, and layer assignments.
 * Mutates the cluster in place by populating `cluster.anchors` and `cluster.metadata`.
 *
 * @param cluster - The cluster to analyze
 * @param allEdges - All graph edges (includes cross-cluster edges for external dependent detection)
 */
export function analyzeCluster(cluster: Cluster, allEdges: GraphEdge[]): void {
  const nodeIds = new Set(cluster.nodes.map((n) => n.id));

  const dependents = new Map<string, Set<string>>();
  const dependencies = new Map<string, Set<string>>();

  cluster.nodes.forEach((node) => {
    dependents.set(node.id, new Set());
    dependencies.set(node.id, new Set());
  });

  allEdges.forEach((edge) => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      dependencies.get(edge.source)?.add(edge.target);
      dependents.get(edge.target)?.add(edge.source);
    }
  });

  // Count external dependents
  const externalDependents = new Map<string, number>();
  cluster.nodes.forEach((node) => {
    const count = allEdges.filter((e) => e.target === node.id && !nodeIds.has(e.source)).length;
    externalDependents.set(node.id, count);
  });

  // 1. Identify test nodes and their subjects
  const testNodes = new Set<string>();
  const testSubjects = new Map<string, string[]>();

  cluster.nodes.forEach((node) => {
    if (node.type === NodeType.TestUnit || node.type === NodeType.TestUi) {
      testNodes.add(node.id);

      // Find what this test depends on (its subjects)
      const subjects = Array.from(dependencies.get(node.id) || []).filter((depId) => {
        const depNode = cluster.nodes.find((n) => n.id === depId);
        return depNode && depNode.type !== NodeType.TestUnit && depNode.type !== NodeType.TestUi;
      });

      if (subjects.length > 0) {
        testSubjects.set(node.id, subjects);
      }
    }
  });

  // 2. Identify anchors (entry points)
  const nonTestNodes = cluster.nodes.filter((n) => !testNodes.has(n.id));
  const anchors = identifyAnchors(nonTestNodes, dependents, externalDependents);
  cluster.anchors = anchors.map((n) => n.id);

  // 3. Assign layers based on internal connectivity (edge count within cluster)
  const layers = assignLayers(nonTestNodes, anchors, dependencies, testNodes);

  // 4. Determine roles and create metadata
  cluster.nodes.forEach((node) => {
    const role = determineRole(
      node,
      testNodes.has(node.id),
      cluster.anchors.includes(node.id),
      dependents.get(node.id)?.size || 0,
    );

    const metadata: ClusterNodeMetadata = {
      nodeId: node.id,
      role,
      layer: testNodes.has(node.id) ? -1 : layers.get(node.id) || 0,
      isAnchor: cluster.anchors.includes(node.id),
      hasExternalDependents: (externalDependents.get(node.id) || 0) > 0,
      testSubjects: testSubjects.get(node.id),
      dependencyCount: dependents.get(node.id)?.size || 0,
      dependsOnCount: dependencies.get(node.id)?.size || 0,
    };

    cluster.metadata.set(node.id, metadata);
  });
}

/**
 * Identify anchor nodes (entry points) for a cluster.
 * Priority: Apps > CLIs > Frameworks/libs with external dependents > Most-depended-upon node.
 *
 * @param nodes - Non-test nodes in the cluster
 * @param dependents - Map of node ID to its internal dependent IDs
 * @param externalDependents - Map of node ID to count of external dependents
 * @returns Array of anchor nodes (typically one, but apps/CLIs may return multiple)
 */
export function identifyAnchors(
  nodes: GraphNode[],
  dependents: Map<string, Set<string>>,
  externalDependents: Map<string, number>,
): GraphNode[] {
  // 1. Try apps first
  const apps = nodes.filter((n) => n.type === NodeType.App);
  if (apps.length > 0) return apps;

  // 2. Try CLIs
  const clis = nodes.filter((n) => n.type === NodeType.Cli);
  if (clis.length > 0) return clis;

  // 3. Try frameworks/libs with external dependents
  const externalEntryPoints = nodes.filter(
    (n) =>
      (n.type === NodeType.Framework || n.type === NodeType.Library) &&
      (externalDependents.get(n.id) || 0) > 0,
  );
  if (externalEntryPoints.length > 0) {
    const sorted = externalEntryPoints.toSorted(
      (a, b) => (externalDependents.get(b.id) || 0) - (externalDependents.get(a.id) || 0),
    );
    const top = sorted[0];
    return top ? [top] : [];
  }

  // 4. Fallback: most-depended-upon node
  const sorted = nodes.toSorted(
    (a, b) => (dependents.get(b.id)?.size || 0) - (dependents.get(a.id)?.size || 0),
  );

  const first = sorted[0];
  return first ? [first] : [];
}

// Helper: Count internal dependencies for a node
function countInternalDependencies(
  deps: Set<string>,
  nodeIds: Set<string>,
  testNodes: Set<string>,
): number {
  let count = 0;
  for (const depId of deps) {
    if (nodeIds.has(depId) && !testNodes.has(depId)) {
      count++;
    }
  }
  return count;
}

// Helper: Count internal dependents for a node
function countInternalDependents(
  nodeId: string,
  nodes: GraphNode[],
  dependencies: Map<string, Set<string>>,
  testNodes: Set<string>,
): number {
  let count = 0;
  for (const otherNode of nodes) {
    if (otherNode.id !== nodeId && !testNodes.has(otherNode.id)) {
      const otherDeps = dependencies.get(otherNode.id) || new Set();
      if (otherDeps.has(nodeId)) {
        count++;
      }
    }
  }
  return count;
}

// Helper: Calculate internal edge counts for all nodes
function calculateInternalEdgeCounts(
  nodes: GraphNode[],
  dependencies: Map<string, Set<string>>,
  testNodes: Set<string>,
): Map<string, number> {
  const internalEdgeCounts = new Map<string, number>();
  const nodeIds = new Set(nodes.map((n) => n.id));

  for (const node of nodes) {
    if (testNodes.has(node.id)) continue;

    const deps = dependencies.get(node.id) || new Set();
    const depsCount = countInternalDependencies(deps, nodeIds, testNodes);
    const dependentsCount = countInternalDependents(node.id, nodes, dependencies, testNodes);
    internalEdgeCounts.set(node.id, depsCount + dependentsCount);
  }

  return internalEdgeCounts;
}

// Helper: Distribute nodes into layers
function distributeIntoLayers(sortedNodes: GraphNode[], layers: Map<string, number>): void {
  if (sortedNodes.length === 0) return;

  const targetNodesPerLayer = 4;
  const numLayers = Math.max(2, Math.ceil(sortedNodes.length / targetNodesPerLayer));
  const nodesPerLayer = Math.ceil(sortedNodes.length / numLayers);

  for (let index = 0; index < sortedNodes.length; index++) {
    const node = sortedNodes[index];
    if (!node) continue;
    const layer = Math.min(numLayers, Math.floor(index / nodesPerLayer) + 1);
    layers.set(node.id, layer);
  }
}

/**
 * Assign layer numbers based on internal connectivity (edge count within cluster).
 * Anchors always get layer 0. Other nodes are sorted by connectivity and distributed
 * into layers with ~4 nodes each.
 *
 * @param nodes - Non-test nodes in the cluster
 * @param anchors - Identified anchor (entry point) nodes
 * @param dependencies - Map of node ID to its dependency IDs within the cluster
 * @param testNodes - Set of test node IDs to exclude from layering
 * @returns Map of node ID to layer number (0 = innermost)
 */
export function assignLayers(
  nodes: GraphNode[],
  anchors: GraphNode[],
  dependencies: Map<string, Set<string>>,
  testNodes: Set<string>,
): Map<string, number> {
  const layers = new Map<string, number>();
  const internalEdgeCounts = calculateInternalEdgeCounts(nodes, dependencies, testNodes);

  // Anchors always get layer 0
  for (const anchor of anchors) {
    layers.set(anchor.id, 0);
  }

  // Sort remaining nodes by internal edge count (descending)
  const nonAnchorNodes = nodes.filter(
    (n) => !anchors.some((a) => a.id === n.id) && !testNodes.has(n.id),
  );

  const sortedByConnectivity = [...nonAnchorNodes].sort((a, b) => {
    const countA = internalEdgeCounts.get(a.id) || 0;
    const countB = internalEdgeCounts.get(b.id) || 0;
    return countB - countA;
  });

  distributeIntoLayers(sortedByConnectivity, layers);

  return layers;
}

/**
 * Determine the layout role of a node within its cluster.
 *
 * @param node - The graph node
 * @param isTest - Whether this is a test node
 * @param isAnchor - Whether this is an anchor (entry point) node
 * @param dependentCount - Number of internal dependents
 * @returns The assigned NodeRole
 */
export function determineRole(
  node: GraphNode,
  isTest: boolean,
  isAnchor: boolean,
  dependentCount: number,
): NodeRole {
  if (isTest) return NodeRole.Test;
  if (isAnchor) return NodeRole.Entry;

  if (node.type === NodeType.Cli) return NodeRole.Tool;

  // Frameworks and packages are always internal-framework
  if (node.type === NodeType.Framework || node.type === NodeType.Package) {
    return NodeRole.InternalFramework;
  }

  if (node.type === NodeType.Library) {
    return dependentCount >= 2 ? NodeRole.InternalLib : NodeRole.Utility;
  }

  return NodeRole.Utility;
}
