/**
 * App Schema - Zod validation schemas for application state
 *
 * @module schemas/app
 */
import { z } from 'zod';
import type { FilterState, FilterStateInput } from './app.types';
import { ActiveTab, ViewMode } from './app.types';
export * from './app.types';
export declare const ActiveTabSchema: z.ZodType<ActiveTab>;
export declare const ViewModeSchema: z.ZodType<ViewMode>;
export declare const FilterStateInputSchema: z.ZodType<FilterStateInput>;
export declare const FilterStateSchema: z.ZodPipe<z.ZodType<FilterStateInput>, z.ZodTransform<FilterState, FilterStateInput>>;
