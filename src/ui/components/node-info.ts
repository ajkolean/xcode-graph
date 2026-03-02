/**
 * NodeInfo Lit Component
 *
 * Displays key-value pairs about a node including platform, origin, type,
 * bundle ID, product name, deployment targets, and source/resource counts.
 *
 * @example
 * ```html
 * <xcode-graph-node-info .node=${nodeData}></xcode-graph-node-info>
 * ```
 */

import { type GraphNode, Origin } from '@shared/schemas/graph.types';
import { getNodeTypeLabel } from '@ui/utils/node-icons';
import { type CSSResultGroup, css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import './deployment-targets.js';
import './info-row.js';

/**
 * Displays key-value pairs about a node including platform, origin, type,
 * bundle ID, product name, deployment targets, and source/resource counts.
 *
 * @summary Collapsible node information details section
 */
export class GraphNodeInfo extends LitElement {
  /** The graph node to display information for */
  @property({ attribute: false })
  declare node: GraphNode;

  /** Whether the section starts expanded */
  @property({ type: Boolean })
  declare expanded: boolean;

  @state()
  private declare isExpanded: boolean;

  @state()
  private declare scriptExpanded: boolean;

  constructor() {
    super();
    this.expanded = true;
    this.isExpanded = true;
    this.scriptExpanded = false;
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

    .header:hover .header-title {
      color: var(--colors-primary-text);
    }

    .header:hover .toggle-icon {
      color: var(--colors-primary-text);
      opacity: var(--opacity-80);
    }

    .header-title {
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

    .section {
      margin-bottom: var(--spacing-3);
    }

    .section:last-child {
      margin-bottom: 0;
    }

    .title {
      margin-bottom: var(--spacing-2);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      color: var(--colors-muted-foreground);
    }

    .info-rows {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .bundle-id {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .script-block {
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-foreground);
      background: var(--colors-muted);
      border-radius: var(--radii-sm);
      padding: var(--spacing-2);
      margin-top: var(--spacing-2);
      overflow: hidden;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 80px;
      transition: max-height 0.2s ease;
    }

    .script-block.expanded {
      max-height: none;
    }

    .expand-toggle {
      display: inline-block;
      margin-top: var(--spacing-1);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      color: var(--colors-primary);
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
    }

    .expand-toggle:hover {
      text-decoration: underline;
    }

    .input-badge {
      display: inline-block;
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
      background: var(--colors-muted);
      border-radius: var(--radii-sm);
      padding: 1px var(--spacing-1);
      margin-left: var(--spacing-1);
    }
  `;

  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private get originLabel(): string {
    return this.node.origin === Origin.Local ? 'Local Project' : 'External Package';
  }

  private get hasDeploymentTargets(): boolean {
    return (
      Boolean(this.node.deploymentTargets) &&
      Object.values(this.node.deploymentTargets).some((value) => value != null)
    );
  }

  private get hasDestinations(): boolean {
    return Boolean(this.node.destinations) && this.node.destinations.length > 0;
  }

  private renderForeignBuild() {
    const fb = this.node.foreignBuild;
    if (!fb) return nothing;

    return html`
      <div class="section">
        <div class="title">Foreign Build</div>
        <div class="info-rows">
          <xcode-graph-info-row label="Output" value=${fb.outputPath}></xcode-graph-info-row>
          <xcode-graph-info-row label="Linking" value=${fb.outputLinking}></xcode-graph-info-row>
          <xcode-graph-info-row label="Inputs">
            ${String(fb.inputCount)}
            ${fb.inputs.files.length > 0 ? html`<span class="input-badge">${fb.inputs.files.length} files</span>` : nothing}
            ${fb.inputs.folders.length > 0 ? html`<span class="input-badge">${fb.inputs.folders.length} folders</span>` : nothing}
            ${fb.inputs.scripts.length > 0 ? html`<span class="input-badge">${fb.inputs.scripts.length} scripts</span>` : nothing}
          </xcode-graph-info-row>
        </div>
        <div class="script-block ${this.scriptExpanded ? 'expanded' : ''}">${fb.script}</div>
        <button
          class="expand-toggle"
          @click=${() => {
            this.scriptExpanded = !this.scriptExpanded;
          }}
        >${this.scriptExpanded ? 'Collapse' : 'Expand'} script</button>
      </div>
    `;
  }

  private renderExpandedContent(): TemplateResult {
    const showProductName = this.node.productName && this.node.productName !== this.node.name;
    const showBundleId = Boolean(this.node.bundleId);
    const showDeploymentTargets = this.hasDeploymentTargets || this.hasDestinations;
    const showSourceCount = this.node.sourceCount != null && this.node.sourceCount > 0;
    const showResourceCount = this.node.resourceCount != null && this.node.resourceCount > 0;

    return html`
      <div class="content">
        <div class="section">
          <div class="title">Node Info</div>
          <div class="info-rows">
            <xcode-graph-info-row label="Platform" value=${this.node.platform}></xcode-graph-info-row>
            <xcode-graph-info-row label="Origin" value=${this.originLabel}></xcode-graph-info-row>
            <xcode-graph-info-row label="Type" value=${getNodeTypeLabel(this.node.type)}></xcode-graph-info-row>
            ${
              showProductName && this.node.productName
                ? html`<xcode-graph-info-row label="Product" value=${this.node.productName}></xcode-graph-info-row>`
                : nothing
            }
            ${
              showBundleId
                ? html`<xcode-graph-info-row label="Bundle ID">
                  <span class="bundle-id">${this.node.bundleId}</span>
                </xcode-graph-info-row>`
                : nothing
            }
          </div>
        </div>

        ${
          showDeploymentTargets
            ? html`
            <div class="section">
              <div class="title">Platform Support</div>
              <xcode-graph-deployment-targets
                .deploymentTargets=${this.node.deploymentTargets}
                .destinations=${this.node.destinations}
              ></xcode-graph-deployment-targets>
            </div>
          `
            : nothing
        }

        ${
          showSourceCount || showResourceCount
            ? html`
            <div class="section">
              <div class="title">Contents</div>
              <div class="info-rows">
                ${
                  showSourceCount
                    ? html`<xcode-graph-info-row label="Source Files" value=${String(this.node.sourceCount)}></xcode-graph-info-row>`
                    : nothing
                }
                ${
                  showResourceCount
                    ? html`<xcode-graph-info-row label="Resources" value=${String(this.node.resourceCount)}></xcode-graph-info-row>`
                    : nothing
                }
              </div>
            </div>
          `
            : nothing
        }

        ${this.renderForeignBuild()}
      </div>
    `;
  }

  override render(): TemplateResult {
    if (!this.node) return html``;

    return html`
      <button class="header" aria-expanded=${this.isExpanded} @click=${this.toggleExpanded}>
        <span class="header-title">Details</span>
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
    'xcode-graph-node-info': GraphNodeInfo;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-node-info')) {
  customElements.define('xcode-graph-node-info', GraphNodeInfo);
}
