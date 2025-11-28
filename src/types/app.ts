/**
 * Shared application types
 * Re-exports from schemas for backwards compatibility
 */

export type { FilterState, FilterStateInput, ViewMode } from '../schemas/app.schema';
export { serializeFilterState, VIEW_MODE_VALUES } from '../schemas/app.schema';

// Re-export TransitiveResult from graphTraversal
export type { TransitiveResult } from '../utils/graphTraversal';
