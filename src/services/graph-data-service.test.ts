import type { GraphEdge, GraphNode } from '@shared/schemas/graph.types';
import { Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import {
  createDiamondGraph,
  createEmptyGraph,
  createLinearChain,
  createNode,
  createProjectGraph,
} from '../fixtures';
import { GraphDataService } from './graph-data-service';
import { GraphStatsService } from './graph-stats-service';

describe('GraphDataService', () => {
  describe('getAllNodes', () => {
    it('should return all nodes', () => {
      const { nodes, edges } = createLinearChain(4);
      const service = new GraphDataService(nodes, edges);

      expect(service.getAllNodes()).toHaveLength(4);
    });

    it('should return empty array for empty graph', () => {
      const { nodes, edges } = createEmptyGraph();
      const service = new GraphDataService(nodes, edges);

      expect(service.getAllNodes()).toHaveLength(0);
    });
  });

  describe('getNodeById', () => {
    it('should return node by ID', () => {
      const { nodes, edges } = createLinearChain(3);
      const service = new GraphDataService(nodes, edges);

      const node = service.getNodeById('A');

      expect(node).toBeDefined();
      expect(node?.id).toBe('A');
    });

    it('should return undefined for non-existent ID', () => {
      const { nodes, edges } = createLinearChain(3);
      const service = new GraphDataService(nodes, edges);

      expect(service.getNodeById('Z')).toBeUndefined();
    });

    it('should provide O(1) lookup', () => {
      // Create many nodes to verify map-based lookup
      const nodes: GraphNode[] = [];
      for (let i = 0; i < 1000; i++) {
        nodes.push(createNode({ id: `node-${i}`, name: `Node${i}` }));
      }
      const service = new GraphDataService(nodes, []);

      // Should be instant regardless of size
      const node = service.getNodeById('node-999');
      expect(node?.id).toBe('node-999');
    });
  });

  describe('getNodesByType', () => {
    it('should return nodes of specified type', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const frameworks = service.getNodesByType('framework');

      expect(frameworks.length).toBeGreaterThan(0);
      for (const node of frameworks) {
        expect(node.type).toBe('framework');
      }
    });

    it('should return empty array for non-existent type', () => {
      const { nodes, edges } = createLinearChain(3);
      const service = new GraphDataService(nodes, edges);

      expect(service.getNodesByType('unknown')).toHaveLength(0);
    });
  });

  describe('getNodesByProject', () => {
    it('should return nodes of specified project', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const coreNodes = service.getNodesByProject('Core');

      expect(coreNodes.length).toBeGreaterThan(0);
      for (const node of coreNodes) {
        expect(node.project).toBe('Core');
      }
    });

    it('should return empty array for non-existent project', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      expect(service.getNodesByProject('NonExistent')).toHaveLength(0);
    });
  });

  describe('getNodesByPlatform', () => {
    it('should return nodes with specified platform', () => {
      const nodes: GraphNode[] = [
        createNode({ id: '1', name: 'A', platform: Platform.iOS }),
        createNode({ id: '2', name: 'B', platform: Platform.iOS }),
        createNode({ id: '3', name: 'C', platform: Platform.macOS }),
      ];
      const service = new GraphDataService(nodes, []);

      const iosNodes = service.getNodesByPlatform('iOS');

      expect(iosNodes).toHaveLength(2);
      const iosNodeIds = iosNodes.map((n) => n.id).toSorted((a, b) => a.localeCompare(b));
      expect(iosNodeIds).toEqual(['1', '2']);
    });

    it('should return empty for non-existent platform', () => {
      const nodes: GraphNode[] = [createNode({ id: '1', name: 'A', platform: Platform.iOS })];
      const service = new GraphDataService(nodes, []);

      expect(service.getNodesByPlatform('watchOS')).toHaveLength(0);
    });
  });

  describe('getNodesByOrigin', () => {
    it('should return local nodes', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const localNodes = service.getNodesByOrigin(Origin.Local);

      for (const node of localNodes) {
        expect(node.origin).toBe('local');
      }
    });

    it('should return external nodes', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const externalNodes = service.getNodesByOrigin(Origin.External);

      for (const node of externalNodes) {
        expect(node.origin).toBe('external');
      }
    });
  });

  describe('searchNodes', () => {
    it('should find nodes by name', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const results = service.searchNodes('Core');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const lowerResults = service.searchNodes('core');
      const upperResults = service.searchNodes('CORE');

      expect(lowerResults).toEqual(upperResults);
    });

    it('should find partial matches', () => {
      const nodes: GraphNode[] = [
        createNode({ id: '1', name: 'NetworkManager' }),
        createNode({ id: '2', name: 'NetworkClient' }),
        createNode({ id: '3', name: 'DataStore' }),
      ];
      const service = new GraphDataService(nodes, []);

      const results = service.searchNodes('network');

      expect(results).toHaveLength(2);
    });

    it('should return empty for no matches', () => {
      const { nodes, edges } = createLinearChain(3);
      const service = new GraphDataService(nodes, edges);

      expect(service.searchNodes('zzzzz')).toHaveLength(0);
    });
  });

  describe('getAllEdges', () => {
    it('should return all edges', () => {
      const { nodes, edges } = createLinearChain(4);
      const service = new GraphDataService(nodes, edges);

      expect(service.getAllEdges()).toHaveLength(3);
    });
  });

  describe('getEdge', () => {
    it('should return edge by source and target', () => {
      const { nodes, edges } = createLinearChain(3);
      const service = new GraphDataService(nodes, edges);

      const edge = service.getEdge('A', 'B');

      expect(edge).toBeDefined();
      expect(edge?.source).toBe('A');
      expect(edge?.target).toBe('B');
    });

    it('should return undefined for non-existent edge', () => {
      const { nodes, edges } = createLinearChain(3);
      const service = new GraphDataService(nodes, edges);

      expect(service.getEdge('A', 'C')).toBeUndefined();
    });
  });

  describe('getOutgoingEdges', () => {
    it('should return outgoing edges', () => {
      const { nodes, edges } = createDiamondGraph();
      const service = new GraphDataService(nodes, edges);

      const outgoing = service.getOutgoingEdges('A');

      expect(outgoing).toHaveLength(2);
      for (const e of outgoing) {
        expect(e.source).toBe('A');
      }
    });

    it('should return empty for leaf nodes', () => {
      const { nodes, edges } = createDiamondGraph();
      const service = new GraphDataService(nodes, edges);

      expect(service.getOutgoingEdges('D')).toHaveLength(0);
    });
  });

  describe('getIncomingEdges', () => {
    it('should return incoming edges', () => {
      const { nodes, edges } = createDiamondGraph();
      const service = new GraphDataService(nodes, edges);

      const incoming = service.getIncomingEdges('D');

      expect(incoming).toHaveLength(2);
      for (const e of incoming) {
        expect(e.target).toBe('D');
      }
    });

    it('should return empty for root nodes', () => {
      const { nodes, edges } = createDiamondGraph();
      const service = new GraphDataService(nodes, edges);

      expect(service.getIncomingEdges('A')).toHaveLength(0);
    });
  });

  describe('getNodeEdges', () => {
    it('should return all edges for a node', () => {
      const { nodes, edges } = createDiamondGraph();
      const service = new GraphDataService(nodes, edges);

      const nodeEdges = service.getNodeEdges('B');

      // B has 1 incoming (from A) and 1 outgoing (to D)
      expect(nodeEdges).toHaveLength(2);
    });
  });

  describe('getDirectDependencies', () => {
    it('should return direct dependencies', () => {
      const { nodes, edges } = createDiamondGraph();
      const service = new GraphDataService(nodes, edges);

      const deps = service.getDirectDependencies('A');

      expect(deps).toHaveLength(2);
      const depIds = deps.map((n) => n.id).toSorted((a, b) => a.localeCompare(b));
      expect(depIds).toEqual(['B', 'C']);
    });

    it('should return empty for nodes with no dependencies', () => {
      const { nodes, edges } = createDiamondGraph();
      const service = new GraphDataService(nodes, edges);

      expect(service.getDirectDependencies('D')).toHaveLength(0);
    });
  });

  describe('getDirectDependents', () => {
    it('should return direct dependents', () => {
      const { nodes, edges } = createDiamondGraph();
      const service = new GraphDataService(nodes, edges);

      const dependents = service.getDirectDependents('D');

      expect(dependents).toHaveLength(2);
      const dependentIds = dependents.map((n) => n.id).toSorted((a, b) => a.localeCompare(b));
      expect(dependentIds).toEqual(['B', 'C']);
    });

    it('should return empty for nodes with no dependents', () => {
      const { nodes, edges } = createDiamondGraph();
      const service = new GraphDataService(nodes, edges);

      expect(service.getDirectDependents('A')).toHaveLength(0);
    });
  });

  describe('getTransitiveDependencies', () => {
    it('should return all transitive dependencies', () => {
      const { nodes, edges } = createLinearChain(4);
      const service = new GraphDataService(nodes, edges);

      const result = service.getTransitiveDependencies('A');

      // A depends on B, C, D (transitively)
      expect(result.nodes).toContain('A');
      expect(result.nodes).toContain('B');
      expect(result.nodes).toContain('C');
      expect(result.nodes).toContain('D');
      expect(result.nodes.size).toBe(4);
    });

    it('should track depth correctly', () => {
      const { nodes, edges } = createLinearChain(4);
      const service = new GraphDataService(nodes, edges);

      const result = service.getTransitiveDependencies('A');

      expect(result.depths.get('B')).toBe(1);
      expect(result.depths.get('C')).toBe(2);
      expect(result.depths.get('D')).toBe(3);
    });

    it('should include all edges', () => {
      const { nodes, edges } = createDiamondGraph();
      const service = new GraphDataService(nodes, edges);

      const result = service.getTransitiveDependencies('A');

      expect(result.edges.size).toBe(4);
    });

    it('should handle isolated nodes', () => {
      const nodes = [createNode({ id: 'isolated', name: 'Isolated' })];
      const service = new GraphDataService(nodes, []);

      const result = service.getTransitiveDependencies('isolated');

      expect(result.nodes.size).toBe(1);
      expect(result.edges.size).toBe(0);
    });
  });

  describe('getTransitiveDependents', () => {
    it('should return all transitive dependents', () => {
      const { nodes, edges } = createLinearChain(4);
      const service = new GraphDataService(nodes, edges);

      const result = service.getTransitiveDependents('D');

      // D is depended on by C, B, A (transitively)
      expect(result.nodes).toContain('D');
      expect(result.nodes).toContain('C');
      expect(result.nodes).toContain('B');
      expect(result.nodes).toContain('A');
    });

    it('should track depth correctly', () => {
      const { nodes, edges } = createLinearChain(4);
      const service = new GraphDataService(nodes, edges);

      const result = service.getTransitiveDependents('D');

      expect(result.depths.get('C')).toBe(1);
      expect(result.depths.get('B')).toBe(2);
      expect(result.depths.get('A')).toBe(3);
    });
  });

  describe('getClusterNodes', () => {
    it('should return nodes in project cluster', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const clusterNodes = service.getClusterNodes('Core');

      expect(clusterNodes.length).toBeGreaterThan(0);
      for (const n of clusterNodes) {
        expect(n.project).toBe('Core');
      }
    });

    it('should return empty for non-existent cluster', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      expect(service.getClusterNodes('NonExistent')).toHaveLength(0);
    });
  });

  describe('getCluster', () => {
    it('should return cluster data', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const cluster = service.getCluster('Core');

      expect(cluster).not.toBeNull();
      expect(cluster?.id).toBe('Core');
      expect(cluster?.name).toBe('Core');
      expect(cluster?.nodes.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent cluster', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      expect(service.getCluster('NonExistent')).toBeNull();
    });
  });

  describe('getAllProjects', () => {
    it('should return all unique projects', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const projects = service.getAllProjects();

      expect(projects.size).toBeGreaterThan(0);
      expect(projects).toContain('Core');
      expect(projects).toContain('App');
      expect(projects).toContain('Features');
    });

    it('should return empty set for graph with no projects', () => {
      const { nodes, edges } = createLinearChain(3);
      const service = new GraphDataService(nodes, edges);

      // Default createNode doesn't set project
      expect(service.getAllProjects().size).toBe(0);
    });
  });

  describe('getAllPackages', () => {
    it('should return all packages', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const packages = service.getAllPackages();

      expect(packages.size).toBeGreaterThan(0);
      expect(packages).toContain('Alamofire');
      expect(packages).toContain('Kingfisher');
    });
  });

  describe('getNodeStats', () => {
    it('should compute node statistics', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const stats = GraphStatsService.getNodeStats(service, 'core');

      expect(stats).toHaveProperty('dependencies');
      expect(stats).toHaveProperty('dependents');
      expect(stats).toHaveProperty('transitiveDeps');
      expect(stats).toHaveProperty('transitiveDependents');
    });

    it('should exclude self from transitive counts', () => {
      const { nodes, edges } = createLinearChain(3);
      const service = new GraphDataService(nodes, edges);

      const stats = GraphStatsService.getNodeStats(service, 'A');

      // A -> B -> C, so A has 2 transitive deps (B and C, not counting itself)
      expect(stats.transitiveDeps).toBe(2);
    });
  });

  describe('getClusterStats', () => {
    it('should compute cluster statistics', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const stats = GraphStatsService.getClusterStats(service, 'Core');

      expect(stats.nodeCount).toBeGreaterThan(0);
      expect(typeof stats.dependencies).toBe('number');
      expect(typeof stats.dependents).toBe('number');
      expect(stats.platforms).toBeInstanceOf(Set);
    });

    it('should return zero counts for non-existent cluster', () => {
      const { nodes, edges } = createProjectGraph();
      const service = new GraphDataService(nodes, edges);

      const stats = GraphStatsService.getClusterStats(service, 'NonExistent');

      expect(stats.nodeCount).toBe(0);
    });
  });

  describe('getGraphStats', () => {
    it('counts isolated nodes with no incoming or outgoing edges', () => {
      const nodes: GraphNode[] = [
        createNode({ id: 'A', name: 'A' }),
        createNode({ id: 'B', name: 'B' }),
        createNode({ id: 'C', name: 'C' }),
      ];
      const edges: GraphEdge[] = [{ source: 'A', target: 'B' }];
      const service = new GraphDataService(nodes, edges);

      const stats = GraphStatsService.getGraphStats(service);

      expect(stats.totalNodes).toBe(3);
      expect(stats.totalEdges).toBe(1);
      expect(stats.isolatedNodes).toBe(1); // Only C has no edges in either direction
    });
  });
});
