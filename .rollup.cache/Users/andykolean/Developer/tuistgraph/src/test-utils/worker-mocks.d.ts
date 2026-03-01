/**
 * Worker Mocks - Test utilities for Web Worker testing
 */
import type { LayoutOutput, LayoutProgress } from '@/graph/workers/layout-api';
/**
 * Mock Web Worker for layout computation
 */
export declare class MockLayoutWorker {
    private onMessageHandler;
    private onErrorHandler;
    terminated: boolean;
    messagesSent: unknown[];
    shouldError: boolean;
    errorMessage: string;
    computeDelay: number;
    /**
     * Mock postMessage
     */
    postMessage(message: unknown): void;
    /**
     * Mock addEventListener
     */
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, _options?: boolean | AddEventListenerOptions): void;
    /**
     * Mock removeEventListener
     */
    removeEventListener(type: string, _listener: EventListenerOrEventListenerObject, _options?: boolean | EventListenerOptions): void;
    /**
     * Mock terminate
     */
    terminate(): void;
    /**
     * Trigger a message event
     */
    triggerMessage(data: unknown): void;
    /**
     * Trigger an error event
     */
    triggerError(error: Error): void;
    /**
     * Simulate successful layout computation
     */
    private handleMessage;
    /**
     * Reset mock state
     */
    reset(): void;
}
/**
 * Mock worker that returns specific layout results
 */
export declare class MockLayoutWorkerWithResults extends MockLayoutWorker {
    mockOutput: LayoutOutput | null;
    mockProgress: LayoutProgress[];
    setMockOutput(output: LayoutOutput): void;
    setMockProgress(progress: LayoutProgress[]): void;
}
/**
 * Create a mock Worker class for testing
 */
export declare function createMockWorkerClass(): typeof Worker;
