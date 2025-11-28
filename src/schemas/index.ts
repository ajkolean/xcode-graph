/**
 * Schema Module - Zod validation schemas
 *
 * Centralized exports for all validation schemas used throughout the app.
 * Provides type-safe validation for graph data, app state, clusters, and simulation.
 *
 * @module schemas
 */

// ==================== App Schemas ====================

export type { FilterState, FilterStateInput, ViewMode } from './app.schema';
export {
  FilterStateInputSchema,
  FilterStateSchema,
  serializeFilterState,
  VIEW_MODE_VALUES,
  ViewModeSchema,
} from './app.schema';

// ==================== Cluster Schemas ====================

export type {
  Cluster,
  ClusterBounds,
  ClusterLayoutConfig,
  ClusterNodeMetadata,
  ClusterType,
  ForceStrength,
  NodeRole,
  PositionedNode,
} from './cluster.schema';
export {
  CLUSTER_TYPE_VALUES,
  ClusterBoundsSchema,
  ClusterLayoutConfigSchema,
  ClusterNodeMetadataSchema,
  ClusterSchema,
  ClusterTypeSchema,
  DEFAULT_CLUSTER_CONFIG,
  ForceStrengthSchema,
  NODE_ROLE_VALUES,
  NodeRoleSchema,
  PositionedNodeSchema,
} from './cluster.schema';

// ==================== Graph Schemas ====================

export type {
  GraphData,
  GraphEdge,
  GraphNode,
  NodeType,
  Origin,
  Platform,
} from './graph.schema';
export {
  GraphDataSchema,
  GraphEdgeSchema,
  GraphNodeSchema,
  NODE_TYPE_VALUES,
  NodeTypeSchema,
  ORIGIN_VALUES,
  OriginSchema,
  PLATFORM_VALUES,
  PlatformSchema,
} from './graph.schema';

// ==================== Simulation Schemas ====================

export type { ClusterPosition, NodePosition } from './simulation.schema';
export { ClusterPositionSchema, NodePositionSchema } from './simulation.schema';
