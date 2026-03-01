/**
 * Schema Module - Type and Zod schema exports
 *
 * Centralized exports for all types, enums, constants, and Zod validation schemas.
 *
 * @module schemas
 */

// Zod validation schemas
export {
  ActiveTabSchema,
  FilterStateInputSchema,
  FilterStateSchema,
  ViewModeSchema,
} from './app.schema';
export type { FilterState, FilterStateInput } from './app.types';
export {
  ACTIVE_TAB_VALUES,
  ActiveTab,
  DEFAULT_ACTIVE_TAB,
  serializeFilterState,
  VIEW_MODE_VALUES,
  ViewMode,
} from './app.types';
export {
  ClusterBoundsSchema,
  ClusterLayoutConfigSchema,
  ClusterNodeMetadataSchema,
  ClusterSchema,
  ClusterTypeSchema,
  ForceStrengthSchema,
  NodeRoleSchema,
  PositionedNodeSchema,
} from './cluster.schema';
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
export {
  AppErrorSchema,
  ErrorCategorySchema,
  ErrorNotificationStateSchema,
  ErrorSeveritySchema,
} from './error.schema';
export type { AppError, ErrorNotificationState } from './error.types';
export {
  DEFAULT_MAX_VISIBLE_TOASTS,
  DEFAULT_TOAST_DURATION,
  ErrorCategory,
  ErrorSeverity,
} from './error.types';
export {
  BuildSettingsSchema,
  DependencyKindSchema,
  DeploymentTargetsSchema,
  DestinationSchema,
  ForeignBuildInfoSchema,
  GraphDataSchema,
  GraphEdgeSchema,
  GraphNodeSchema,
  LenientDependencyKindSchema,
  LenientGraphDataSchema,
  LenientNodeTypeSchema,
  LenientOriginSchema,
  LenientPlatformSchema,
  NodeTypeSchema,
  OriginSchema,
  PlatformSchema,
  SourceTypeSchema,
} from './graph.schema';
export type { GraphData, GraphEdge, GraphNode } from './graph.types';
export {
  NODE_TYPE_VALUES,
  NodeType,
  ORIGIN_VALUES,
  Origin,
  PLATFORM_VALUES,
  Platform,
} from './graph.types';
export { ClusterPositionSchema, NodePositionSchema } from './simulation.schema';
export type { ClusterPosition, NodePosition } from './simulation.types';
