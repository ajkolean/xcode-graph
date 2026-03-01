/**
 * Web Worker API Types
 *
 * Defines the contract between main thread and layout worker.
 * Uses Comlink for type-safe, promise-based worker communication.
 */
/**
 * Helper to serialize Map for worker transfer
 */
export function serializeMap(map) {
    return Array.from(map.entries());
}
/**
 * Helper to deserialize Map from worker transfer
 */
export function deserializeMap(entries) {
    return new Map(entries);
}
//# sourceMappingURL=layout-api.js.map