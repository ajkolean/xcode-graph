/**
 * 3D Node icon utilities for isometric/3D node type representation
 *
 * All 3D shapes use an isometric projection for a consistent 3D look.
 * The shapes are designed to give depth perception while remaining
 * readable and distinct.
 */

/**
 * Get SVG path data for 3D app nodes based on platform
 * Uses isometric box/device shapes
 */
export function getAppIconPath3D(platform: string): string {
  switch (platform) {
    case 'iOS':
      // 3D Smartphone - isometric phone shape
      return `
        M-6,-16 L6,-16 L10,-12 L10,12 L6,16 L-6,16 L-10,12 L-10,-12 Z
        M-6,-16 L-6,16
        M6,-16 L6,16 L10,12
        M-3,12 L3,12
      `;

    case 'macOS':
      // 3D Monitor - isometric display
      return `
        M-12,-10 L12,-10 L16,-6 L16,4 L12,8 L-12,8 L-16,4 L-16,-6 Z
        M-12,-10 L-12,8
        M12,-10 L12,8 L16,4
        M-4,12 L4,12
        M0,8 L0,12
      `;

    case 'visionOS':
      // 3D Glasses - isometric goggles
      return `
        M-12,-4 L-4,-8 L4,-8 L12,-4 L12,4 L4,8 L-4,8 L-12,4 Z
        M-8,-2 A4,4 0 1,0 -8,2 A4,4 0 1,0 -8,-2
        M8,-2 A4,4 0 1,0 8,2 A4,4 0 1,0 8,-2
        M-4,0 L4,0
      `;

    case 'tvOS':
      // 3D TV - isometric television
      return `
        M-14,-4 L14,-4 L18,0 L18,10 L14,14 L-14,14 L-18,10 L-18,0 Z
        M-14,-4 L-14,14
        M14,-4 L14,14 L18,10
        M-6,-14 L0,-8 L6,-14
      `;

    case 'watchOS':
      // 3D Watch - isometric wrist device
      return `
        M-5,-14 L5,-14 L8,-11 L8,11 L5,14 L-5,14 L-8,11 L-8,-11 Z
        M-5,-14 L-5,14
        M5,-14 L5,14 L8,11
        M-10,-2 L-14,-2 L-14,2 L-10,2
        M10,-2 L14,-2 L14,2 L10,2
      `;

    default:
      return getAppIconPath3D('iOS');
  }
}

/**
 * Get SVG path data for 3D node type icons
 * Uses isometric projections of the 2D shapes to create depth
 */
export function getNodeIconPath3D(type: string, platform?: string): string {
  if (type === 'app' && platform) {
    return getAppIconPath3D(platform);
  }

  switch (type) {
    case 'app':
      return getAppIconPath3D('iOS');

    case 'framework':
      // Triangular Prism - 3D triangle with depth
      // Front face + back face + connecting edges
      return `
        M0,-12 L10,10 L-10,10 Z
        M4,-8 L14,6 L-6,14 L-6,14
        M0,-12 L4,-8
        M10,10 L14,6
        M-10,10 L-6,14
        M4,-8 L14,6 L-6,14 Z
      `;

    case 'library':
      // Pentagonal Prism - 3D pentagon with depth
      return `
        M0,-12 L11,-3 L7,11 L-7,11 L-11,-3 Z
        M4,-9 L15,0 L11,14 L-3,14 L-7,0
        M0,-12 L4,-9
        M11,-3 L15,0
        M7,11 L11,14
        M-7,11 L-3,14
        M-11,-3 L-7,0
      `;

    case 'test-unit':
      // 3D Flask - isometric lab flask
      return `
        M-5,-12 L-5,-4 L-9,6 L-9,10 L9,10 L9,6 L5,-4 L5,-12
        M-5,-12 L5,-12
        M-2,-8 L-2,-4 L-6,6 L-6,10 L6,10 L6,6 L2,-4 L2,-8
        M-7,6 L7,6
      `;

    case 'test-ui':
      // 3D Microscope - isometric lab instrument
      return `
        M-10,12 L10,12 L14,16 L-6,16 Z
        M-1,-12 L1,-12 L3,-10 L3,-4 L1,-2 L-1,-2 L-3,-4 L-3,-10 Z
        M0,-2 L-3,8 L0,14
        M-5,6 A3,3 0 0,1 -3,9 A3,3 0 0,1 -7,9 A3,3 0 0,1 -5,6
      `;

    case 'cli':
      // 3D Terminal - isometric command box
      return `
        M-12,-10 L12,-10 L16,-6 L16,8 L12,12 L-12,12 L-16,8 L-16,-6 Z
        M-12,-10 L-12,12
        M12,-10 L12,12 L16,8
        M-7,-3 L-2,1 L-7,5
        M1,5 L7,5
      `;

    case 'package':
      // 3D Package Box - isometric cube with tape
      return `
        M-10,-8 L0,-14 L10,-8 L10,6 L0,12 L-10,6 Z
        M0,-14 L0,12
        M-10,-8 L0,-2 L10,-8
        M0,-2 L0,12
        M-10,6 L0,0
        M10,6 L0,0
      `;

    default:
      // 3D Sphere fallback - circle with shading lines
      return `
        M0,-10 A10,10 0 1,1 0,10 A10,10 0 1,1 0,-10
        M-8,-4 Q0,-8 8,-4
        M-8,0 Q0,-4 8,0
        M-8,4 Q0,0 8,4
      `;
  }
}
