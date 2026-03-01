/**
 * Utilities for node and project colors
 * Noora-aligned palette
 */
import { generateColor } from './color-generator';
/**
 * Color mapping for different node types
 * Uses the Noora palette with high contrast colors
 */
export const NODE_TYPE_COLORS = {
    // Orange (apps, main entry points) — Noora orange-500
    app: '#F59E0B',
    // Azure (frameworks, core infrastructure) — Noora azure-500
    framework: '#0EA5E9',
    // Green (libraries, utilities) — Noora green-500
    library: '#22C55E',
    // Pink (tests) — Noora pink-500
    'test-unit': '#EC4899',
    'test-ui': '#EC4899',
    // Blue (CLI tools) — Noora blue-500
    cli: '#3B82F6',
    // Yellow (packages) — Noora yellow-500
    package: '#EAB308',
};
const DEFAULT_NODE_COLOR = '#F59E0B';
/**
 * Gets the color for a node type (static fallback for DOM-based components).
 *
 * @param type - The node type string (e.g., `'app'`, `'framework'`)
 * @returns Hex color string from the Noora palette
 */
export function getNodeTypeColor(type) {
    return NODE_TYPE_COLORS[type] ?? DEFAULT_NODE_COLOR;
}
/** Map from node type to CanvasTheme key */
const THEME_KEY_MAP = {
    app: 'nodeApp',
    framework: 'nodeFramework',
    library: 'nodeLibrary',
    'test-unit': 'nodeTest',
    'test-ui': 'nodeTest',
    cli: 'nodeCli',
    package: 'nodePackage',
};
/**
 * Gets the color for a node type from a resolved CanvasTheme.
 * Use this in Canvas2D rendering to respect CSS custom property overrides.
 *
 * @param type - The node type string
 * @param theme - A resolved {@link CanvasTheme} object
 * @returns The themed color string for the given type
 */
export function getNodeTypeColorFromTheme(type, theme) {
    const key = THEME_KEY_MAP[type];
    return key ? theme[key] : theme.nodeApp;
}
/**
 * Gets a consistent color for a project name.
 *
 * @param projectName - The project name to derive a color from
 * @returns Hex color string
 */
export function getProjectColor(projectName) {
    return generateColor(projectName, 'project');
}
/**
 * Gets all node type colors for legend display.
 *
 * @returns A shallow copy of the `NODE_TYPE_COLORS` record
 */
export function getAllNodeTypeColors() {
    return { ...NODE_TYPE_COLORS };
}
//# sourceMappingURL=node-colors.js.map