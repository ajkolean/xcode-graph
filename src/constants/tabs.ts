/**
 * Tab constants and labels
 * Centralized tab configuration for the application
 */

export type ActiveTab = 
  | 'overview' 
  | 'builds' 
  | 'test-runs' 
  | 'module-cache' 
  | 'xcode-cache' 
  | 'previews' 
  | 'qa' 
  | 'bundles' 
  | 'graph';

export const TAB_LABELS: Record<ActiveTab, string> = {
  'overview': 'Overview',
  'builds': 'Builds',
  'test-runs': 'Test Runs',
  'module-cache': 'Module Cache',
  'xcode-cache': 'Xcode Cache',
  'previews': 'Previews',
  'qa': 'QA',
  'bundles': 'Bundles',
  'graph': 'Graph'
};

export const DEFAULT_TAB: ActiveTab = 'graph';
