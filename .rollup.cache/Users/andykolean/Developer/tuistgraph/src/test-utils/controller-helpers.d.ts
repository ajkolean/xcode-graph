/**
 * Controller Test Helpers - Common utilities for testing Lit controllers
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit';
/**
 * Mock Reactive Controller Host for testing
 */
export declare class MockHost implements ReactiveControllerHost {
    private readonly controllers;
    updateCount: number;
    updates: Array<{
        timestamp: number;
        reason?: string | undefined;
    }>;
    readonly updateComplete: Promise<boolean>;
    addController(controller: ReactiveController): void;
    removeController(controller: ReactiveController): void;
    requestUpdate(reason?: string): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * Reset update tracking
     */
    resetUpdateTracking(): void;
    /**
     * Get all controllers
     */
    getControllers(): ReactiveController[];
}
/**
 * Create a standardized test context for controller testing
 */
export interface ControllerTestContext<T> {
    host: MockHost;
    controller: T;
}
/**
 * Create test context with host and controller
 */
export declare function createControllerTestContext<T>(controllerFactory: (host: MockHost) => T): ControllerTestContext<T>;
/**
 * Wait for a condition to be true
 */
export declare function waitFor(condition: () => boolean, options?: {
    timeout?: number;
    interval?: number;
}): Promise<void>;
/**
 * Wait for specific number of updates
 */
export declare function waitForUpdates(host: MockHost, count: number, timeout?: number): Promise<void>;
/**
 * Wait for next update
 */
export declare function waitForNextUpdate(host: MockHost, timeout?: number): Promise<void>;
