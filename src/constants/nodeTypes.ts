/**
 * Node type constants
 * Defines all available node types in the dependency graph
 */

export const NODE_TYPES = {
  APP: 'app',
  FRAMEWORK: 'framework',
  LIBRARY: 'library',
  TEST_UNIT: 'test-unit',
  TEST_UI: 'test-ui',
  CLI: 'cli',
  PACKAGE: 'package',
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

export const NODE_TYPE_LABELS: Record<string, string> = {
  [NODE_TYPES.APP]: 'App',
  [NODE_TYPES.FRAMEWORK]: 'Framework',
  [NODE_TYPES.LIBRARY]: 'Library',
  [NODE_TYPES.TEST_UNIT]: 'Unit Test',
  [NODE_TYPES.TEST_UI]: 'UI Test',
  [NODE_TYPES.CLI]: 'CLI',
  [NODE_TYPES.PACKAGE]: 'Package',
};

export const DEFAULT_NODE_TYPES = new Set<string>([
  NODE_TYPES.APP,
  NODE_TYPES.FRAMEWORK,
  NODE_TYPES.LIBRARY,
  NODE_TYPES.TEST_UNIT,
  NODE_TYPES.TEST_UI,
  NODE_TYPES.CLI,
  NODE_TYPES.PACKAGE,
]);
