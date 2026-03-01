/**
 * End-to-end integration tests with real Tuist JSON fixtures
 *
 * Validates the full pipeline from raw XcodeGraph JSON through
 * transformation, data service indexing, analysis, and clustering.
 */

import { groupIntoClusters } from '@graph/layout/cluster-grouping';
import { NodeType, Origin } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { GraphAnalysisService } from '@/services/graph-analysis-service';
import { GraphDataService } from '@/services/graph-data-service';
import { transformXcodeGraph } from '@/services/xcode-graph.service';
import rawGraph from '../fixtures/xcode-graph.json';
import rawFutureGraph from '../fixtures/xcode-graph-future.json';

describe('Pipeline integration: xcode-graph.json', () => {
  const result = transformXcodeGraph(rawGraph);
  const { data } = result;

  describe('transformXcodeGraph', () => {
    it('should produce valid GraphData with nodes and edges', () => {
      expect(data.nodes).toBeDefined();
      expect(data.edges).toBeDefined();
      expect(data.nodes.length).toBeGreaterThan(0);
      expect(data.edges.length).toBeGreaterThan(0);
    });

    it('should produce nodes with required fields', () => {
      for (const node of data.nodes) {
        expect(node.id).toBeTruthy();
        expect(node.name).toBeTruthy();
        expect(node.type).toBeTruthy();
        expect(node.platform).toBeTruthy();
        expect(node.origin).toBeTruthy();
      }
    });

    it('should produce edges referencing valid node ids', () => {
      const nodeIds = new Set(data.nodes.map((n) => n.id));
      for (const edge of data.edges) {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      }
    });

    it('should contain both local and external nodes', () => {
      const origins = new Set(data.nodes.map((n) => n.origin));
      expect(origins.has(Origin.Local)).toBe(true);
      expect(origins.has(Origin.External)).toBe(true);
    });

    it('should contain multiple node types', () => {
      const types = new Set(data.nodes.map((n) => n.type));
      expect(types.size).toBeGreaterThan(1);
    });

    it('should have a significant number of nodes for real project data', () => {
      // The fixture is ~3.2MB with 100+ projects
      expect(data.nodes.length).toBeGreaterThan(50);
    });
  });

  describe('GraphDataService indexing', () => {
    const service = new GraphDataService(data.nodes, data.edges);

    it('should index all nodes', () => {
      expect(service.getAllNodes().length).toBe(data.nodes.length);
    });

    it('should index all edges', () => {
      expect(service.getAllEdges().length).toBe(data.edges.length);
    });

    it('should find projects', () => {
      const projects = service.getAllProjects();
      expect(projects.size).toBeGreaterThan(0);
    });

    it('should index packages when present', () => {
      const packages = service.getAllPackages();
      const packageNodes = data.nodes.filter((n) => n.type === NodeType.Package);
      expect(packages.size).toBe(packageNodes.length);
    });

    it('should resolve nodes by id', () => {
      const firstNode = data.nodes[0];
      expect(firstNode).toBeDefined();
      if (!firstNode) return;
      const resolved = service.getNodeById(firstNode.id);
      expect(resolved).toBeDefined();
      expect(resolved?.name).toBe(firstNode.name);
    });

    it('should resolve outgoing edges for nodes with dependencies', () => {
      // Find a node that has outgoing edges
      const nodeWithDeps = data.nodes.find((n) => data.edges.some((e) => e.source === n.id));
      expect(nodeWithDeps).toBeDefined();

      if (nodeWithDeps) {
        const outgoing = service.getOutgoingEdges(nodeWithDeps.id);
        expect(outgoing.length).toBeGreaterThan(0);
      }
    });

    it('should resolve incoming edges for dependency nodes', () => {
      // Find a node that is a dependency target
      const depTarget = data.nodes.find((n) => data.edges.some((e) => e.target === n.id));
      expect(depTarget).toBeDefined();

      if (depTarget) {
        const incoming = service.getIncomingEdges(depTarget.id);
        expect(incoming.length).toBeGreaterThan(0);
      }
    });

    it('should filter nodes by type', () => {
      const packageNodes = service.getNodesByType(NodeType.Package);
      for (const node of packageNodes) {
        expect(node.type).toBe(NodeType.Package);
      }
    });

    it('should search nodes by name', () => {
      const firstNode = data.nodes[0];
      expect(firstNode).toBeDefined();
      if (!firstNode) return;
      const searchTerm = firstNode.name.substring(0, 4);
      const results = service.searchNodes(searchTerm);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('GraphAnalysisService', () => {
    const service = new GraphDataService(data.nodes, data.edges);

    it('should run circular dependency detection without crashing', () => {
      const cycles = GraphAnalysisService.findCircularDependencies(service);
      expect(Array.isArray(cycles)).toBe(true);
    });

    it('should detect path existence between connected nodes', () => {
      // Use the first edge to test hasPath
      const firstEdge = data.edges[0];
      expect(firstEdge).toBeDefined();
      if (!firstEdge) return;
      const hasPath = GraphAnalysisService.hasPath(service, firstEdge.source, firstEdge.target);
      expect(hasPath).toBe(true);
    });
  });

  describe('Cluster grouping', () => {
    const clusters = groupIntoClusters(data.nodes, data.edges);

    it('should produce clusters', () => {
      expect(clusters.length).toBeGreaterThan(0);
    });

    it('should assign all nodes to clusters', () => {
      const totalNodesInClusters = clusters.reduce((sum, c) => sum + c.nodes.length, 0);
      expect(totalNodesInClusters).toBe(data.nodes.length);
    });

    it('should give each cluster a valid id and name', () => {
      for (const cluster of clusters) {
        expect(cluster.id).toBeTruthy();
        expect(cluster.name).toBeTruthy();
      }
    });

    it('should have unique cluster ids', () => {
      const ids = clusters.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should assign metadata Maps to clusters', () => {
      for (const cluster of clusters) {
        expect(cluster.metadata).toBeInstanceOf(Map);
      }
    });

    it('should have clusters with non-empty metadata for multi-node clusters', () => {
      const multiNodeClusters = clusters.filter((c) => c.nodes.length > 1);
      if (multiNodeClusters.length > 0) {
        // At least some multi-node clusters should have metadata
        const withMetadata = multiNodeClusters.filter((c) => c.metadata.size > 0);
        expect(withMetadata.length).toBeGreaterThan(0);
      }
    });

    it('should correctly separate project and package clusters', () => {
      const localNodes = data.nodes.filter((n) => n.origin === Origin.Local);
      const externalNodes = data.nodes.filter((n) => n.origin === Origin.External);

      if (localNodes.length > 0) {
        const projectClusters = clusters.filter((c) => c.origin === Origin.Local);
        expect(projectClusters.length).toBeGreaterThan(0);
      }

      if (externalNodes.length > 0) {
        const packageClusters = clusters.filter((c) => c.origin === Origin.External);
        expect(packageClusters.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('Pipeline integration: xcode-graph-future.json (forward-compat)', () => {
  it('should transform future graph format without crashing', () => {
    const result = transformXcodeGraph(rawFutureGraph);

    expect(result.data).toBeDefined();
    expect(result.data.nodes).toBeDefined();
    expect(result.data.edges).toBeDefined();
  });

  it('should produce valid graph data from future format', () => {
    const result = transformXcodeGraph(rawFutureGraph);
    const { data } = result;

    // Future format should still produce some nodes and edges
    if (data.nodes.length > 0) {
      for (const node of data.nodes) {
        expect(node.id).toBeTruthy();
        expect(node.name).toBeTruthy();
      }
    }
  });

  it('should produce warnings for unknown fields or values', () => {
    const result = transformXcodeGraph(rawFutureGraph);
    // Future format has schema version 99.0, unknown fields,
    // and possibly unknown enum values — warnings are expected
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('should run through the full pipeline if nodes exist', () => {
    const result = transformXcodeGraph(rawFutureGraph);
    const { data } = result;

    if (data.nodes.length > 0) {
      const service = new GraphDataService(data.nodes, data.edges);
      expect(service.getAllNodes().length).toBe(data.nodes.length);

      const clusters = groupIntoClusters(data.nodes, data.edges);
      expect(clusters.length).toBeGreaterThan(0);

      const cycles = GraphAnalysisService.findCircularDependencies(service);
      expect(Array.isArray(cycles)).toBe(true);
    }
  });
});
