/**
 * Worker Mocks - Test utilities for Web Worker testing
 */
/**
 * Mock Web Worker for layout computation
 */
export class MockLayoutWorker {
    onMessageHandler = null;
    onErrorHandler = null;
    // Mock state
    terminated = false;
    messagesSent = [];
    // Mock behavior configuration
    shouldError = false;
    errorMessage = 'Mock worker error';
    computeDelay = 0;
    /**
     * Mock postMessage
     */
    postMessage(message) {
        if (this.terminated) {
            throw new Error('Worker has been terminated');
        }
        this.messagesSent.push(message);
        // Auto-respond based on message type
        setTimeout(() => {
            if (this.shouldError) {
                this.triggerError(new Error(this.errorMessage));
            }
            else {
                this.handleMessage(message);
            }
        }, this.computeDelay);
    }
    /**
     * Mock addEventListener
     */
    addEventListener(type, listener, _options) {
        if (type === 'message') {
            this.onMessageHandler = listener;
        }
        else if (type === 'error') {
            this.onErrorHandler = listener;
        }
    }
    /**
     * Mock removeEventListener
     */
    removeEventListener(type, _listener, _options) {
        if (type === 'message') {
            this.onMessageHandler = null;
        }
        else if (type === 'error') {
            this.onErrorHandler = null;
        }
    }
    /**
     * Mock terminate
     */
    terminate() {
        this.terminated = true;
        this.onMessageHandler = null;
        this.onErrorHandler = null;
    }
    // ========================================
    // Test Helpers
    // ========================================
    /**
     * Trigger a message event
     */
    triggerMessage(data) {
        if (this.onMessageHandler) {
            const event = new MessageEvent('message', { data });
            this.onMessageHandler(event);
        }
    }
    /**
     * Trigger an error event
     */
    triggerError(error) {
        if (this.onErrorHandler) {
            const event = new ErrorEvent('error', {
                message: error.message,
                error,
            });
            this.onErrorHandler(event);
        }
    }
    /**
     * Simulate successful layout computation
     */
    handleMessage(_message) {
        // Simple mock response - return empty layout
        const mockOutput = {
            nodePositions: new Map(),
            clusterPositions: new Map(),
            clusters: [],
            isAnimating: false,
            tickCount: 0,
            totalTicks: 0,
        };
        this.triggerMessage(mockOutput);
    }
    /**
     * Reset mock state
     */
    reset() {
        this.messagesSent = [];
        this.terminated = false;
        this.shouldError = false;
        this.computeDelay = 0;
    }
}
/**
 * Mock worker that returns specific layout results
 */
export class MockLayoutWorkerWithResults extends MockLayoutWorker {
    mockOutput = null;
    mockProgress = [];
    setMockOutput(output) {
        this.mockOutput = output;
    }
    setMockProgress(progress) {
        this.mockProgress = progress;
    }
}
/**
 * Create a mock Worker class for testing
 */
export function createMockWorkerClass() {
    let instance = null;
    // @ts-expect-error - Mocking Worker class
    const MockWorkerClass = class extends MockLayoutWorker {
        constructor(_scriptURL, _options) {
            super();
            instance = this;
        }
    };
    // Helper to get the created instance
    // @ts-expect-error - Adding test helper
    MockWorkerClass.getInstance = () => instance;
    return MockWorkerClass;
}
//# sourceMappingURL=worker-mocks.js.map