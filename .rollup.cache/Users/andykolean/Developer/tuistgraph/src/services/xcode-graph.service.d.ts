/**
 * XcodeGraph Service
 *
 * Transforms raw XcodeGraph JSON into the application's GraphData format.
 * Uses types generated from XcodeGraph Swift sources via JSON Schema.
 *
 * Designed for forward-compatibility: unknown enum values, missing optional
 * fields, and new XcodeGraph fields produce warnings instead of crashes.
 */
import type { GraphData } from '@/shared/schemas/graph.types';
/** Result of transforming a Tuist graph, including non-fatal warnings */
export interface TransformResult {
    data: GraphData;
    warnings: string[];
}
/**
 * Transform a raw XcodeGraph JSON into our GraphData format.
 * Extracts all rich metadata from projects, targets, and dependencies.
 * Returns warnings for non-fatal issues instead of throwing.
 */
export declare function transformXcodeGraph(raw: unknown): TransformResult;
/** Load and transform an XcodeGraph from a JSON file URL */
export declare function loadXcodeGraph(jsonPath: string): Promise<TransformResult>;
/** Parse and transform an XcodeGraph from a JSON string */
export declare function parseXcodeGraph(jsonString: string): TransformResult;
