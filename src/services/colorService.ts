/**
 * Color Service - centralized color management
 * Consolidates all color-related utilities into single service
 */

import { generateColor } from '../utils/rendering/color-generator';
import { PLATFORM_COLOR } from '../utils/rendering/platform-icons';

export class ColorService {
  private colorCache: Map<string, string>;

  constructor() {
    this.colorCache = new Map();
  }

  // ==================== Node Type Colors ====================

  /**
   * Get color for node type
   */
  getNodeTypeColor(type: string): string {
    const colorMap: Record<string, string> = {
      app: '#6F2CFF', // Primary purple
      framework: '#0280B9', // Blue
      library: '#28A745', // Green
      'test-unit': '#FD791C', // Orange
      'test-ui': '#E51C01', // Red
      cli: '#A855F7', // Light purple
      package: '#FF9800', // Amber
    };

    return colorMap[type] || '#6F2CFF';
  }

  /**
   * Get all node type colors as a map
   */
  getNodeTypeColorMap(): Map<string, string> {
    const types = ['app', 'framework', 'library', 'test-unit', 'test-ui', 'cli', 'package'];
    const map = new Map<string, string>();

    types.forEach((type) => {
      map.set(type, this.getNodeTypeColor(type));
    });

    return map;
  }

  // ==================== Platform Colors ====================

  /**
   * Get color for platform
   */
  getPlatformColor(platform: string): string {
    return PLATFORM_COLOR[platform as keyof typeof PLATFORM_COLOR] || '#6F2CFF';
  }

  /**
   * Get all platform colors as a map
   */
  getPlatformColorMap(): Map<string, string> {
    const map = new Map<string, string>();

    Object.entries(PLATFORM_COLOR).forEach(([platform, color]) => {
      map.set(platform, color);
    });

    return map;
  }

  // ==================== Generated Colors ====================

  /**
   * Generate color for a name (with optional type)
   * Uses caching to ensure consistency
   */
  generateColor(name: string, type?: string): string {
    const cacheKey = type ? `${type}:${name}` : name;

    if (this.colorCache.has(cacheKey)) {
      return this.colorCache.get(cacheKey)!;
    }

    const color = generateColor(name, type);
    this.colorCache.set(cacheKey, color);

    return color;
  }

  /**
   * Generate color map for an array of items
   */
  generateColorMap(items: Iterable<string>, type?: string): Map<string, string> {
    const map = new Map<string, string>();

    for (const item of items) {
      map.set(item, this.generateColor(item, type));
    }

    return map;
  }

  // ==================== Zoom-Adjusted Colors ====================

  /**
   * Adjust color brightness based on zoom level
   * Higher zoom = brighter colors for better visibility
   */
  adjustColorForZoom(color: string, zoom: number): string {
    // Zoom range: 0.2 (min) to 2.0 (max)
    // At min zoom: darken slightly for less visual noise
    // At max zoom: brighten for better detail visibility
    const zoomFactor = Math.max(0.2, Math.min(2, zoom));

    // Brightness adjustment: -10% at min zoom, +20% at max zoom
    const brightnessAdjust = (zoomFactor - 1) * 0.15;

    return this.adjustColorBrightness(color, brightnessAdjust);
  }

  /**
   * Adjust opacity based on zoom level
   */
  adjustOpacityForZoom(baseOpacity: number, zoom: number): number {
    // Higher zoom = higher opacity for better visibility
    const zoomFactor = Math.max(0.2, Math.min(2, zoom));
    const opacityMultiplier = 0.7 + (zoomFactor - 0.2) * 0.3; // 0.7 to 1.3 range

    return Math.min(1, baseOpacity * opacityMultiplier);
  }

  // ==================== Color Utilities ====================

  /**
   * Adjust color brightness
   * @param color - Hex color string
   * @param amount - Adjustment amount (-1 to 1)
   */
  private adjustColorBrightness(color: string, amount: number): string {
    // Remove # if present
    const hex = color.replace('#', '');

    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Adjust brightness
    const adjust = (val: number) => {
      const adjusted = val + val * amount;
      return Math.max(0, Math.min(255, Math.round(adjusted)));
    };

    const newR = adjust(r);
    const newG = adjust(g);
    const newB = adjust(b);

    // Convert back to hex
    const toHex = (val: number) => val.toString(16).padStart(2, '0');

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }

  /**
   * Convert hex color to rgba
   */
  hexToRgba(hex: string, alpha: number = 1): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Get contrasting text color (black or white) for a background color
   */
  getContrastTextColor(backgroundColor: string): '#000000' | '#FFFFFF' {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  /**
   * Clear color cache
   */
  clearCache(): void {
    this.colorCache.clear();
  }

  // ==================== CSS Variable Integration ====================

  /**
   * Get primary color from CSS variables
   */
  getCSSPrimary(): string {
    if (typeof window === 'undefined') return '#6F2CFF';

    const root = getComputedStyle(document.documentElement);
    const primary = root.getPropertyValue('--primary').trim();

    // Parse rgba to hex if needed
    if (primary.startsWith('rgba')) {
      return this.rgbaToHex(primary);
    }

    return primary || '#6F2CFF';
  }

  /**
   * Convert rgba to hex
   */
  private rgbaToHex(rgba: string): string {
    const matches = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

    if (!matches) return '#6F2CFF';

    const r = parseInt(matches[1], 10);
    const g = parseInt(matches[2], 10);
    const b = parseInt(matches[3], 10);

    const toHex = (val: number) => val.toString(16).padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}

// Export singleton instance
export const colorService = new ColorService();
