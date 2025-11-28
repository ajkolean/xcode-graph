/**
 * NodeActions Lit Component
 *
 * Action buttons for node (Focus, Show Dependents, Show Impact).
 * Displays active state based on current view mode.
 *
 * @example
 * ```html
 * <graph-node-actions
 *   .node=${nodeData}
 *   view-mode="focused"
 * ></graph-node-actions>
 * ```
 *
 * @fires focus-node - Dispatched when focus button clicked
 * @fires show-dependents - Dispatched when dependents button clicked
 * @fires show-impact - Dispatched when impact button clicked
 */

import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { icons } from '@/controllers/icon.adapter';
import type { GraphNode } from '@/data/mockGraphData';

export class GraphNodeActions extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare node: GraphNode;

  @property({ type: String, attribute: 'view-mode' })
  declare viewMode: string;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      flex-shrink: 0;
      border-bottom: 1px solid var(--colors-border);
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .action-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--radii-md);
      transition: all var(--durations-normal);
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-medium);
      line-height: var(--line-heights-normal);
      border: 1px solid transparent;
      cursor: pointer;
    }

    /* Dependency Chain Button (Purple) */
    .dependency-button {
      background-color: color-mix(in srgb, var(--colors-primary) 10%, transparent);
      border-color: color-mix(in srgb, var(--colors-primary) 30%, transparent);
      color: color-mix(in srgb, var(--colors-primary) 120%, white);
    }

    .dependency-button.active {
      background-color: var(--colors-primary);
      border-color: var(--colors-primary);
      color: var(--colors-primary-foreground);
    }

    .dependency-button.both {
      background-color: color-mix(in srgb, var(--colors-primary) 80%, transparent);
    }

    /* Dependents Chain Button (Green) */
    .dependents-button {
      background-color: color-mix(in srgb, var(--colors-chart-3) 10%, transparent);
      border-color: color-mix(in srgb, var(--colors-chart-3) 30%, transparent);
      color: var(--colors-chart-3);
    }

    .dependents-button.active {
      background-color: color-mix(in srgb, var(--colors-chart-3) 20%, transparent);
      border-color: color-mix(in srgb, var(--colors-chart-3) 50%, transparent);
      color: var(--colors-chart-3);
    }

    .dependents-button.both {
      background-color: color-mix(in srgb, var(--colors-chart-3) 80%, transparent);
      border-color: color-mix(in srgb, var(--colors-chart-3) 60%, transparent);
      color: var(--colors-primary-foreground);
    }

    /* Impact Button (neutral/foreground) */
    .impact-button {
      background-color: color-mix(in srgb, var(--colors-foreground) 8%, transparent);
      border-color: color-mix(in srgb, var(--colors-foreground) 25%, transparent);
      color: var(--colors-foreground);
    }

    .impact-button.active {
      background-color: var(--colors-foreground);
      border-color: var(--colors-foreground);
      color: var(--colors-background);
    }

    .icon {
      display: inline-flex;
    }

    .icon svg {
      width: var(--sizes-icon-sm);
      height: var(--sizes-icon-sm);
    }

    .icon.rotated svg {
      transform: rotate(180deg);
    }
  `;

  // ========================================
  // Helpers
  // ========================================

  private get isDependencyChainActive(): boolean {
    return this.viewMode === 'focused' || this.viewMode === 'both';
  }

  private get isDependentsChainActive(): boolean {
    return this.viewMode === 'dependents' || this.viewMode === 'both';
  }

  private get isImpactActive(): boolean {
    return this.viewMode === 'impact';
  }

  // ========================================
  // Event Handlers
  // ========================================

  private handleFocusNode() {
    this.dispatchEvent(
      new CustomEvent('focus-node', {
        detail: { node: this.node },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleShowDependents() {
    this.dispatchEvent(
      new CustomEvent('show-dependents', {
        detail: { node: this.node },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleShowImpact() {
    this.dispatchEvent(
      new CustomEvent('show-impact', {
        detail: { node: this.node },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    if (!this.node) return html``;

    const depButtonClass = this.isDependencyChainActive
      ? this.viewMode === 'both'
        ? 'both'
        : 'active'
      : '';

    const depentsButtonClass = this.isDependentsChainActive
      ? this.viewMode === 'both'
        ? 'both'
        : 'active'
      : '';

    const impactButtonClass = this.isImpactActive ? 'active' : '';

    return html`
      <div class="actions">
        <!-- Dependency Chain Button -->
        <button
          class="action-button dependency-button ${depButtonClass}"
          @click=${this.handleFocusNode}
        >
          <span class="icon">
            ${unsafeHTML(this.isDependencyChainActive ? icons.EyeOff : icons.Eye)}
          </span>
          ${this.isDependencyChainActive ? 'Hide Dependency Chain' : 'Show Dependency Chain'}
        </button>

        <!-- Dependents Chain Button -->
        <button
          class="action-button dependents-button ${depentsButtonClass}"
          @click=${this.handleShowDependents}
        >
          <span class="icon rotated">${unsafeHTML(icons.Focus)}</span>
          ${this.isDependentsChainActive ? 'Hide Dependents Chain' : 'Show Dependents Chain'}
        </button>

        <!-- Impact View Button -->
        <button
          class="action-button impact-button ${impactButtonClass}"
          @click=${this.handleShowImpact}
        >
          <span class="icon">${unsafeHTML(icons.Focus)}</span>
          ${this.isImpactActive ? 'Impact Active' : 'Show Impact'}
        </button>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-node-actions': GraphNodeActions;
  }
}

// Register custom element with HMR support
if (!customElements.get('graph-node-actions')) {
  customElements.define('graph-node-actions', GraphNodeActions);
}
