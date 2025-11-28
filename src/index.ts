/**
 * TuistGraph - Public API
 *
 * Main entry point exporting all public modules for documentation generation.
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

// ==================== Controllers ====================

export { GraphInteractionFullController } from './graph/controllers/graph-interaction-full.controller';
export {
  type GraphLayoutConfig,
  GraphLayoutController,
} from './graph/controllers/graph-layout.controller';

export {
  createMachineController,
  ZagController,
} from './shared/controllers/zag.controller';


// ==================== Utilities ====================

export * from './graph/utils';
export * from './ui/utils';

// ==================== Types ====================

export type { FilterState, FilterStateInput, ViewMode } from './shared/schemas/app.schema';
export { serializeFilterState, VIEW_MODE_VALUES } from './shared/schemas/app.schema';
export type {
  Cluster,
  ClusterBounds,
  ClusterLayoutConfig,
  ClusterNodeMetadata,
  ClusterType,
  ForceStrength,
  NodeRole,
  PositionedNode,
} from './shared/schemas/cluster.schema';
export type { ClusterPosition, NodePosition } from './shared/schemas/simulation.schema';
