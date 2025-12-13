/**
 * BuildSettings Lit Component
 *
 * Displays curated build settings for a node, showing key configuration
 * like Swift version, compilation conditions, and code signing.
 *
 * @example
 * ```html
 * <graph-build-settings
 *   .settings=${{ swiftVersion: '5.9', compilationConditions: ['DEBUG'] }}
 * ></graph-build-settings>
 * ```
 */

import type { BuildSettings } from '@shared/schemas/graph.schema';
import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import './info-row.js';

export class GraphBuildSettings extends LitElement {
  // ========================================
  // Properties
  // ========================================

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

  override connectedCallback(): void {
    super.connectedCallback();
    this.isExpanded = this.expanded;
  }

  // ========================================
  // Styles
  // ========================================

  static override readonly styles = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }

    .title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
    }

    .toggle-icon {
      width: 16px;
      height: 16px;
      color: var(--colors-muted-foreground);
      transition: transform var(--durations-fast) var(--easings-out);
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

  // ========================================
  // Helpers
  // ========================================

  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private get hasSettings(): boolean {
    return !!this.settings && Object.keys(this.settings).length > 0;
  }

  private get hasCodeSignSettings(): boolean {
    if (!this.settings) return false;
    return !!(
      this.settings.codeSignIdentity ||
      this.settings.developmentTeam ||
      this.settings.provisioningProfile
    );
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    if (!this.hasSettings) return nothing;

    return html`
      <div class="header" @click=${this.toggleExpanded}>
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
      </div>

      ${
        this.isExpanded
          ? html`
            <div class="content">
              <div class="info-rows">
                ${
                  this.settings!.swiftVersion
                    ? html`
                      <graph-info-row label="Swift Version" value=${this.settings!.swiftVersion}>
                      </graph-info-row>
                    `
                    : nothing
                }
                ${
                  this.settings!.compilationConditions &&
                  this.settings!.compilationConditions.length > 0
                    ? html`
                      <graph-info-row label="Conditions">
                        <div class="conditions">
                          ${this.settings!.compilationConditions.map(
                            (condition) => html`<span class="condition-badge">${condition}</span>`,
                          )}
                        </div>
                      </graph-info-row>
                    `
                    : nothing
                }
              </div>

              ${
                this.hasCodeSignSettings
                  ? html`
                    <div class="code-sign-section">
                      <div class="section-label">Code Signing</div>
                      <div class="info-rows">
                        ${
                          this.settings!.codeSignIdentity
                            ? html`
                              <graph-info-row label="Identity">
                                <span class="truncated" title=${this.settings!.codeSignIdentity}>
                                  ${this.settings!.codeSignIdentity}
                                </span>
                              </graph-info-row>
                            `
                            : nothing
                        }
                        ${
                          this.settings!.developmentTeam
                            ? html`
                              <graph-info-row label="Team" value=${this.settings!.developmentTeam}>
                              </graph-info-row>
                            `
                            : nothing
                        }
                        ${
                          this.settings!.provisioningProfile
                            ? html`
                              <graph-info-row label="Profile">
                                <span
                                  class="truncated"
                                  title=${this.settings!.provisioningProfile}
                                >
                                  ${this.settings!.provisioningProfile}
                                </span>
                              </graph-info-row>
                            `
                            : nothing
                        }
                      </div>
                    </div>
                  `
                  : nothing
              }
            </div>
          `
          : nothing
      }
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-build-settings': GraphBuildSettings;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-build-settings')) {
  customElements.define('graph-build-settings', GraphBuildSettings);
}
