/**
 * FilterSection Lit Component
 *
 * Collapsible filter section with checkbox items.
 * Used for nodeType, platform, project, and package filters.
 *
 * @example
 * ```html
 * <xcode-graph-filter-section
 *   id="nodeTypes"
 *   title="Product Types"
 *   icon-name="product-types"
 *   .items=${items}
 *   .selectedItems=${selectedSet}
 *   is-expanded
 * ></xcode-graph-filter-section>
 * ```
 *
 * @fires section-toggle - Dispatched when header is clicked
 * @fires item-toggle - Dispatched when item checkbox toggled (detail: { key, checked })
 * @fires preview-change - Dispatched on hover (detail: { type, value } or null)
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
export type FilterType = 'nodeType' | 'platform' | 'project' | 'package';
export interface FilterItem {
    key: string;
    count: number;
    color: string;
}
/**
 * Collapsible filter section with checkbox items.
 * Used for nodeType, platform, project, and package filters.
 *
 * @summary Collapsible filter section with toggleable checkbox items
 *
 * @fires section-toggle - Dispatched when the section header is clicked
 * @fires item-toggle - Dispatched when an item checkbox is toggled (detail: { key, checked })
 * @fires preview-change - Dispatched on item hover for filter preview (detail: { type, value } or null)
 *
 * @slot icon - Icon to display in the section header
 */
export declare class GraphFilterSection extends LitElement {
    id: string;
    title: string;
    iconName: string;
    isExpanded: boolean;
    items: FilterItem[];
    selectedItems: Set<string>;
    filterType: FilterType;
    zoom: number;
    static readonly styles: CSSResultGroup;
    private handleToggle;
    private handleItemToggle;
    private handleItemHover;
    private renderItemIcon;
    private renderItem;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-filter-section': GraphFilterSection;
    }
}
//# sourceMappingURL=filter-section.d.ts.map