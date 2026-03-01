/**
 * Header Lit Component - Mission Control Theme
 *
 * Top header component with bold identity.
 * Features scan line effect, glowing logo, and monospace typography.
 *
 * @example
 * ```html
 * <xcode-graph-header></xcode-graph-header>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * Top header component with bold identity. Features scan line effect,
 * glowing logo, and monospace typography.
 *
 * @summary Mission control themed header bar
 */
export declare class GraphHeader extends LitElement {
    static readonly styles: CSSResultGroup;
    private renderSelectorIcon;
    private renderSlashIcon;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-header': GraphHeader;
    }
}
//# sourceMappingURL=header.d.ts.map