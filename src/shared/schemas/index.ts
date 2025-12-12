/**
 * Schema Module - Zod validation schemas
 *
 * Centralized exports for all validation schemas used throughout the app.
 * Provides type-safe validation for graph data, app state, clusters, and simulation.
 *
 * @module schemas
 */

// ==================== App Schemas ====================

export type { FilterState, FilterStateInput } from "./app.schema";
export {
  ACTIVE_TAB_VALUES,
  ActiveTab,
  ActiveTabSchema,
  DEFAULT_ACTIVE_TAB,
  FilterStateInputSchema,
  FilterStateSchema,
  serializeFilterState,
  VIEW_MODE_VALUES,
  ViewMode,
  ViewModeSchema,
} from "./app.schema";

// ==================== Cluster Schemas ====================

export type {
  Cluster,
  ClusterBounds,
  ClusterLayoutConfig,
  ClusterNodeMetadata,
  ClusterSerialized,
  ForceStrength,
  PositionedNode,
} from "./cluster.schema";
export {
  CLUSTER_TYPE_VALUES,
  ClusterBoundsSchema,
  ClusterLayoutConfigSchema,
  ClusterNodeMetadataSchema,
  ClusterSchema,
  ClusterType,
  ClusterTypeSchema,
  DEFAULT_CLUSTER_CONFIG,
  ForceStrengthSchema,
  NODE_ROLE_VALUES,
  NodeRole,
  NodeRoleSchema,
  PositionedNodeSchema,
} from "./cluster.schema";

// ==================== Graph Schemas ====================

export type { GraphData, GraphEdge, GraphNode } from "./graph.schema";
export {
  GraphDataSchema,
  GraphEdgeSchema,
  GraphNodeSchema,
  NODE_TYPE_VALUES,
  NodeType,
  NodeTypeSchema,
  ORIGIN_VALUES,
  Origin,
  OriginSchema,
  PLATFORM_VALUES,
  Platform,
  PlatformSchema,
} from "./graph.schema";

// ==================== Simulation Schemas ====================

export type { ClusterPosition, NodePosition } from "./simulation.schema";
export { ClusterPositionSchema, NodePositionSchema } from "./simulation.schema";

// ==================== Error Schemas ====================

export type { AppError, ErrorNotificationState } from "./error.schema";
export {
  AppErrorSchema,
  DEFAULT_MAX_VISIBLE_TOASTS,
  DEFAULT_TOAST_DURATION,
  ERROR_CATEGORY_VALUES,
  ERROR_SEVERITY_VALUES,
  ErrorCategory,
  ErrorCategorySchema,
  ErrorNotificationStateSchema,
  ErrorSeverity,
  ErrorSeveritySchema,
} from "./error.schema";
