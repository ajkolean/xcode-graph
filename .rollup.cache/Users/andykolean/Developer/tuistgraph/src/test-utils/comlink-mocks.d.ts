/**
 * Comlink Mocks - Test utilities for Comlink worker communication
 */
import type { LayoutInput, LayoutOutput, LayoutProgress, LayoutWorkerAPI } from '@/graph/workers/layout-api';
/**
 * Mock Comlink wrap function
 * Returns a mock LayoutWorkerAPI instead of wrapping a real worker
 */
export declare function createMockComlinkWrap(): <T>(_worker: Worker) => T;
/**
 * Create a configurable mock LayoutWorkerAPI
 */
export declare class MockLayoutWorkerAPI implements LayoutWorkerAPI {
    shouldError: boolean;
    errorMessage: string;
    computeDelay: number;
    animationDelay: number;
    mockInitialOutput: LayoutOutput;
    mockAnimatedOutput: LayoutOutput;
    computeInitialLayoutCalls: number;
    computeAnimatedLayoutCalls: number;
    cancelAnimationCalls: number;
    getStatusCalls: number;
    computeInitialLayout(_input: LayoutInput): Promise<LayoutOutput>;
    computeAnimatedLayout(input: LayoutInput, onProgress: (progress: LayoutProgress) => void): Promise<LayoutOutput>;
    cancelAnimation(): Promise<void>;
    getStatus(): Promise<{
        isAnimating: boolean;
        currentTick: number;
        totalTicks: number;
    }>;
    private delay;
    reset(): void;
}
//# sourceMappingURL=comlink-mocks.d.ts.map