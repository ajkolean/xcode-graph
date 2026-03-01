/**
 * BuildSettings Lit Component
 *
 * Displays curated build settings for a node, showing key configuration
 * like Swift version, compilation conditions, and code signing.
 *
 * @example
 * ```html
 * <xcode-graph-build-settings
 *   .settings=${{ swiftVersion: '5.9', compilationConditions: ['DEBUG'] }}
 * ></xcode-graph-build-settings>
 * ```
 */
import type { BuildSettings } from '@shared/schemas/graph.types';
import { type CSSResultGroup, LitElement, nothing, type TemplateResult } from 'lit';
import './info-row.js';
/**
 * Displays curated build settings for a node, showing key configuration
 * like Swift version, compilation conditions, and code signing.
 *
 * @summary Collapsible build settings display for a node
 */
export declare class GraphBuildSettings extends LitElement {
    /**
     * Curated build settings to display
     */
    settings: BuildSettings | undefined;
    /**
     * Whether to start expanded (default: collapsed)
     */
    expanded: boolean;
    private isExpanded;
    constructor();
    connectedCallback(): void;
    static readonly styles: CSSResultGroup;
    private toggleExpanded;
    private get hasSettings();
    private get hasCodeSignSettings();
    private renderCodeSignSection;
    private renderExpandedContent;
    render(): TemplateResult | typeof nothing;
}
declare global {
    interface HTMLElementTagNameMap {
        'xcode-graph-build-settings': GraphBuildSettings;
    }
}
