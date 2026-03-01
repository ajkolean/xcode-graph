/**
 * Badge Lit Component
 *
 * A reusable badge/label component with color theming and multiple variants.
 * Consolidates badge patterns used across node-header, cluster-header,
 * cluster-type-badge, and filter-section components.
 *
 * @example
 * ```html
 * <!-- Pill badge (default) -->
 * <xcode-graph-badge
 *   label="Target"
 *   color="#10B981"
 * ></xcode-graph-badge>
 *
 * <!-- Rounded badge with accent border -->
 * <xcode-graph-badge
 *   label="Package"
 *   color="#8B5CF6"
 *   variant="accent"
 *   size="sm"
 * ></xcode-graph-badge>
 *
 * <!-- Interactive badge with glow -->
 * <xcode-graph-badge
 *   label="iOS"
 *   color="#3B82F6"
 *   interactive
 *   glow
 * ></xcode-graph-badge>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
export type BadgeVariant = 'pill' | 'rounded' | 'accent';
export type BadgeSize = 'sm' | 'md';
/**
 * A reusable badge/label component with color theming and multiple variants.
 * Consolidates badge patterns used across node-header, cluster-header,
 * cluster-type-badge, and filter-section components.
 *
 * @summary Color-themed badge with pill, rounded, and accent variants
 *
 * @cssproperty --badge-bg - Background color of the badge (computed from color prop)
 * @cssproperty --badge-border - Border color of the badge (computed from color prop)
 * @cssproperty --badge-color - Text color of the badge (computed from color prop)
 * @cssproperty --badge-bg-hover - Background color on hover (computed from color prop)
 * @cssproperty --badge-border-hover - Border color on hover (computed from color prop)
 * @cssproperty --badge-glow - Glow color on hover (computed from color prop)
 */
export declare class GraphBadge extends LitElement {
    /**
     * The text to display in the badge
     */
    label: string;
    /**
     * The color for the badge (hex or CSS color)
     */
    color: string;
    /**
     * Badge shape variant
     * - 'pill': Fully rounded (radii-full)
     * - 'rounded': Small border radius (radii-sm)
     * - 'accent': Small radius with left accent border
     */
    variant: BadgeVariant;
    /**
     * Badge size
     * - 'sm': Smaller text (xs), monospace font
     * - 'md': Medium text (sm), body font
     */
    size: BadgeSize;
    /**
     * Whether the badge has interactive hover states
     */
    interactive: boolean;
    /**
     * Whether to show glow effect on hover
     */
    glow: boolean;
    constructor();
    static readonly styles: CSSResultGroup;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-badge': GraphBadge;
    }
}
//# sourceMappingURL=badge.d.ts.map