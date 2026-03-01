/**
 * TuistGraph - Public API
 *
 * Entry point for API Extractor containing all public modules
 * and utilities for graph visualization.
 *
 * @packageDocumentation
 */

// ==================== Schemas ====================

export * from './shared/schemas';

// ==================== Signals ====================

export * from './graph/signals';
export * from './shared/signals';

// ==================== Services ====================

export * from './services';

// ==================== State Machines ====================

export * from './shared/machines';

// ==================== Types ====================

export type { FilterState, FilterStateInput, ViewMode } from './shared/schemas/app.types';
export { serializeFilterState, VIEW_MODE_VALUES } from './shared/schemas/app.types';
export type {
  Cluster,
  ClusterBounds,
  ClusterLayoutConfig,
  ClusterNodeMetadata,
  ClusterType,
  ForceStrength,
  NodeRole,
  PositionedNode,
} from './shared/schemas/cluster.types';
export type { ClusterPosition, NodePosition } from './shared/schemas/simulation.types';

// ==================== Utility Modules ====================

export * from './graph/layout';
export * from './graph/utils';
export * from './ui/utils';

// ==================== Library ====================

export { VanillaMachine } from '@zag-js/vanilla';
