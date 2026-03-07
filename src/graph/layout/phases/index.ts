/**
 * Layout Phases - Barrel file
 *
 * Re-exports the public API from each layout phase module.
 *
 * @module graph/layout/phases
 */

export { applyForceMassage } from './force-massage';
export {
  computeMacroLayout,
  type ElkLoggingEntry,
  getLastMacroLayoutDebugData,
  layoutWithTimeout,
  type MacroLayoutDebugData,
  validateElkOptions,
} from './macro-layout';
export {
  computeClusterInterior,
  type MicroLayoutResult,
} from './micro-layout';

export { applyNodeMassage } from './node-massage';

export {
  computeClusterPorts,
  computePortSide,
  computeRoutedEdges,
} from './port-routing';
