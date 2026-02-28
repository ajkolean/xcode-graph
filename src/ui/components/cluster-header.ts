/**
 * ClusterHeader Lit Component
 *
 * Header for cluster details panel with back button, icon, and cluster info.
 * Uses graph-panel-header for consistent layout.
 * Shows source type (Local/Registry/Git) and provides path copy button.
 *
 * @example
 * ```html
 * <graph-cluster-header
 *   cluster-name="MyPackage"
 *   cluster-type="package"
 *   cluster-color="#8B5CF6"
 *   cluster-path="/path/to/package"
 *   is-external
 * ></graph-cluster-header>
 * ```
 *
 * @fires back - Dispatched when back button is clicked
 */

import { icons } from '@shared/controllers/icon.adapter';
import { SourceType } from '@shared/schemas/graph.schema';
import { type CSSResultGroup, css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import './badge.js';
import './panel-header.js';

/** Source type colors and labels */
const SOURCE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  [SourceType.Local]: { label: 'Local', color: 'var(--colors-success)' },
  [SourceType.Registry]: { label: 'Registry', color: 'var(--colors-info)' },
  [SourceType.Git]: { label: 'Git', color: 'var(--colors-primary)' },
};

export class GraphClusterHeader extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ type: String, attribute: 'cluster-name' })
  declare clusterName: string;

  @property({ type: String, attribute: 'cluster-type' })
  declare clusterType: 'package' | 'project';

  @property({ type: String, attribute: 'cluster-color' })
  declare clusterColor: string;

  @property({ type: String, attribute: 'cluster-path' })
  declare clusterPath: string;

  @property({ type: Boolean, attribute: 'is-external' })
  declare isExternal: boolean;

  @state()
  private declare copied: boolean;

  constructor() {
    super();
    this.copied = false;
  }

  // ========================================
  // Styles
  // ========================================

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
    }

    .cluster-icon {
      width: var(--sizes-icon-xl);
      height: var(--sizes-icon-xl);
    }

    .cluster-icon svg {
      width: 100%;
      height: 100%;
    }

    .badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-1);
      margin-top: var(--spacing-2);
      padding: 0 var(--spacing-md);
    }

    .path-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-md);
    }

    .path-text {
      flex: 1;
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--colors-muted-foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .copy-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-1);
      background: transparent;
      border: none;
      border-radius: var(--radii-sm);
      cursor: pointer;
      color: var(--colors-muted-foreground);
      transition:
        background-color var(--durations-fast) var(--easings-out),
        color var(--durations-fast) var(--easings-out);
    }

    .copy-button:hover {
      background-color: var(--colors-muted);
      color: var(--colors-foreground);
    }

    .copy-button.copied {
      color: var(--colors-success);
    }

    .copy-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
    }

    .copy-button svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }
  `;

  // ========================================
  // Helpers
  // ========================================

  private getSourceType(): SourceType {
    if (!this.clusterPath) return SourceType.Local;

    if (this.clusterPath.includes('.build/registry/downloads/')) {
      return SourceType.Registry;
    }
    if (this.clusterPath.includes('.build/checkouts/')) {
      return SourceType.Git;
    }
    return SourceType.Local;
  }

  private getShortPath(): string {
    if (!this.clusterPath) return '';

    // Try to extract a meaningful short path
    const registryMatch = this.clusterPath.match(/\.build\/registry\/downloads\/([^/]+\/[^/]+)/);
    if (registryMatch) return registryMatch[1] ?? '';

    const checkoutMatch = this.clusterPath.match(/\.build\/checkouts\/([^/]+)/);
    if (checkoutMatch) return checkoutMatch[1] ?? '';

    // For local paths, show last 2-3 segments
    const segments = this.clusterPath.split('/').filter(Boolean);
    return segments.slice(-3).join('/');
  }

  private async handleCopyPath() {
    if (!this.clusterPath) return;

    try {
      await navigator.clipboard.writeText(this.clusterPath);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    } catch {
      // Fallback: just ignore if clipboard not available
    }
  }

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
    const isPackage = this.clusterType === 'package';
    const clusterIcon = isPackage ? icons.Package : icons.Folder;
    const color = this.clusterColor || '#8B5CF6';
    const sourceType = this.getSourceType();
    const sourceConfig = SOURCE_TYPE_CONFIG[sourceType];
    const shortPath = this.getShortPath();

    return html`
      <graph-panel-header
        title=${this.clusterName}
        subtitle=${this.isExternal ? 'External' : 'Internal'}
        color=${color}
        title-size="md"
      >
        <!-- Cluster Icon -->
        <span slot="icon" class="cluster-icon" style="color: ${color}">
          ${unsafeHTML(clusterIcon)}
        </span>

        <!-- Source Type and Type Badges -->
        <graph-badge
          slot="badges"
          label=${isPackage ? 'Package' : 'Project'}
          color=${color}
          variant="rounded"
          size="sm"
        ></graph-badge>
        <graph-badge
          slot="badges"
          label=${sourceConfig?.label ?? ''}
          color=${sourceConfig?.color ?? 'var(--colors-muted-foreground)'}
          variant="rounded"
          size="sm"
        ></graph-badge>
      </graph-panel-header>

      <!-- Path with Copy Button -->
      ${
        shortPath
          ? html`
            <div class="path-row">
              <span class="path-text" title=${this.clusterPath}>${shortPath}</span>
              <button
                class="copy-button ${this.copied ? 'copied' : ''}"
                @click=${this.handleCopyPath}
                title=${this.copied ? 'Copied!' : 'Copy full path'}
              >
                ${
                  this.copied
                    ? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>`
                    : html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>`
                }
              </button>
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
    'graph-cluster-header': GraphClusterHeader;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-cluster-header')) {
  customElements.define('graph-cluster-header', GraphClusterHeader);
}
