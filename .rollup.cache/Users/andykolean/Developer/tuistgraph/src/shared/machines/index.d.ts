/**
 * State Machines Module - Zag-js UI state management
 *
 * Centralized exports for all Zag-js state machines that manage
 * complex UI interactions requiring stateful behavior.
 *
 * **Available Machines:**
 * - `sidebarMachine`: Manages sidebar expand/collapse, tabs, and selections
 *
 * @module machines
 *
 * @example
 * ```ts
 * import { sidebarMachine, type SidebarTab } from '@shared/machines';
 *
 * // Use with Zag-js interpret
 * const service = interpret(sidebarMachine, { context: {} });
 * service.start();
 * ```
 */
export { type SidebarMachineSchema, type SidebarSection, type SidebarTab, sidebarMachine, } from './sidebar.machine';
//# sourceMappingURL=index.d.ts.map