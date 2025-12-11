/**
 * Test Utilities - Centralized exports for testing helpers
 */

// Animation helpers removed - D3 runs synchronously
export {
  installAnimationFrameMock,
  MockAnimationFrame,
  uninstallAnimationFrameMock,
} from './animation-mocks';
// Comlink mocks
export { createMockComlinkWrap, MockLayoutWorkerAPI } from './comlink-mocks';
// Controller helpers
export {
  type ControllerTestContext,
  createControllerTestContext,
  MockHost,
  waitFor,
  waitForNextUpdate,
  waitForUpdates,
} from './controller-helpers';
// Worker mocks
export {
  createMockWorkerClass,
  MockLayoutWorker,
  MockLayoutWorkerWithResults,
} from './worker-mocks';
