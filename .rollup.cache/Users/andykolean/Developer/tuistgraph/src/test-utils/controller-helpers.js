/**
 * Controller Test Helpers - Common utilities for testing Lit controllers
 */
/**
 * Mock Reactive Controller Host for testing
 */
export class MockHost {
    controllers = [];
    updateCount = 0;
    updates = [];
    updateComplete = Promise.resolve(true);
    addController(controller) {
        this.controllers.push(controller);
    }
    removeController(controller) {
        const index = this.controllers.indexOf(controller);
        if (index >= 0) {
            this.controllers.splice(index, 1);
        }
    }
    requestUpdate(reason) {
        this.updateCount++;
        this.updates.push({
            timestamp: Date.now(),
            reason,
        });
    }
    connectedCallback() {
        for (const c of this.controllers) {
            c.hostConnected?.();
        }
    }
    disconnectedCallback() {
        for (const c of this.controllers) {
            c.hostDisconnected?.();
        }
    }
    /**
     * Reset update tracking
     */
    resetUpdateTracking() {
        this.updateCount = 0;
        this.updates = [];
    }
    /**
     * Get all controllers
     */
    getControllers() {
        return [...this.controllers];
    }
}
/**
 * Create test context with host and controller
 */
export function createControllerTestContext(controllerFactory) {
    const host = new MockHost();
    const controller = controllerFactory(host);
    return { host, controller };
}
/**
 * Wait for a condition to be true
 */
export async function waitFor(condition, options = {}) {
    const { timeout = 1000, interval = 10 } = options;
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
        const check = () => {
            if (condition()) {
                resolve();
            }
            else if (Date.now() - startTime > timeout) {
                reject(new Error('waitFor timeout'));
            }
            else {
                setTimeout(check, interval);
            }
        };
        check();
    });
}
/**
 * Wait for specific number of updates
 */
export async function waitForUpdates(host, count, timeout = 1000) {
    const initialCount = host.updateCount;
    return waitFor(() => host.updateCount >= initialCount + count, { timeout });
}
/**
 * Wait for next update
 */
export async function waitForNextUpdate(host, timeout = 1000) {
    return waitForUpdates(host, 1, timeout);
}
//# sourceMappingURL=controller-helpers.js.map