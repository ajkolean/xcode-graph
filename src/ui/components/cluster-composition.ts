/**
 * ClusterComposition Lit Component
 *
 * Shows composition statistics for a cluster:
 * - Total source files across all targets
 * - Total resources (with notable ones highlighted)
 * - Largest targets by source count
 *
 * @example
 * ```html
 * <xcode-graph-cluster-composition
 *   .nodes=${clusterNodes}
 * ></xcode-graph-cluster-composition>
 * ```
 */

import type { GraphNode } from '@shared/schemas/graph.types';
import { type CSSResultGroup, css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';
import './section-header.js';

/**
 * Shows composition statistics for a cluster including total source files,
 * total resources (with notable ones highlighted), and largest targets by source count.
 *
 * @summary Collapsible cluster composition statistics
 */
export class GraphClusterComposition extends LitElement {
  /**
   * Nodes in the cluster
   */
  @property({ attribute: false })
  declare nodes: GraphNode[];

  /**
   * Whether to start expanded (default: collapsed)
   */
  @property({ type: Boolean })
  declare expanded: boolean;

  @state()
  private declare isExpanded: boolean;

  constructor() {
    super();
    this.nodes = [];
    this.expanded = false;
    this.isExpanded = false;
  }

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
      margin-top: var(--spacing-2);
    }

    .stats-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2px 0;
    }

    .stat-label {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-sm);
      color: var(--colors-muted-foreground);
    }

    .stat-value {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
    }

    .notable-resources {
      margin-top: var(--spacing-2);
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-1);
    }

    .resource-badge {
      display: inline-flex;
      padding: var(--spacing-1) var(--spacing-2);
      background-color: var(--colors-muted);
      border-radius: var(--radii-sm);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
    }

    .resource-badge.privacy {
      background-color: color-mix(in srgb, var(--colors-success) 15%, transparent);
      color: var(--colors-success);
    }

    .section-divider {
      height: 1px;
      background-color: var(--colors-border);
      margin: var(--spacing-2) 0;
    }

    .largest-targets {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .target-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .target-name {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-foreground);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 180px;
    }

    .target-count {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
    }

    .sub-title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      color: var(--colors-muted-foreground);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      margin-bottom: var(--spacing-2);
    }
  `;

  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private get totalSources(): number {
    return this.nodes.reduce((sum, node) => sum + (node.sourceCount || 0), 0);
  }

  private get totalResources(): number {
    return this.nodes.reduce((sum, node) => sum + (node.resourceCount || 0), 0);
  }

  private get notableResources(): Set<string> {
    const notable = new Set<string>();
    for (const node of this.nodes) {
      if (node.notableResources) {
        for (const resource of node.notableResources) {
          notable.add(resource);
        }
      }
    }
    return notable;
  }

  private get hasPrivacyManifest(): boolean {
    return this.notableResources.has('PrivacyInfo.xcprivacy');
  }

  private get largestTargets(): Array<{ name: string; count: number }> {
    return this.nodes
      .filter((node) => (node.sourceCount || 0) > 0)
      .map((node) => ({ name: node.name, count: node.sourceCount || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private get hasContent(): boolean {
    return this.totalSources > 0 || this.totalResources > 0;
  }

  override render(): TemplateResult | typeof nothing {
    if (!this.hasContent) return nothing;

    return html`
      <button class="header" aria-expanded=${this.isExpanded} @click=${this.toggleExpanded}>
        <span class="title">Composition</span>
        <svg
          class=${classMap({ 'toggle-icon': true, expanded: this.isExpanded })}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      ${when(
        this.isExpanded,
        () => html`
            <div class="content">
              <div class="stats-row">
                <span class="stat-label">Total Source Files</span>
                <span class="stat-value">${this.totalSources.toLocaleString()}</span>
              </div>

              <div class="stats-row">
                <span class="stat-label">Total Resources</span>
                <span class="stat-value">${this.totalResources.toLocaleString()}</span>
              </div>

              ${when(
                this.hasPrivacyManifest || this.notableResources.size > 0,
                () => html`
                    <div class="notable-resources">
                      ${when(this.hasPrivacyManifest, () => html`<span class="resource-badge privacy">Privacy Manifest</span>`)}
                      ${repeat(
                        Array.from(this.notableResources)
                          .filter((r) => r !== 'PrivacyInfo.xcprivacy')
                          .slice(0, 3),
                        (r) => r,
                        (r) => html`<span class="resource-badge">${r}</span>`,
                      )}
                    </div>
                  `,
              )}

              ${when(
                this.largestTargets.length > 0,
                () => html`
                    <div class="section-divider"></div>
                    <div class="sub-title">Largest Targets</div>
                    <div class="largest-targets">
                      ${repeat(
                        this.largestTargets,
                        (target) => target.name,
                        (target) => html`
                          <div class="target-row">
                            <span class="target-name" title=${target.name}>${target.name}</span>
                            <span class="target-count">${target.count} files</span>
                          </div>
                        `,
                      )}
                    </div>
                  `,
              )}
            </div>
          `,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-cluster-composition': GraphClusterComposition;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-cluster-composition')) {
  customElements.define('xcode-graph-cluster-composition', GraphClusterComposition);
}
