/**
 * Services Module - Business logic and data access
 *
 * Provides centralized access to all service layer functionality:
 * - GraphDataService: Graph data operations and queries
 * - GraphLoader: Progressive graph loading
 *
 * @module services
 */

export { GraphDataService } from './graphDataService';
export { GraphLoader, type LoadProgress, type ProgressiveLoadConfig } from './graph-loader';
