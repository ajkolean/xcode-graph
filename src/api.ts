/**
 * TuistGraph - Public API
 *
 * Entry point for API Extractor containing all public modules
 * and utilities for graph visualization.
 *
 * @packageDocumentation
 */

// ==================== Schemas ====================

export * from "./shared/schemas";

// ==================== Signals ====================

export * from "./graph/signals";
export * from "./shared/signals";

// ==================== Services ====================

export * from "./services";

// ==================== State Machines ====================

export * from "./shared/machines";

// ==================== Types ====================

export type {
  FilterState,
  FilterStateInput,
  ViewMode,
} from "./shared/schemas/app.schema";
export {
  serializeFilterState,
  VIEW_MODE_VALUES,
} from "./shared/schemas/app.schema";
export type {
  Cluster,
  ClusterBounds,
  ClusterLayoutConfig,
  ClusterNodeMetadata,
  ClusterType,
  ForceStrength,
  NodeRole,
  PositionedNode,
} from "./shared/schemas/cluster.schema";
export type {
  ClusterPosition,
  NodePosition,
} from "./shared/schemas/simulation.schema";

// ==================== Utility Modules ====================

export * from "./graph/layout";
export * from "./graph/utils";
export * from "./ui/utils";

// ==================== Library ====================

export { bindable } from "./shared/machines/lib/bindable";
export {
  type ExtendedEvent,
  type ExtendedState,
  type MachineEvent,
  type MachineUserProps,
  VanillaMachine,
} from "./shared/machines/lib/vanilla-machine";
