/**
 * InfoRow Lit Component
 *
 * A key-value pair display component for metadata sections.
 * Shows a label on the left and value on the right in a flex row.
 *
 * @example
 * ```html
 * <xcode-graph-info-row label="Platform" value="iOS"></xcode-graph-info-row>
 * ```
 *
 * @slot - Default slot for complex value content (overrides value prop)
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * A key-value pair display component for metadata sections.
 * Shows a label on the left and value on the right in a flex row.
 *
 * @summary Key-value pair display row
 * @slot - Default slot for complex value content (overrides value prop)
 */
export declare class GraphInfoRow extends LitElement {
    /**
     * The label text (left side)
     */
    label: string;
    /**
     * The value text (right side) - can be overridden by slot
     */
    value: string;
    constructor();
    static readonly styles: CSSResultGroup;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-info-row': GraphInfoRow;
    }
}
