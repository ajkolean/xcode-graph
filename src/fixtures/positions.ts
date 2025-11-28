/**
 * Position fixtures for layout tests
 */

export interface TestPosition {
  id: string;
  x: number;
  y: number;
  ring?: number;
}

/**
 * Create node positions in a circle
 */
export function createCircularPositions(nodeIds: string[], radius: number = 100): TestPosition[] {
  return nodeIds.map((id, index) => {
    const angle = (2 * Math.PI * index) / nodeIds.length;
    return {
      id,
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      ring: 1,
    };
  });
}

/**
 * Create node positions at origin
 */
export function createCenteredPositions(nodeIds: string[]): TestPosition[] {
  return nodeIds.map((id) => ({ id, x: 0, y: 0, ring: 0 }));
}
