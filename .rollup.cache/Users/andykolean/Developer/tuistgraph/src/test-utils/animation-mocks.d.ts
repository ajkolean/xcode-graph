/**
 * Animation Mocks - Test utilities for animation/RAF testing
 */
/**
 * Mock for requestAnimationFrame with manual tick control
 */
export declare class MockAnimationFrame {
    private callbacks;
    private nextId;
    private currentTime;
    /**
     * Mock requestAnimationFrame - registers callback but doesn't execute
     */
    request(callback: FrameRequestCallback): number;
    /**
     * Mock cancelAnimationFrame
     */
    cancel(id: number): void;
    /**
     * Manually trigger one animation frame
     * @returns Number of callbacks executed
     */
    tick(deltaTime?: number): number;
    /**
     * Trigger multiple animation frames
     */
    tickMultiple(count: number, deltaTime?: number): number;
    /**
     * Check if animation is scheduled
     */
    hasPending(): boolean;
    /**
     * Get number of pending callbacks
     */
    pendingCount(): number;
    /**
     * Clear all pending callbacks
     */
    clear(): void;
    /**
     * Get current time
     */
    getCurrentTime(): number;
    /**
     * Reset mock state
     */
    reset(): void;
}
/**
 * Install mock into global scope
 */
export declare function installAnimationFrameMock(): MockAnimationFrame;
/**
 * Restore original RAF functions
 */
export declare function uninstallAnimationFrameMock(): void;
