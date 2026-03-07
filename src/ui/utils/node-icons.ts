/**
 * Node icon utilities for consistent node type representation
 */

import { NodeType, Platform } from '@shared/schemas/graph.types';

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
 * Get SVG path data for app nodes based on platform.
 * Each platform has a distinctive icon shape (smartphone, monitor, glasses, etc.).
 *
 * @param platform - Platform identifier (e.g., `Platform.iOS`, `Platform.macOS`)
 * @returns SVG path `d` attribute string centered at (0, 0)
 */
export function getAppIconPath(platform: Platform | string): string {
  switch (platform) {
    case Platform.iOS:
      return SMARTPHONE_ICON_PATH;

    case Platform.macOS:
      // Laptop icon (macOS) — MacBook silhouette with screen + keyboard base
      return `
        M-12,-12
        L12,-12
        A2,2 0 0,1 14,-10
        L14,4
        A2,2 0 0,0 14.2,4.9
        L16,8
        A1,1 0 0,1 15,9.5
        L-15,9.5
        A1,1 0 0,1 -16,8
        L-14.2,4.9
        A2,2 0 0,0 -14,4
        L-14,-10
        A2,2 0 0,1 -12,-12
        Z
        M-14,5
        L14,5
      `;

    case Platform.visionOS:
      // Glasses icon (visionOS) — Lucide glasses: two lens circles + bridge + temple arms
      return `
        M-2,3
        A4,4 0 1,1 -10,3
        A4,4 0 1,1 -2,3
        Z
        M10,3
        A4,4 0 1,1 2,3
        A4,4 0 1,1 10,3
        Z
        M2,3
        A2,2 0 0,0 -2,3
        M-9.5,1
        L-7,-5
        C-6.3,-6.3 -5.6,-7 -4,-7
        M9.5,1
        L7,-5
        C6.3,-6.3 5.5,-7 4,-7
      `;

    case Platform.tvOS:
      // TV icon (tvOS) — modern flat screen + stand bar (no antenna)
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

    case Platform.watchOS:
      // Watch icon (watchOS) — Lucide watch: round face + band straps + clock hands
      return `
        M6,0
        A6,6 0 1,1 -6,0
        A6,6 0 1,1 6,0
        Z
        M0,-2
        L0,0.2
        L1.6,1
        M4.13,-4.34
        L3.32,-8.39
        A2,2 0 0,0 1.32,-10
        L-1.36,-10
        A2,2 0 0,0 -3.36,-8.39
        L-4.14,-4.34
        M-4.12,4.36
        L-3.32,8.36
        A2,2 0 0,0 -1.32,10
        L1.4,10
        A2,2 0 0,0 3.4,8.39
        L4.21,4.31
      `;

    default:
      // Default smartphone for unknown platforms
      return SMARTPHONE_ICON_PATH;
  }
}

/**
 * Get SVG path data for node type icons.
 * All icons are centered at (0, 0) and sized appropriately.
 *
 * @param type - The node type to get an icon for
 * @param platform - Optional platform (used to select a platform-specific app icon)
 * @returns SVG path `d` attribute string
 *
 * @public
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
 * Get a human-readable label for a node type.
 *
 * @param type - The node type to label
 * @returns Human-readable display string (e.g., `"Framework"`, `"Swift Package"`)
 *
 * @public
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
