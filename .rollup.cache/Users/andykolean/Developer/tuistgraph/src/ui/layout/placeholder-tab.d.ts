/**
 * PlaceholderTab Lit Component
 *
 * Placeholder content for tabs that are coming soon.
 * Displays centered message with title.
 *
 * @example
 * ```html
 * <xcode-graph-placeholder-tab title="Builds"></xcode-graph-placeholder-tab>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * Placeholder content for tabs that are coming soon.
 * Displays a centered message with title.
 *
 * @summary Coming soon placeholder tab
 */
export declare class GraphPlaceholderTab extends LitElement {
    /**
     * The title of the tab section
     */
    title: string;
    static readonly styles: CSSResultGroup;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-placeholder-tab': GraphPlaceholderTab;
    }
}
//# sourceMappingURL=placeholder-tab.d.ts.map