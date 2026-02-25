/**
 * Node icon utilities for consistent node type representation
 */

import { NodeType, Platform } from '@shared/schemas/graph.schema';

// Smartphone icon path (iOS / default)
const SMARTPHONE_ICON_PATH = `
  M-8,-16
  L8,-16
  A2,2 0 0,1 10,-14
  L10,14
  A2,2 0 0,1 8,16
  L-8,16
  A2,2 0 0,1 -10,14
  L-10,-14
  A2,2 0 0,1 -8,-16
  Z
  M-4,12
  L4,12
`;

/**
 * Get SVG path data for app nodes based on platform
 * Each platform has a distinctive icon shape
 */
export function getAppIconPath(platform: Platform | string): string {
  switch (platform) {
    case Platform.iOS:
      return SMARTPHONE_ICON_PATH;

    case Platform.macOS:
      // Monitor icon (macOS)
      return `
        M-14,-10
        L14,-10
        A2,2 0 0,1 16,-8
        L16,6
        A2,2 0 0,1 14,8
        L-14,8
        A2,2 0 0,1 -16,6
        L-16,-8
        A2,2 0 0,1 -14,-10
        Z
        M-6,12
        L6,12
        M0,8
        L0,12
      `;

    case Platform.visionOS:
      // Glasses icon (visionOS)
      return `
        M-6,-2
        A4,4 0 1,0 -6,6
        A4,4 0 1,0 -6,-2
        M6,-2
        A4,4 0 1,0 6,6
        A4,4 0 1,0 6,-2
        M-2,2
        L2,2
        M-14,-6
        A8,8 0 0,1 -6,-10
        M14,-6
        A8,8 0 0,1 6,-10
      `;

    case Platform.tvOS:
      // TV icon (tvOS)
      return `
        M-14,-2
        L14,-2
        A2,2 0 0,1 16,0
        L16,12
        A2,2 0 0,1 14,14
        L-14,14
        A2,2 0 0,1 -16,12
        L-16,0
        A2,2 0 0,1 -14,-2
        Z
        M-8,-14
        L0,-6
        L8,-14
      `;

    case Platform.watchOS:
      // Watch icon (watchOS)
      return `
        M-6,-16
        L6,-16
        L8,-12
        L8,12
        L6,16
        L-6,16
        L-8,12
        L-8,-12
        Z
        M-10,-4
        L-16,-4
        A2,2 0 0,0 -18,-2
        A2,2 0 0,0 -16,0
        L-10,0
        M10,-4
        L16,-4
        A2,2 0 0,1 18,-2
        A2,2 0 0,1 16,0
        L10,0
      `;

    default:
      // Default smartphone for unknown platforms
      return SMARTPHONE_ICON_PATH;
  }
}

/**
 * Get SVG path data for node type icons
 * All icons are centered at (0, 0) and sized appropriately
 */
export function getNodeIconPath(type: NodeType | string, platform?: Platform | string): string {
  if (type === NodeType.App && platform) {
    return getAppIconPath(platform);
  }

  switch (type) {
    case NodeType.App:
      // Default smartphone icon if no platform specified
      return getAppIconPath(Platform.iOS);

    case NodeType.Framework:
      // Triangle (simple geometric shape)
      return `
        M0,-14
        L12,12
        L-12,12
        Z
      `;

    case NodeType.Library:
      // Pentagon (simple geometric shape)
      return `
        M0,-14
        L13,-4
        L8,13
        L-8,13
        L-13,-4
        Z
      `;

    case NodeType.TestUnit:
      // Flask icon (testing)
      return `
        M-6,-14 
        L-6,-4 
        L-10,8 
        L-10,12 
        A3,3 0 0,0 -7,15
        L7,15 
        A3,3 0 0,0 10,12
        L10,8 
        L6,-4 
        L6,-14
        M-6,-14 
        L6,-14
        M-8,8
        L8,8
      `;

    case NodeType.TestUi:
      // Microscope icon
      return `
        M-12,14 
        L12,14
        M-2,-14 
        L2,-14
        M0,-14 
        L0,-4
        M-6,-4 
        L6,-4
        M0,-4 
        L-4,6
        M-4,6 
        L0,14
        M-6,6
        A2,2 0 0,1 -4,8
        A2,2 0 0,1 -6,10
        A2,2 0 0,1 -8,8
        A2,2 0 0,1 -6,6
      `;

    case NodeType.Cli:
      // Terminal icon
      return `
        M-14,-12 
        L14,-12 
        A2,2 0 0,1 16,-10
        L16,10 
        A2,2 0 0,1 14,12
        L-14,12 
        A2,2 0 0,1 -16,10
        L-16,-10 
        A2,2 0 0,1 -14,-12
        Z
        M-8,-4 
        L-2,0 
        L-8,4
        M2,4 
        L8,4
      `;

    case NodeType.Package:
      // Package/Box icon
      return `
        M-12,-6 
        L0,-12 
        L12,-6 
        L12,6 
        L0,12 
        L-12,6 
        Z
        M0,-12 
        L0,12
        M-12,-6 
        L0,0 
        L12,-6
      `;

    default:
      // Circle fallback
      return `
        M0,-12 
        A12,12 0 1,1 0,12 
        A12,12 0 1,1 0,-12
      `;
  }
}

/**
 * Get a human-readable label for a node type
 */
export function getNodeTypeLabel(type: NodeType | string): string {
  const labels: Record<string, string> = {
    [NodeType.App]: 'App Target',
    [NodeType.Framework]: 'Framework',
    [NodeType.Library]: 'Library',
    [NodeType.TestUnit]: 'Unit Test',
    [NodeType.TestUi]: 'UI Test',
    [NodeType.Cli]: 'CLI Tool',
    [NodeType.Package]: 'Swift Package',
  };

  return labels[type] || type;
}
