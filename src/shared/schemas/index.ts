/**
 * Schema Module - Type exports
 *
 * Centralized exports for all types, enums, and constants used throughout the app.
 * Zod validation schemas are available via direct imports from individual .schema files.
 *
 * @module schemas
 */

// ==================== App Types ====================

export type { FilterState, FilterStateInput } from './app.types';
export {
  ACTIVE_TAB_VALUES,
  ActiveTab,
  DEFAULT_ACTIVE_TAB,
  serializeFilterState,
  VIEW_MODE_VALUES,
  ViewMode,
} from './app.types';

// ==================== Cluster Types ====================

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

// ==================== Graph Types ====================

export type { GraphData, GraphEdge, GraphNode } from './graph.types';
export {
  NODE_TYPE_VALUES,
  NodeType,
  ORIGIN_VALUES,
  Origin,
  PLATFORM_VALUES,
  Platform,
} from './graph.types';

// ==================== Simulation Types ====================

export type { ClusterPosition, NodePosition } from './simulation.types';

// ==================== Error Types ====================

export type { AppError, ErrorNotificationState } from './error.types';
export {
  DEFAULT_MAX_VISIBLE_TOASTS,
  DEFAULT_TOAST_DURATION,
  ERROR_CATEGORY_VALUES,
  ERROR_SEVERITY_VALUES,
  ErrorCategory,
  ErrorSeverity,
} from './error.types';
