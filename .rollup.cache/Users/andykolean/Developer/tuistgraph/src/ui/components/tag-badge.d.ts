/**
 * TagBadge Lit Component
 *
 * Displays architecture tags (like domain:*, layer:*) with color-coding
 * based on the tag prefix. Useful for showing organizational metadata.
 *
 * @example
 * ```html
 * <xcode-graph-tag-badge tag="domain:infrastructure"></xcode-graph-tag-badge>
 * <xcode-graph-tag-badge tag="layer:feature" interactive></xcode-graph-tag-badge>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * Displays architecture tags (like domain:*, layer:*) with color-coding
 * based on the tag prefix. Useful for showing organizational metadata.
 *
 * @summary Color-coded architecture tag badge
 */
export declare class GraphTagBadge extends LitElement {
    /**
     * The full tag string (e.g., "domain:infrastructure")
     */
    tag: string;
    /**
     * Whether the badge has interactive hover states
     */
    interactive: boolean;
    constructor();
    static readonly styles: CSSResultGroup;
    private parseTag;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-tag-badge': GraphTagBadge;
    }
}
//# sourceMappingURL=tag-badge.d.ts.map