/**
 * SectionHeader Lit Component
 *
 * A simple header component for sections with title and count.
 * Used in node-list, cluster-targets-list, and other list sections.
 *
 * @example
 * ```html
 * <xcode-graph-section-header
 *   title="Dependencies"
 *   count="5"
 *   suffix="direct"
 * ></xcode-graph-section-header>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * A simple header component for sections with title and count.
 * Used in node-list, cluster-targets-list, and other list sections.
 *
 * @summary Section header with title and count display
 */
export declare class GraphSectionHeader extends LitElement {
    /**
     * The section title
     */
    title: string;
    /**
     * The count to display
     */
    count: number;
    /**
     * Optional suffix after count (e.g., "direct", "targets")
     */
    suffix: string;
    constructor();
    static readonly styles: CSSResultGroup;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-section-header': GraphSectionHeader;
    }
}
//# sourceMappingURL=section-header.d.ts.map