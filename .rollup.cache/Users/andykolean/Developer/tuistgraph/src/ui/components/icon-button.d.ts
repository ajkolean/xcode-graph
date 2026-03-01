/**
 * IconButton Lit Component
 *
 * A unified icon button component with variants for all clickable icon scenarios.
 * Supports ghost, subtle, and solid variants with multiple color options.
 *
 * @example
 * ```html
 * <xcode-graph-icon-button
 *   title="Close"
 *   variant="ghost"
 *   color="neutral"
 * >
 *   <svg>...</svg>
 * </xcode-graph-icon-button>
 * ```
 *
 * @fires click - Native click event (not prevented)
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
export type IconButtonVariant = 'ghost' | 'subtle' | 'solid';
export type IconButtonColor = 'neutral' | 'primary' | 'destructive';
export type IconButtonSize = 'sm' | 'md';
/**
 * A unified icon button component with variants for all clickable icon scenarios.
 * Supports ghost, subtle, and solid variants with multiple color options.
 *
 * @summary Icon button with variant and color options
 * @slot - Icon content (typically an SVG element)
 */
export declare class GraphIconButton extends LitElement {
    /**
     * Button variant style
     */
    variant: IconButtonVariant;
    /**
     * Button color scheme
     */
    color: IconButtonColor;
    /**
     * Button size
     */
    size: IconButtonSize;
    /**
     * Whether the button is disabled
     */
    disabled: boolean;
    /**
     * Tooltip text
     */
    title: string;
    constructor();
    static readonly styles: CSSResultGroup;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-icon-button': GraphIconButton;
    }
}
