/**
 * Shared application types
 * Prevents circular dependencies
 */

export type ViewMode = 'full' | 'focused' | 'path' | 'impact' | 'dependents' | 'both';

export interface FilterState {
  nodeTypes: Set<string>;
  platforms: Set<string>;
  origins: Set<string>;
  projects: Set<string>;
  packages: Set<string>;
}
