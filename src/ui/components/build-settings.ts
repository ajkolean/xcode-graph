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
import { type CSSResultGroup, css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import './info-row.js';

/**
 * Displays curated build settings for a node, showing key configuration
 * like Swift version, compilation conditions, and code signing.
 *
 * @summary Collapsible build settings display for a node
 */
export class GraphBuildSettings extends LitElement {
  /**
   * Curated build settings to display
   */
  @property({ attribute: false })
  declare settings: BuildSettings | undefined;

  /**
   * Whether to start expanded (default: collapsed)
   */
  @property({ type: Boolean })
  declare expanded: boolean;

  @state()
  private declare isExpanded: boolean;

  constructor() {
    super();
    this.expanded = false;
    this.isExpanded = false;
  }

  /** Syncs the expanded state from the attribute on connect */
  override connectedCallback(): void {
    super.connectedCallback();
    this.isExpanded = this.expanded;
  }

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
    }

    .header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      background: none;
      border: none;
      padding: 0;
      text-align: left;
    }

    .header:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
      border-radius: var(--radii-sm);
    }

    .header:hover .title {
      color: var(--colors-primary-text);
    }

    .header:hover .toggle-icon {
      color: var(--colors-primary-text);
      opacity: var(--opacity-80);
    }

    .title {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-semibold);
      color: var(--colors-muted-foreground);
      letter-spacing: var(--letter-spacing-wider);
      text-transform: uppercase;
      transition: color var(--durations-normal);
    }

    .toggle-icon {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
      color: var(--colors-muted-foreground);
      opacity: var(--opacity-40);
      transition: transform var(--durations-fast) var(--easings-out), color var(--durations-normal), opacity var(--durations-normal);
    }

    .toggle-icon.expanded {
      transform: rotate(180deg);
    }

    .content {
      margin-top: var(--spacing-3);
    }

    .info-rows {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .conditions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-1);
    }

    .condition-badge {
      display: inline-flex;
      padding: var(--spacing-1) var(--spacing-2);
      background-color: var(--colors-muted);
      border-radius: var(--radii-sm);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
    }

    .code-sign-section {
      margin-top: var(--spacing-3);
      padding-top: var(--spacing-3);
      border-top: var(--border-widths-thin) solid var(--colors-border);
    }

    .section-label {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      color: var(--colors-muted-foreground);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      margin-bottom: var(--spacing-2);
    }

    .truncated {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
    }
  `;

  /** Toggles the expanded/collapsed state */
  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private get hasSettings(): boolean {
    if (!this.settings) return false;
    return Object.keys(this.settings).length > 0;
  }

  private get hasCodeSignSettings(): boolean {
    if (!this.settings) return false;
    return Boolean(
      this.settings.codeSignIdentity ||
        this.settings.developmentTeam ||
        this.settings.provisioningProfile,
    );
  }

  private renderCodeSignSection(): TemplateResult | typeof nothing {
    if (!this.hasCodeSignSettings) return nothing;
    const settings = this.settings;
    if (!settings) return nothing;

    return html`
      <div class="code-sign-section">
        <div class="section-label">Code Signing</div>
        <div class="info-rows">
          ${
            settings.codeSignIdentity
              ? html`
                <xcode-graph-info-row label="Identity">
                  <span class="truncated" title=${settings.codeSignIdentity}>
                    ${settings.codeSignIdentity}
                  </span>
                </xcode-graph-info-row>
              `
              : nothing
          }
          ${
            settings.developmentTeam
              ? html`
                <xcode-graph-info-row label="Team" value=${settings.developmentTeam}>
                </xcode-graph-info-row>
              `
              : nothing
          }
          ${
            settings.provisioningProfile
              ? html`
                <xcode-graph-info-row label="Profile">
                  <span class="truncated" title=${settings.provisioningProfile}>
                    ${settings.provisioningProfile}
                  </span>
                </xcode-graph-info-row>
              `
              : nothing
          }
        </div>
      </div>
    `;
  }

  private renderExpandedContent(): TemplateResult | typeof nothing {
    const settings = this.settings;
    if (!settings) return nothing;

    return html`
      <div class="content">
        <div class="info-rows">
          ${
            settings.swiftVersion
              ? html`
                <xcode-graph-info-row label="Swift Version" value=${settings.swiftVersion}>
                </xcode-graph-info-row>
              `
              : nothing
          }
          ${
            settings.compilationConditions && settings.compilationConditions.length > 0
              ? html`
                <xcode-graph-info-row label="Conditions">
                  <div class="conditions">
                    ${repeat(
                      settings.compilationConditions,
                      (condition) => condition,
                      (condition) => html`<span class="condition-badge">${condition}</span>`,
                    )}
                  </div>
                </xcode-graph-info-row>
              `
              : nothing
          }
        </div>

        ${this.renderCodeSignSection()}
      </div>
    `;
  }

  override render(): TemplateResult | typeof nothing {
    if (!this.hasSettings) return nothing;

    return html`
      <button class="header" aria-expanded=${this.isExpanded} @click=${this.toggleExpanded}>
        <span class="title">Build Settings</span>
        <svg
          class="toggle-icon ${this.isExpanded ? 'expanded' : ''}"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      ${this.isExpanded ? this.renderExpandedContent() : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-build-settings': GraphBuildSettings;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-build-settings')) {
  customElements.define('xcode-graph-build-settings', GraphBuildSettings);
}
