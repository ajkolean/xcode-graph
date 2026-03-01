/**
 * PanelHeader Lit Component
 *
 * A reusable header component for detail panels with back button,
 * icon box, title, subtitle, and optional badges slot.
 * Consolidates patterns from node-header and cluster-header.
 *
 * @example
 * ```html
 * <xcode-graph-panel-header
 *   title="MyTarget"
 *   subtitle="Framework"
 *   color="#10B981"
 *   @back=${handleBack}
 * >
 *   <svg slot="icon">...</svg>
 *   <xcode-graph-badge slot="badges" label="Target" color="#10B981"></xcode-graph-badge>
 * </xcode-graph-panel-header>
 * ```
 *
 * @fires back - Dispatched when back button is clicked
 *
 * @slot icon - Icon content for the icon box (SVG or other element)
 * @slot badges - Badge elements to display below the header
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * A reusable header component for detail panels with back button,
 * icon box, title, subtitle, and optional badges slot.
 *
 * @summary Reusable panel header with back button and badge slots
 * @fires back - Dispatched when the back button is clicked
 * @slot icon - Icon content for the icon box (SVG or other element)
 * @slot badges - Badge elements to display below the header
 */
export declare class GraphPanelHeader extends LitElement {
    /**
     * The main title/name to display
     */
    title: string;
    /**
     * Optional subtitle text
     */
    subtitle: string;
    /**
     * Theme color for the icon box glow
     */
    color: string;
    /**
     * Title size variant
     * - 'lg': Larger heading (h2 size) - for node details
     * - 'md': Medium heading (h3 size) - for cluster details
     */
    titleSize: 'lg' | 'md';
    constructor();
    static readonly styles: CSSResultGroup;
    private handleBack;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-panel-header': GraphPanelHeader;
    }
}
