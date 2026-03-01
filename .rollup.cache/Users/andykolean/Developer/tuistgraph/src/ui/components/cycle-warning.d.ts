/**
 * CycleWarning Lit Component
 *
 * Displays a warning banner when circular dependencies are detected in the graph.
 * Shows the number of cycles and allows users to dismiss the warning.
 *
 * @example
 * ```html
 * <xcode-graph-cycle-warning
 *   .cycles=${[['A', 'B', 'C', 'A'], ['X', 'Y', 'X']]}
 *   @dismiss=${handleDismiss}
 * ></xcode-graph-cycle-warning>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * Displays a warning banner when circular dependencies are detected in the graph.
 * Shows the number of cycles and allows users to expand details or dismiss the warning.
 *
 * @summary Dismissible circular dependency warning banner
 *
 * @fires dismiss - Dispatched when the warning is dismissed
 */
export declare class GraphCycleWarning extends LitElement {
    cycles: string[][];
    private isExpanded;
    private isDismissed;
    static readonly styles: CSSResultGroup;
    constructor();
    private handleToggleExpand;
    private handleDismiss;
    private formatCycle;
    render(): TemplateResult | null;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-cycle-warning': GraphCycleWarning;
    }
}
//# sourceMappingURL=cycle-warning.d.ts.map