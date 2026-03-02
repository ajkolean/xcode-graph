/**
 * Schema Module - Type, enum, and constant exports
 *
 * Centralized exports for all types, enums, and constants.
 * Zod validation schemas are NOT re-exported here to keep Zod out of the
 * main bundle. Import directly from the individual `.schema` files when
 * validation is needed (e.g., in tests).
 *
 * @module schemas
 */

export type { FilterState, FilterStateInput } from './app.types';
export {
  ACTIVE_TAB_VALUES,
  ActiveTab,
  DEFAULT_ACTIVE_TAB,
  serializeFilterState,
  VIEW_MODE_VALUES,
  ViewMode,
} from './app.types';
export type {
  Cluster,
  ClusterBounds,
  ClusterLayoutConfig,
  ClusterNodeMetadata,
  ClusterSerialized,
  ForceStrength,
  PositionedNode,
} from './cluster.types';
export {
  CLUSTER_TYPE_VALUES,
  ClusterType,
  DEFAULT_CLUSTER_CONFIG,
  NODE_ROLE_VALUES,
  NodeRole,
} from './cluster.types';
export type { AppError, ErrorNotificationState } from './error.types';
export {
  DEFAULT_MAX_VISIBLE_TOASTS,
  DEFAULT_TOAST_DURATION,
  ErrorCategory,
  ErrorSeverity,
} from './error.types';
export type { GraphData, GraphEdge, GraphNode } from './graph.types';
export {
  NODE_TYPE_VALUES,
  NodeType,
  ORIGIN_VALUES,
  Origin,
  PLATFORM_VALUES,
  Platform,
} from './graph.types';
export type { ClusterPosition, NodePosition } from './simulation.types';
