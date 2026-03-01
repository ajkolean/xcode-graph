/**
 * Node icon utilities for consistent node type representation
 */
import { NodeType, Platform } from '@shared/schemas/graph.types';
/**
 * Get SVG path data for app nodes based on platform
 * Each platform has a distinctive icon shape
 */
export declare function getAppIconPath(platform: Platform | string): string;
/**
 * Get SVG path data for node type icons.
 * All icons are centered at (0, 0) and sized appropriately.
 *
 * @param type - The node type to get an icon for
 * @param platform - Optional platform (used to select a platform-specific app icon)
 * @returns SVG path `d` attribute string
 */
export declare function getNodeIconPath(type: NodeType | string, platform?: Platform | string): string;
/**
 * Get a human-readable label for a node type.
 *
 * @param type - The node type to label
 * @returns Human-readable display string (e.g., `"Framework"`, `"Swift Package"`)
 */
export declare function getNodeTypeLabel(type: NodeType | string): string;
