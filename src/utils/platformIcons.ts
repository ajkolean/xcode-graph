/**
 * Platform icon utilities for consistent platform representation
 */

// Tuist/Noora purple for all platforms
export const PLATFORM_COLOR = '#6F2CFF';

/**
 * Get the appropriate Lucide icon component name for a platform
 */
export function getPlatformIconName(platform: string): string {
  const iconMap: Record<string, string> = {
    'iOS': 'Smartphone',
    'macOS': 'Monitor',
    'visionOS': 'Glasses',
    'tvOS': 'Tv',
    'watchOS': 'Watch'
  };
  
  return iconMap[platform] || 'Store'; // Default to Store icon
}

/**
 * Get SVG path data for platform icons (for inline SVG rendering)
 * These are simplified versions of the lucide icons
 */
export function getPlatformIconPath(platform: string): string {
  const pathMap: Record<string, string> = {
    // Smartphone icon (iOS)
    'iOS': 'M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-5 18h0',
    
    // Monitor icon (macOS)
    'macOS': 'M20 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 21h8M12 17v4',
    
    // Glasses icon (visionOS)
    'visionOS': 'M6 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-6-2h0M2 13c0-2 1-3 3-3h14c2 0 3 1 3 3',
    
    // TV icon (tvOS)
    'tvOS': 'M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM17 2l-5 5-5-5',
    
    // Watch icon (watchOS)
    'watchOS': 'M9 18V5l3-3 3 3v13M9 5h6M9 18h6M6 9h12a3 3 0 0 1 3 3 3 3 0 0 1-3 3H6a3 3 0 0 1-3-3 3 3 0 0 1 3-3z'
  };
  
  return pathMap[platform] || 'M12 2v20m10-10H2'; // Default to generic store icon
}

/**
 * Get a label for the platform
 */
export function getPlatformLabel(platform: string): string {
  return platform; // Platform names are already user-friendly
}
