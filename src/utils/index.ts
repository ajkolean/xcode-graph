/**
 * Utilities Module - Public API
 *
 * Re-exports from all utility modules for convenient imports.
 *
 * **Submodules:**
 * - `@/layout` - Layout algorithms (cluster grouping, hierarchical) [top-level]
 * - `@/utils/rendering` - Colors, icons, viewport utilities
 * - `@/utils/graph` - Node utilities, connections, and filtering
 * - `@/utils/physics` - Force calculations and collision detection
 *
 * @module utils
 */

export * from './rendering';
export * from './graph';
export * from './physics';

// ==================== General Utilities ====================

export {
  deepEqual,
  shallowEqual,
  createMemoizedSelector,
  WeakMapCache,
  LRUCache,
} from './memoization';
