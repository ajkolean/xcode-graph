import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { NodeType, Platform } from '@/shared/schemas/graph.types';
import { transformXcodeGraph } from './xcode-graph.service';
import { safeParseGraph } from './xcode-graph.validation';

const FIXTURE_PATH = resolve(__dirname, '../fixtures/xcode-graph.json');
const FUTURE_FIXTURE_PATH = resolve(__dirname, '../fixtures/xcode-graph-future.json');

function loadFixture(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

describe('forward-compatibility: future fixture with unknown fields/enums', () => {
  it('should transform a fixture with unknown top-level fields', () => {
    const raw = loadFixture(FUTURE_FIXTURE_PATH);
    const result = transformXcodeGraph(raw);

    expect(result.data.nodes.length).toBeGreaterThan(0);
    expect(result.data.edges.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes('schemaVersion'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('futureField'))).toBe(true);
  });

  it('should handle unknown product type "widgetExtension" gracefully', () => {
    const raw = loadFixture(FUTURE_FIXTURE_PATH);
    const result = transformXcodeGraph(raw);

    const widgetNode = result.data.nodes.find((n) => n.name === 'WidgetExtension');
    if (!widgetNode) {
      expect.fail('expected WidgetExtension node');
    }
    // Unknown product type should fall back to Library
    expect(widgetNode.type).toBe(NodeType.Library);
    expect(result.warnings.some((w) => w.includes('widgetExtension'))).toBe(true);
  });

  it('should handle unknown platform key in deployment targets', () => {
    const raw = loadFixture(FUTURE_FIXTURE_PATH);
    const result = transformXcodeGraph(raw);

    const appNode = result.data.nodes.find((n) => n.name === 'FutureApp');
    if (!appNode) {
      expect.fail('expected FutureApp node');
    }
    // Should still detect iOS as the primary platform
    expect(appNode.platform).toBe(Platform.iOS);
  });

  it('should handle extra unknown fields on targets', () => {
    const raw = loadFixture(FUTURE_FIXTURE_PATH);
    const result = transformXcodeGraph(raw);

    // Transform should still succeed with extra fields on targets
    const appNode = result.data.nodes.find((n) => n.name === 'FutureApp');
    if (!appNode) {
      expect.fail('expected FutureApp node');
    }
    expect(appNode.tags).toEqual(['future']);
  });

  it('should handle known product types normally alongside unknown ones', () => {
    const raw = loadFixture(FUTURE_FIXTURE_PATH);
    const result = transformXcodeGraph(raw);

    const appNode = result.data.nodes.find((n) => n.name === 'FutureApp');
    if (!appNode) {
      expect.fail('expected FutureApp node');
    }
    expect(appNode.type).toBe(NodeType.App);

    const coreNode = result.data.nodes.find((n) => n.name === 'CoreLib');
    if (!coreNode) {
      expect.fail('expected CoreLib node');
    }
    expect(coreNode.type).toBe(NodeType.Framework);
  });
});

describe('forward-compatibility: missing or empty sections', () => {
  it('should handle empty projects array', () => {
    const raw = {
      name: 'EmptyGraph',
      path: '/tmp/empty',
      projects: [],
      dependencies: [],
      workspace: {},
      packages: [],
      dependencyConditions: [],
    };

    const result = transformXcodeGraph(raw);

    expect(result.data.nodes).toEqual([]);
    expect(result.data.edges).toEqual([]);
    expect(result.warnings.some((w) => w.includes('no projects'))).toBe(true);
  });

  it('should handle empty dependencies array', () => {
    const raw = loadFixture(FUTURE_FIXTURE_PATH) as Record<string, unknown>;
    // biome-ignore lint/complexity/useLiteralKeys: bracket notation required for Record index signature (TS4111)
    raw['dependencies'] = [];
    const result = transformXcodeGraph(raw);

    expect(result.data.nodes.length).toBeGreaterThan(0);
    expect(result.data.edges).toEqual([]);
  });

  it('should handle missing packages key (via looseObject passthrough)', () => {
    const raw = {
      name: 'NoPackages',
      path: '/tmp/nopackages',
      projects: [],
      dependencies: [],
    };

    const result = transformXcodeGraph(raw);
    expect(result.data.nodes).toEqual([]);
    expect(result.data.edges).toEqual([]);
  });

  it('should fail gracefully for completely invalid input', () => {
    const result = transformXcodeGraph('not an object');
    expect(result.data.nodes).toEqual([]);
    expect(result.data.edges).toEqual([]);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should fail gracefully for null input', () => {
    const result = transformXcodeGraph(null);
    expect(result.data.nodes).toEqual([]);
    expect(result.data.edges).toEqual([]);
    expect(result.warnings.some((w) => w.includes('not an object'))).toBe(true);
  });

  it('should fail gracefully for missing required fields', () => {
    const result = transformXcodeGraph({ name: 'Incomplete' });
    expect(result.data.nodes).toEqual([]);
    expect(result.data.edges).toEqual([]);
    expect(result.warnings.some((w) => w.includes('validation failed'))).toBe(true);
  });
});

describe('safeParseGraph boundary validation', () => {
  it('should accept the real fixture with no errors', () => {
    const raw = loadFixture(FIXTURE_PATH);
    const result = safeParseGraph(raw);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should accept future fixture with warnings about unknown fields', () => {
    const raw = loadFixture(FUTURE_FIXTURE_PATH);
    const result = safeParseGraph(raw);

    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.includes('schemaVersion'))).toBe(true);
  });

  it('should reject non-object input', () => {
    const result = safeParseGraph(42);
    expect(result.success).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should reject object missing required fields', () => {
    const result = safeParseGraph({ name: 'Test' });
    expect(result.success).toBe(false);
    expect(result.warnings.some((w) => w.includes('validation failed'))).toBe(true);
  });

  it('should warn about odd-length projects array', () => {
    const raw = {
      name: 'Odd',
      path: '/tmp',
      projects: ['single-item'],
      dependencies: [],
    };
    const result = safeParseGraph(raw);
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.includes('odd length'))).toBe(true);
  });
});

describe('real fixture transforms correctly', () => {
  it('should transform the real fixture with zero warnings', () => {
    const raw = loadFixture(FIXTURE_PATH);
    const result = transformXcodeGraph(raw);

    expect(result.data.nodes.length).toBeGreaterThan(0);
    expect(result.data.edges.length).toBeGreaterThan(0);
    expect(result.warnings).toEqual([]);
  });
});
