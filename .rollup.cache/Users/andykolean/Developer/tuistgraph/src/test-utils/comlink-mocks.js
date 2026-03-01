/**
 * Comlink Mocks - Test utilities for Comlink worker communication
 */
/**
 * Mock Comlink wrap function
 * Returns a mock LayoutWorkerAPI instead of wrapping a real worker
 */
export function createMockComlinkWrap() {
    const mockAPI = {
        async computeInitialLayout(input) {
            // Return empty layout
            return {
                nodePositions: new Map(),
                clusterPositions: new Map(),
                clusters: [],
                isAnimating: false,
                tickCount: 0,
                totalTicks: input.animationTicks ?? 0,
            };
        },
        async computeAnimatedLayout(input, onProgress) {
            // Simulate animation progress
            const totalTicks = input.animationTicks ?? 30;
            for (let i = 0; i < totalTicks; i++) {
                setTimeout(() => {
                    onProgress({
                        type: 'progress',
                        tickCount: i,
                        totalTicks,
                        nodePositions: new Map(),
                        clusterPositions: new Map(),
                    });
                }, i * 10);
            }
            // Send completion
            setTimeout(() => {
                onProgress({
                    type: 'complete',
                    tickCount: totalTicks,
                    totalTicks,
                });
            }, totalTicks * 10);
            return {
                nodePositions: new Map(),
                clusterPositions: new Map(),
                clusters: [],
                isAnimating: false,
                tickCount: totalTicks,
                totalTicks,
            };
        },
        async cancelAnimation() {
            // No-op for mock
        },
        async getStatus() {
            return {
                isAnimating: false,
                currentTick: 0,
                totalTicks: 0,
            };
        },
    };
    // Mock wrap function
    return function wrap(_worker) {
        return mockAPI;
    };
}
/**
 * Create a configurable mock LayoutWorkerAPI
 */
export class MockLayoutWorkerAPI {
    // Configuration
    shouldError = false;
    errorMessage = 'Mock worker error';
    computeDelay = 0;
    animationDelay = 10;
    // Mock data
    mockInitialOutput = {
        nodePositions: new Map(),
        clusterPositions: new Map(),
        clusters: [],
        isAnimating: false,
        tickCount: 0,
        totalTicks: 0,
    };
    mockAnimatedOutput = {
        nodePositions: new Map(),
        clusterPositions: new Map(),
        clusters: [],
        isAnimating: false,
        tickCount: 30,
        totalTicks: 30,
    };
    // State tracking
    computeInitialLayoutCalls = 0;
    computeAnimatedLayoutCalls = 0;
    cancelAnimationCalls = 0;
    getStatusCalls = 0;
    async computeInitialLayout(_input) {
        this.computeInitialLayoutCalls++;
        if (this.shouldError) {
            throw new Error(this.errorMessage);
        }
        await this.delay(this.computeDelay);
        return this.mockInitialOutput;
    }
    async computeAnimatedLayout(input, onProgress) {
        this.computeAnimatedLayoutCalls++;
        if (this.shouldError) {
            throw new Error(this.errorMessage);
        }
        const totalTicks = input.animationTicks ?? 30;
        // Send progress updates
        for (let i = 0; i < totalTicks; i++) {
            await this.delay(this.animationDelay);
            onProgress({
                type: 'progress',
                tickCount: i,
                totalTicks,
            });
        }
        // Send completion
        onProgress({
            type: 'complete',
            tickCount: totalTicks,
            totalTicks,
        });
        return this.mockAnimatedOutput;
    }
    async cancelAnimation() {
        this.cancelAnimationCalls++;
    }
    async getStatus() {
        this.getStatusCalls++;
        return {
            isAnimating: false,
            currentTick: 0,
            totalTicks: 0,
        };
    }
    // Helpers
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    reset() {
        this.computeInitialLayoutCalls = 0;
        this.computeAnimatedLayoutCalls = 0;
        this.cancelAnimationCalls = 0;
        this.getStatusCalls = 0;
        this.shouldError = false;
    }
}
//# sourceMappingURL=comlink-mocks.js.map