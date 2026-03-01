import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Graph } from './tuist-graph.schema.generated';
import { safeParseGraph } from './tuist-graph.validation';

// Path to the fixture (copied from Swift test resources)
const FIXTURE_PATH = resolve(__dirname, '../fixtures/tuist-graph.json');

describe('tuist-graph.schema.generated types match Swift Codable JSON', () => {
  it('should parse the same graph.json that Swift decodes', () => {
    const json = readFileSync(FIXTURE_PATH, 'utf-8');
    const graph: Graph = JSON.parse(json);

    // Same assertions as Swift tests
    expect(graph.name).toBeTruthy();
    expect(graph.dependencies.length).toBeGreaterThan(0);
  });

  it('should have expected structure matching XcodeGraph types', () => {
    const json = readFileSync(FIXTURE_PATH, 'utf-8');
    const graph: Graph = JSON.parse(json);

    // Dependencies is flat alternating: [key, value, key, value, ...]
    // Count by checking every other element (keys)
    let targetCount = 0;
    let packageCount = 0;
    let _otherCount = 0;

    for (let i = 0; i < graph.dependencies.length; i += 2) {
      const source = graph.dependencies[i];
      if (typeof source === 'object' && 'target' in source) {
        targetCount++;
      } else if (typeof source === 'object' && 'packageProduct' in source) {
        packageCount++;
      } else if (typeof source === 'object') {
        _otherCount++;
      }
    }

    expect(targetCount + packageCount).toBeGreaterThan(0);
  });

  it('should have properly typed projects array', () => {
    const json = readFileSync(FIXTURE_PATH, 'utf-8');
    const graph: Graph = JSON.parse(json);

    expect(graph.projects.length).toBeGreaterThan(0);

    // projects is flat alternating: [path, Project, path, Project, ...]
    const path = graph.projects[0];
    const firstProject = graph.projects[1];

    expect(typeof path).toBe('string');
    expect(typeof firstProject).toBe('object');
    expect(firstProject).toBeDefined();
    if (typeof firstProject === 'object' && firstProject !== null && 'name' in firstProject) {
      expect(typeof firstProject.name).toBe('string');
      expect(typeof firstProject.path).toBe('string');
      expect(firstProject.targets).toBeDefined();
    }
  });

  it('should have properly typed targets within projects', () => {
    const json = readFileSync(FIXTURE_PATH, 'utf-8');
    const graph: Graph = JSON.parse(json);

    // Find a project with targets (every other element is a Project)
    for (let i = 1; i < graph.projects.length; i += 2) {
      const project = graph.projects[i];
      if (typeof project === 'object' && project !== null && 'targets' in project) {
        // targets is { [key: string]: Target } because key is String
        const targetNames = Object.keys(project.targets);
        if (targetNames.length > 0) {
          const targetName = targetNames[0]!;
          const target = project.targets[targetName]!;

          expect(typeof targetName).toBe('string');
          expect(typeof target.name).toBe('string');
          expect(typeof target.bundleId).toBe('string');
          expect(target.product).toBeDefined();
          expect(target.destinations).toBeDefined();

          return;
        }
      }
    }
  });
});

describe('safeParseGraph boundary validation against real fixture', () => {
  it('should validate the real fixture successfully', () => {
    const raw = JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8'));
    const result = safeParseGraph(raw);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.name).toBeTruthy();
    expect(result.data!.projects.length).toBeGreaterThan(0);
    expect(result.data!.dependencies.length).toBeGreaterThan(0);
    // Real fixture should have no warnings about unknown top-level fields
    expect(result.warnings).toEqual([]);
  });

  it('should preserve all data through lenient parsing', () => {
    const raw = JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8'));
    const result = safeParseGraph(raw);

    expect(result.success).toBe(true);
    // Verify the parsed data has the same shape as the raw input
    expect(result.data!.name).toBe(raw.name);
    expect(result.data!.path).toBe(raw.path);
    expect(result.data!.projects.length).toBe(raw.projects.length);
    expect(result.data!.dependencies.length).toBe(raw.dependencies.length);
  });
});
