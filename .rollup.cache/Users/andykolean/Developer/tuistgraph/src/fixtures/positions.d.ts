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
export declare function createCircularPositions(nodeIds: string[], radius?: number): TestPosition[];
/**
 * Create node positions at origin
 */
export declare function createCenteredPositions(nodeIds: string[]): TestPosition[];
