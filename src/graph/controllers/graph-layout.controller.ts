/**
 * Backwards-compatible re-export.
 *
 * GraphLayoutController was consolidated into LayoutController to eliminate
 * a thin wrapper that duplicated private state and delegated every call.
 */

export type { GraphLayoutConfig } from './layout.controller';
export { LayoutController as GraphLayoutController } from './layout.controller';
