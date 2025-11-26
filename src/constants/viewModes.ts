/**
 * View mode constants
 * Defines visualization modes for the dependency graph
 */

export const VIEW_MODES = {
  FULL: 'full',
  FOCUSED: 'focused',
  DEPENDENTS: 'dependents',
  BOTH: 'both',
  IMPACT: 'impact'
} as const;

export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  [VIEW_MODES.FULL]: 'Full Graph',
  [VIEW_MODES.FOCUSED]: 'Dependencies',
  [VIEW_MODES.DEPENDENTS]: 'Dependents',
  [VIEW_MODES.BOTH]: 'Both Directions',
  [VIEW_MODES.IMPACT]: 'Impact Analysis'
};

export const DEFAULT_VIEW_MODE: ViewMode = VIEW_MODES.FULL;
