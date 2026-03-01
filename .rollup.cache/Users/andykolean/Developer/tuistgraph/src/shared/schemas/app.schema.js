/**
 * App Schema - Zod validation schemas for application state
 *
 * @module schemas/app
 */
import { z } from 'zod';
import { ActiveTab, ViewMode } from './app.types';
// Re-export all types for backward compatibility
export * from './app.types';
// ==================== Enum Schemas ====================
export const ActiveTabSchema = z.enum(ActiveTab);
export const ViewModeSchema = z.enum(ViewMode);
// ==================== Filter State Schemas ====================
export const FilterStateInputSchema = z.object({
    nodeTypes: z.array(z.string()),
    platforms: z.array(z.string()),
    origins: z.array(z.string()),
    projects: z.array(z.string()),
    packages: z.array(z.string()),
});
export const FilterStateSchema = FilterStateInputSchema.transform((input) => ({
    nodeTypes: new Set(input.nodeTypes),
    platforms: new Set(input.platforms),
    origins: new Set(input.origins),
    projects: new Set(input.projects),
    packages: new Set(input.packages),
}));
//# sourceMappingURL=app.schema.js.map