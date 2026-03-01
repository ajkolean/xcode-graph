/**
 * Utilities for node and project colors
 * Noora-aligned palette
 */
import type { CanvasTheme } from '@graph/utils/canvas-theme';
/**
 * Color mapping for different node types
 * Uses the Noora palette with high contrast colors
 */
export declare const NODE_TYPE_COLORS: Record<string, string>;
/**
 * Gets the color for a node type (static fallback for DOM-based components).
 *
 * @param type - The node type string (e.g., `'app'`, `'framework'`)
 * @returns Hex color string from the Noora palette
 */
export declare function getNodeTypeColor(type: string): string;
/**
 * Gets the color for a node type from a resolved CanvasTheme.
 * Use this in Canvas2D rendering to respect CSS custom property overrides.
 *
 * @param type - The node type string
 * @param theme - A resolved {@link CanvasTheme} object
 * @returns The themed color string for the given type
 */
export declare function getNodeTypeColorFromTheme(type: string, theme: CanvasTheme): string;
/**
 * Gets a consistent color for a project name.
 *
 * @param projectName - The project name to derive a color from
 * @returns Hex color string
 */
export declare function getProjectColor(projectName: string): string;
/**
 * Gets all node type colors for legend display.
 *
 * @returns A shallow copy of the `NODE_TYPE_COLORS` record
 */
export declare function getAllNodeTypeColors(): Record<string, string>;
//# sourceMappingURL=node-colors.d.ts.map