/**
 * FilterIcon Lit Component
 *
 * A unified icon component for filter sections.
 * Consolidates product-types, platforms, projects, and packages icons.
 *
 * @example
 * ```html
 * <xcode-graph-filter-icon name="product-types"></xcode-graph-filter-icon>
 * <xcode-graph-filter-icon name="platforms"></xcode-graph-filter-icon>
 * <xcode-graph-filter-icon name="projects"></xcode-graph-filter-icon>
 * <xcode-graph-filter-icon name="packages"></xcode-graph-filter-icon>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
export type FilterIconName = 'product-types' | 'platforms' | 'projects' | 'packages';
/**
 * A unified icon component for filter sections.
 * Renders product-types, platforms, projects, and packages icons.
 *
 * @summary Filter section icon with multiple named variants
 */
export declare class GraphFilterIcon extends LitElement {
    /**
     * The icon name to render
     */
    name: FilterIconName;
    /**
     * Icon size in pixels
     */
    size: number;
    constructor();
    static readonly styles: CSSResultGroup;
    private renderProductTypes;
    private renderPlatforms;
    private renderProjects;
    private renderPackages;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-filter-icon': GraphFilterIcon;
    }
}
//# sourceMappingURL=filter-icon.d.ts.map