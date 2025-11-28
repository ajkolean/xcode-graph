/**
 * TuistGraph - Public API
 *
 * Main entry point exporting all public modules for documentation generation.
 *
 * @packageDocumentation
 */

// ==================== Schemas ====================

export * from './schemas';

// ==================== Stores ====================

export * from './stores';

// ==================== Services ====================

export * from './services';

// ==================== State Machines ====================

export * from './machines';

// ==================== Controllers ====================

export {
  GraphLayoutController,
  type GraphLayoutConfig,
} from './controllers/graph-layout.controller';

export {
  GraphInteractionController,
  type GraphInteractionConfig,
} from './controllers/graph-interaction.controller';

export {
  GraphInteractionFullController,
} from './controllers/graph-interaction-full.controller';

export {
  ZagController,
  createMachineController,
} from './controllers/zag.controller';

export {
  ZustandController,
  createStoreController,
} from './controllers/zustand.controller';

// ==================== Utilities ====================

export * from './utils';

// ==================== Types ====================
// Note: TransitiveResult is exported from ./utils, so we exclude it here to avoid duplicates

export type { FilterState, FilterStateInput, ViewMode } from './types/app';
export { serializeFilterState, VIEW_MODE_VALUES } from './types/app';
export type * from './types/cluster';
export type * from './types/simulation';
