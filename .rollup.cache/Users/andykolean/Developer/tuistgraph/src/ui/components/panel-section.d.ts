/**
 * PanelSection Lit Component
 *
 * A consistent container for sections within panels.
 * Provides padding, borders, and flex-shrink control.
 *
 * @example
 * ```html
 * <xcode-graph-panel-section bordered shrink>
 *   <h3>Section Title</h3>
 *   <p>Section content...</p>
 * </xcode-graph-panel-section>
 * ```
 *
 * @slot - Default slot for section content
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
export type PanelSectionPadding = 'none' | 'sm' | 'md' | 'lg';
/**
 * A consistent container for sections within panels.
 * Provides padding, borders, and flex-shrink control.
 *
 * @summary Panel section container with configurable padding and borders
 * @slot - Default slot for section content
 */
export declare class GraphPanelSection extends LitElement {
    /**
     * Whether to show a bottom border
     */
    bordered: boolean;
    /**
     * Padding size
     */
    padding: PanelSectionPadding;
    /**
     * Whether to prevent shrinking (flex-shrink: 0)
     */
    shrink: boolean;
    constructor();
    static readonly styles: CSSResultGroup;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-panel-section': GraphPanelSection;
    }
}
//# sourceMappingURL=panel-section.d.ts.map