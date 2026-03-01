/**
 * App Schema - Zod validation schemas for application state
 *
 * @module schemas/app
 */

import { z } from 'zod';
import type { FilterState, FilterStateInput } from './app.types';
import { ActiveTab, ViewMode } from './app.types';
import type { NodeType, Origin, Platform } from './graph.types';

// Re-export all types for backward compatibility
export * from './app.types';

export const ActiveTabSchema: z.ZodType<ActiveTab> = z.enum(ActiveTab);
export const ViewModeSchema: z.ZodType<ViewMode> = z.enum(ViewMode);

export const FilterStateInputSchema: z.ZodType<FilterStateInput> = z.object({
  nodeTypes: z.array(z.string()),
  platforms: z.array(z.string()),
  origins: z.array(z.string()),
  projects: z.array(z.string()),
  packages: z.array(z.string()),
});

export const FilterStateSchema: z.ZodPipe<
  z.ZodType<FilterStateInput>,
  z.ZodTransform<FilterState, FilterStateInput>
> = FilterStateInputSchema.transform((input) => ({
  nodeTypes: new Set(input.nodeTypes) as Set<NodeType>,
  platforms: new Set(input.platforms) as Set<Platform>,
  origins: new Set(input.origins) as Set<Origin>,
  projects: new Set(input.projects),
  packages: new Set(input.packages),
}));
