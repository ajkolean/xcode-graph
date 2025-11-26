/**
 * Deterministic hierarchical layout hook
 * Uses two-graph hierarchy: cluster DAG layout + radial intra-cluster layout
 */

import { useMemo, useRef } from 'react';
import { GraphNode, GraphEdge } from '../../data/mockGraphData';
import { NodePosition, ClusterPosition } from '../../types/simulation';
import { ClusterLayoutConfig, DEFAULT_CLUSTER_CONFIG } from '../../types/cluster';
import { Cluster } from '../../types/cluster';
import { groupIntoClusters } from '../../utils/clusterGrouping';
import { analyzeCluster } from '../../utils/clusterAnalysis';
import { computeHierarchicalLayout } from '../../utils/hierarchicalLayout';

interface DeterministicLayoutOptions {
  config?: Partial<ClusterLayoutConfig>;
  enableRelaxation?: boolean;
  relaxationIterations?: number;
}

// Create a stable fingerprint for nodes/edges to prevent unnecessary recalculations
function createDataFingerprint(nodes: GraphNode[], edges: GraphEdge[]): string {
  const nodeIds = nodes.map(n => n.id).sort().join(',');
  const edgeIds = edges.map(e => `${e.source}->${e.target}`).sort().join(',');
  return `${nodeIds}::${edgeIds}`;
}

export function useDeterministicLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: DeterministicLayoutOptions = {}
) {
  const config: ClusterLayoutConfig = {
    ...DEFAULT_CLUSTER_CONFIG,
    ...options.config
  };

  // Cache previous results
  const cacheRef = useRef<{
    fingerprint: string;
    result: {
      nodePositions: Map<string, NodePosition>;
      clusterPositions: Map<string, ClusterPosition>;
      clusters: Cluster[];
    };
  } | null>(null);

  const result = useMemo(() => {
    if (nodes.length === 0) {
      return {
        nodePositions: new Map<string, NodePosition>(),
        clusterPositions: new Map<string, ClusterPosition>(),
        clusters: [] as Cluster[]
      };
    }

    // Check if data has actually changed
    const fingerprint = createDataFingerprint(nodes, edges);
    if (cacheRef.current && cacheRef.current.fingerprint === fingerprint) {
      return cacheRef.current.result;
    }

    // Step 1: Group nodes into clusters and analyze
    const analyzedClusters = groupIntoClusters(nodes, edges);
    
    // Analyze each cluster (modifies in place)
    analyzedClusters.forEach(cluster => {
      analyzeCluster(cluster, edges);
    });

    // Step 2: Compute hierarchical layout (DAG + radial)
    const { clusterPositions, nodePositions, clusters } = computeHierarchicalLayout(
      nodes,
      edges,
      analyzedClusters
    );

    // Step 3: Enhance node positions with metadata
    const enhancedNodePositions = new Map<string, NodePosition>();
    
    for (const [nodeId, pos] of nodePositions.entries()) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      enhancedNodePositions.set(nodeId, {
        ...pos,
        id: nodeId,
        radius: config.normalNodeSize,
        isAnchor: node.type === 'app' || node.type === 'framework' || node.type === 'cli',
        isTest: node.type === 'test'
      });
    }

    const newResult = {
      nodePositions: enhancedNodePositions,
      clusterPositions,
      clusters
    };

    // Cache the result
    cacheRef.current = {
      fingerprint,
      result: newResult
    };

    return newResult;
  }, [nodes, edges, config.normalNodeSize]);

  return result;
}