/**
 * NodeInfo Lit Component
 *
 * Displays key-value pairs about a node including platform, origin, type,
 * bundle ID, product name, deployment targets, and source/resource counts.
 *
 * @example
 * ```html
 * <graph-node-info .node=${nodeData}></graph-node-info>
 * ```
 */

import type { GraphNode } from '@shared/schemas/graph.schema';
import { getNodeTypeLabel } from '@ui/utils/node-icons';
import { css, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import './deployment-targets.js';
import './info-row.js';

export class GraphNodeInfo extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare node: GraphNode;

  // ========================================
  // Styles
  // ========================================

  static override readonly styles = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      margin-top: auto;
    }

    .section {
      margin-bottom: var(--spacing-4);
    }

    .section:last-child {
      margin-bottom: 0;
    }

    .title {
      margin-bottom: var(--spacing-3);
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
  `;

  // ========================================
  // Helpers
  // ========================================

  private get originLabel(): string {
    return this.node.origin === 'local' ? 'Local Project' : 'External Package';
  }

  private get hasDeploymentTargets(): boolean {
    return (
      !!this.node.deploymentTargets &&
      Object.values(this.node.deploymentTargets).some((v) => v != null)
    );
  }

  private get hasDestinations(): boolean {
    return !!this.node.destinations && this.node.destinations.length > 0;
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    if (!this.node) return html``;

    const showProductName = this.node.productName && this.node.productName !== this.node.name;
    const showBundleId = !!this.node.bundleId;
    const showDeploymentTargets = this.hasDeploymentTargets || this.hasDestinations;
    const showSourceCount = this.node.sourceCount != null && this.node.sourceCount > 0;
    const showResourceCount = this.node.resourceCount != null && this.node.resourceCount > 0;

    return html`
      <!-- Basic Info Section -->
      <div class="section">
        <div class="title">Node Info</div>
        <div class="info-rows">
          <graph-info-row label="Platform" value=${this.node.platform}></graph-info-row>
          <graph-info-row label="Origin" value=${this.originLabel}></graph-info-row>
          <graph-info-row label="Type" value=${getNodeTypeLabel(this.node.type)}></graph-info-row>
          ${
            showProductName
              ? html`<graph-info-row label="Product" value=${this.node.productName!}></graph-info-row>`
              : nothing
          }
          ${
            showBundleId
              ? html`<graph-info-row label="Bundle ID">
                <span class="bundle-id">${this.node.bundleId}</span>
              </graph-info-row>`
              : nothing
          }
        </div>
      </div>

      <!-- Deployment Targets Section -->
      ${
        showDeploymentTargets
          ? html`
          <div class="section">
            <div class="title">Platform Support</div>
            <graph-deployment-targets
              .deploymentTargets=${this.node.deploymentTargets}
              .destinations=${this.node.destinations}
            ></graph-deployment-targets>
          </div>
        `
          : nothing
      }

      <!-- File Counts Section -->
      ${
        showSourceCount || showResourceCount
          ? html`
          <div class="section">
            <div class="title">Contents</div>
            <div class="info-rows">
              ${
                showSourceCount
                  ? html`<graph-info-row label="Source Files" value=${String(this.node.sourceCount)}></graph-info-row>`
                  : nothing
              }
              ${
                showResourceCount
                  ? html`<graph-info-row label="Resources" value=${String(this.node.resourceCount)}></graph-info-row>`
                  : nothing
              }
            </div>
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
    'graph-node-info': GraphNodeInfo;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-node-info')) {
  customElements.define('graph-node-info', GraphNodeInfo);
}
