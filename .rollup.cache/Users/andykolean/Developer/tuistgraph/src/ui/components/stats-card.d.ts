/**
 * StatsCard Lit Component - Mission Control Theme
 *
 * Reusable stats card component for displaying metrics.
 * Features bold left accent border, noise texture, and monospace typography.
 * Can be toggleable for interactive highlight controls.
 *
 * @example
 * ```html
 * <xcode-graph-stats-card label="Total" value="42"></xcode-graph-stats-card>
 * <xcode-graph-stats-card label="Deps" value="10" toggleable active></xcode-graph-stats-card>
 * ```
 */
import { type CSSResultGroup, LitElement, type TemplateResult } from 'lit';
/**
 * Reusable stats card component for displaying metrics.
 * Features bold left accent border and monospace typography.
 * Can be toggleable for interactive highlight controls.
 *
 * @summary Stats metric card with optional toggle behavior
 * @fires card-toggle - Dispatched when a toggleable card is clicked
 */
export declare class GraphStatsCard extends LitElement {
    /**
     * The label text displayed above the value
     */
    label: string;
    /**
     * The value to display (can be string or number)
     */
    value: string | number;
    /**
     * Whether to highlight the value with accent color
     */
    highlighted: boolean;
    /**
     * Whether to use compact sizing (smaller fonts for node detail metrics)
     */
    compact: boolean;
    /**
     * Whether this card is a clickable toggle
     */
    toggleable: boolean;
    /**
     * Whether this toggleable card is currently active (on)
     */
    active: boolean;
    static readonly styles: CSSResultGroup;
    private handleClick;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-stats-card': GraphStatsCard;
    }
}
//# sourceMappingURL=stats-card.d.ts.map