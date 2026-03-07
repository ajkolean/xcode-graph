/**
 * Full library entry point.
 *
 * Re-exports everything from the headless API ({@link ./api.ts | api.ts})
 * plus UI controllers (e.g. {@link GraphInteractionFullController},
 * {@link GraphLayoutController}) and Lit-related helpers. Use this entry
 * point when building a complete UI that renders and interacts with the
 * graph in the browser.
 *
 * For a lighter, headless-only build (no UI controllers), import from
 * {@link ./api.ts | api.ts} instead.
 *
 * @packageDocumentation
 */

export type { ColorScheme } from './components/xcode-graph';
export { GraphInteractionFullController } from './graph/controllers/graph-interaction-full.controller';
export type { GraphLayoutConfig } from './graph/controllers/layout.controller';
export { LayoutController as GraphLayoutController } from './graph/controllers/layout.controller';
export type { LayoutOptions } from './graph/layout/config';
export type { LayoutHooks } from './graph/layout/types';
export * from './graph/signals';
export * from './graph/utils';
export * from './services';
export {
  createMachineController,
  ZagController,
} from './shared/controllers/zag.controller';
export * from './shared/machines';
export * from './shared/schemas';
export * from './shared/signals';
export {
  contrastRatio,
  darken,
  ensureContrast,
  lighten,
  meetsContrast,
  onColorSchemeChange,
  prefersDarkMode,
  withAlpha,
} from './styles/theme-utils';
export * from './ui/utils';
