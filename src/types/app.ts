/**
 * Shared application types
 * Re-exports from schemas for backwards compatibility
 */

export type { ViewMode, FilterState, FilterStateInput } from '../schemas/app.schema';
export { serializeFilterState, VIEW_MODE_VALUES } from '../schemas/app.schema';
