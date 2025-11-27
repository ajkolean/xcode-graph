/**
 * Feature flags for gradual Lit component rollout
 *
 * Set environment variables to enable Lit components:
 * - VITE_USE_LIT_BADGE=true
 * - VITE_USE_LIT_BUTTON=true
 * - etc.
 */

export const FEATURES = {
  // UI Primitives
  USE_LIT_BADGE: import.meta.env.VITE_USE_LIT_BADGE === 'true',
  USE_LIT_SKELETON: import.meta.env.VITE_USE_LIT_SKELETON === 'true',
  USE_LIT_SEPARATOR: import.meta.env.VITE_USE_LIT_SEPARATOR === 'true',
  USE_LIT_CARD: import.meta.env.VITE_USE_LIT_CARD === 'true',
  USE_LIT_BUTTON: import.meta.env.VITE_USE_LIT_BUTTON === 'true',

  // Graph components (future)
  USE_LIT_GRAPH_NODE: import.meta.env.VITE_USE_LIT_GRAPH_NODE === 'true',
  USE_LIT_GRAPH_EDGE: import.meta.env.VITE_USE_LIT_GRAPH_EDGE === 'true',

  // Layout components (future)
  USE_LIT_HEADER: import.meta.env.VITE_USE_LIT_HEADER === 'true',
  USE_LIT_SIDEBAR: import.meta.env.VITE_USE_LIT_SIDEBAR === 'true',
} as const;

/**
 * Check if any Lit components are enabled
 */
export const hasLitComponents = Object.values(FEATURES).some((flag) => flag);

/**
 * Get enabled feature count
 */
export const enabledFeatureCount = Object.values(FEATURES).filter((flag) => flag).length;
