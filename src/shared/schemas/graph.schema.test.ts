import { describe, expect, it } from 'vitest';
import {
  GraphDataSchema,
  GraphEdgeSchema,
  GraphNodeSchema,
  NodeTypeSchema,
  OriginSchema,
  PlatformSchema,
} from './graph.schema';

describe('NodeTypeSchema', () => {
  it('should accept valid node types', () => {
    expect(NodeTypeSchema.parse('app')).toBe('app');
    expect(NodeTypeSchema.parse('framework')).toBe('framework');
    expect(NodeTypeSchema.parse('library')).toBe('library');
    expect(NodeTypeSchema.parse('test-unit')).toBe('test-unit');
    expect(NodeTypeSchema.parse('test-ui')).toBe('test-ui');
    expect(NodeTypeSchema.parse('cli')).toBe('cli');
    expect(NodeTypeSchema.parse('package')).toBe('package');
  });

  it('should reject invalid node types', () => {
    expect(() => NodeTypeSchema.parse('invalid')).toThrow();
    expect(() => NodeTypeSchema.parse('')).toThrow();
    expect(() => NodeTypeSchema.parse(123)).toThrow();
  });
});

describe('PlatformSchema', () => {
  it('should accept valid platforms', () => {
    expect(PlatformSchema.parse('iOS')).toBe('iOS');
    expect(PlatformSchema.parse('macOS')).toBe('macOS');
    expect(PlatformSchema.parse('visionOS')).toBe('visionOS');
    expect(PlatformSchema.parse('tvOS')).toBe('tvOS');
    expect(PlatformSchema.parse('watchOS')).toBe('watchOS');
  });

  it('should reject invalid platforms', () => {
    expect(() => PlatformSchema.parse('android')).toThrow();
    expect(() => PlatformSchema.parse('ios')).toThrow(); // case-sensitive
    expect(() => PlatformSchema.parse('')).toThrow();
  });
});

describe('OriginSchema', () => {
  it('should accept valid origins', () => {
    expect(OriginSchema.parse('local')).toBe('local');
    expect(OriginSchema.parse('external')).toBe('external');
  });

  it('should reject invalid origins', () => {
    expect(() => OriginSchema.parse('remote')).toThrow();
    expect(() => OriginSchema.parse('')).toThrow();
  });
});

describe('GraphNodeSchema', () => {
  it('should validate a correct node', () => {
    const validNode = {
      id: 'test-1',
      name: 'TestNode',
      type: 'framework',
      platform: 'iOS',
      origin: 'local',
    };

    const result = GraphNodeSchema.safeParse(validNode);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validNode);
    }
  });

  it('should validate a node with optional fields', () => {
    const nodeWithOptionals = {
      id: 'test-2',
      name: 'TestNode',
      type: 'package',
      platform: 'macOS',
      origin: 'external',
      project: 'MyProject',
      targetCount: 5,
    };

    const result = GraphNodeSchema.safeParse(nodeWithOptionals);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.project).toBe('MyProject');
      expect(result.data.targetCount).toBe(5);
    }
  });

  it('should reject node with invalid type', () => {
    const invalidNode = {
      id: 'test-1',
      name: 'TestNode',
      type: 'invalid-type',
      platform: 'iOS',
      origin: 'local',
    };

    const result = GraphNodeSchema.safeParse(invalidNode);
    expect(result.success).toBe(false);
  });

  it('should reject node with empty id', () => {
    const invalidNode = {
      id: '',
      name: 'TestNode',
      type: 'framework',
      platform: 'iOS',
      origin: 'local',
    };

    const result = GraphNodeSchema.safeParse(invalidNode);
    expect(result.success).toBe(false);
  });

  it('should reject node with negative targetCount', () => {
    const invalidNode = {
      id: 'test-1',
      name: 'TestNode',
      type: 'framework',
      platform: 'iOS',
      origin: 'local',
      targetCount: -1,
    };

    const result = GraphNodeSchema.safeParse(invalidNode);
    expect(result.success).toBe(false);
  });
});

describe('GraphEdgeSchema', () => {
  it('should validate a correct edge', () => {
    const validEdge = {
      source: 'node-a',
      target: 'node-b',
    };

    const result = GraphEdgeSchema.safeParse(validEdge);
    expect(result.success).toBe(true);
  });

  it('should reject edge with empty source', () => {
    const invalidEdge = {
      source: '',
      target: 'node-b',
    };

    const result = GraphEdgeSchema.safeParse(invalidEdge);
    expect(result.success).toBe(false);
  });

  it('should reject edge with empty target', () => {
    const invalidEdge = {
      source: 'node-a',
      target: '',
    };

    const result = GraphEdgeSchema.safeParse(invalidEdge);
    expect(result.success).toBe(false);
  });
});

describe('GraphDataSchema', () => {
  it('should validate graph data with referential integrity', () => {
    const validData = {
      nodes: [
        { id: 'a', name: 'A', type: 'framework', platform: 'iOS', origin: 'local' },
        { id: 'b', name: 'B', type: 'library', platform: 'iOS', origin: 'local' },
      ],
      edges: [{ source: 'a', target: 'b' }],
    };

    const result = GraphDataSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate empty graph', () => {
    const emptyData = {
      nodes: [],
      edges: [],
    };

    const result = GraphDataSchema.safeParse(emptyData);
    expect(result.success).toBe(true);
  });

  it('should reject edges referencing non-existent source node', () => {
    const invalidData = {
      nodes: [{ id: 'a', name: 'A', type: 'framework', platform: 'iOS', origin: 'local' }],
      edges: [{ source: 'nonexistent', target: 'a' }],
    };

    const result = GraphDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toContain('edge endpoints');
    }
  });

  it('should reject edges referencing non-existent target node', () => {
    const invalidData = {
      nodes: [{ id: 'a', name: 'A', type: 'framework', platform: 'iOS', origin: 'local' }],
      edges: [{ source: 'a', target: 'nonexistent' }],
    };

    const result = GraphDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate complex graph with multiple nodes and edges', () => {
    const complexData = {
      nodes: [
        { id: 'app', name: 'MainApp', type: 'app', platform: 'iOS', origin: 'local' },
        { id: 'core', name: 'Core', type: 'framework', platform: 'iOS', origin: 'local' },
        { id: 'utils', name: 'Utils', type: 'library', platform: 'iOS', origin: 'local' },
        { id: 'pkg', name: 'Package', type: 'package', platform: 'iOS', origin: 'external' },
      ],
      edges: [
        { source: 'app', target: 'core' },
        { source: 'app', target: 'utils' },
        { source: 'core', target: 'utils' },
        { source: 'utils', target: 'pkg' },
      ],
    };

    const result = GraphDataSchema.safeParse(complexData);
    expect(result.success).toBe(true);
  });
});
