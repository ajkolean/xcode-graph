/**
 * Headless API entry point.
 *
 * Re-exports graph logic (layout algorithms, signals, utilities, services,
 * schemas, and state machines) **without** any UI controllers or Lit
 * components. Use this entry point when you need the data layer only --
 * for example, in a web-worker, Node script, or custom renderer that
 * doesn't depend on the DOM.
 *
 * For the full library entry point (includes UI controllers and
 * interaction handling), see {@link ./index.ts | index.ts}.
 *
 * @packageDocumentation
 */

export { VanillaMachine } from '@zag-js/vanilla';
export * from './graph/layout';
export * from './graph/signals';
export * from './graph/utils';
export * from './services';
export * from './shared/machines';
export * from './shared/schemas';
export * from './shared/signals';
export * from './ui/utils';
