import { z } from 'zod';

/**
 * View mode schema
 */
export const ViewModeSchema = z.enum(['full', 'focused', 'path', 'impact', 'dependents', 'both']);

/**
 * Filter state input schema - for serialization (arrays instead of Sets)
 */
export const FilterStateInputSchema = z.object({
  nodeTypes: z.array(z.string()),
  platforms: z.array(z.string()),
  origins: z.array(z.string()),
  projects: z.array(z.string()),
  packages: z.array(z.string()),
});

/**
 * Filter state schema - transforms arrays to Sets for runtime use
 */
export const FilterStateSchema = FilterStateInputSchema.transform((input) => ({
  nodeTypes: new Set(input.nodeTypes),
  platforms: new Set(input.platforms),
  origins: new Set(input.origins),
  projects: new Set(input.projects),
  packages: new Set(input.packages),
}));

/**
 * Serialize FilterState back to arrays for persistence
 */
export function serializeFilterState(state: FilterState): FilterStateInput {
  return {
    nodeTypes: Array.from(state.nodeTypes),
    platforms: Array.from(state.platforms),
    origins: Array.from(state.origins),
    projects: Array.from(state.projects),
    packages: Array.from(state.packages),
  };
}

// Type exports
export type ViewMode = z.infer<typeof ViewModeSchema>;
export type FilterStateInput = z.infer<typeof FilterStateInputSchema>;
export type FilterState = z.output<typeof FilterStateSchema>;

// Re-export schema values as array for iteration
export const VIEW_MODE_VALUES = ViewModeSchema.options;
