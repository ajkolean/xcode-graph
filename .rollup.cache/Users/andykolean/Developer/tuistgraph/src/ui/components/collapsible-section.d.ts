/**
 * CollapsibleSection Lit Component
 *
 * An expandable/collapsible section with animated chevron.
 * Used for filter sections, details panels, and other expandable content.
 *
 * @example
 * ```html
 * <xcode-graph-collapsible-section
 *   title="Filters"
 *   ?is-expanded=${true}
 * >
 *   <span slot="icon">🔍</span>
 *   <div>Content here...</div>
 * </xcode-graph-collapsible-section>
 * ```
 *
 * @fires toggle - Dispatched when header is clicked
 *
 * @slot icon - Optional icon to display before the title
 * @slot - Default slot for expandable content
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * An expandable/collapsible section with animated chevron.
 * Used for filter sections, details panels, and other expandable content.
 *
 * @summary Expandable/collapsible section with animated chevron
 *
 * @fires toggle - Dispatched when the header is clicked
 *
 * @slot icon - Optional icon to display before the title
 * @slot - Default slot for expandable content
 */
export declare class GraphCollapsibleSection extends LitElement {
    /**
     * The section title
     */
    title: string;
    /**
     * Whether the section is expanded
     */
    isExpanded: boolean;
    constructor();
    static readonly styles: CSSResultGroup;
    private handleToggle;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-collapsible-section': GraphCollapsibleSection;
    }
}
//# sourceMappingURL=collapsible-section.d.ts.map