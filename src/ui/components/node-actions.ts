/**
 * NodeActions Lit Component
 *
 * Action buttons for node (Show Dependency Chain, Show Dependents).
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
 * @fires focus-node - Dispatched when dependency chain button clicked
 * @fires show-dependents - Dispatched when dependents button clicked
 */

import { icons } from '@shared/controllers/icon.adapter';
import type { GraphNode } from '@shared/schemas/graph.schema';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

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

  static override readonly styles = css`
    :host {
      display: block;
      padding: var(--spacing-md);
      flex-shrink: 0;
      border-bottom: var(--border-widths-thin) solid var(--colors-border);
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
      border: var(--border-widths-thin) solid transparent;
      cursor: pointer;
    }

    .action-button:focus-visible {
      outline: 2px solid var(--colors-primary);
      outline-offset: 2px;
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

  // ========================================
  // Event Handlers
  // ========================================

  private handleFocusNode() {
    this.dispatchEvent(
      new CustomEvent('focus-node', {
        detail: { node: this.node },
        bubbles: true,
      }),
    );
  }

  private handleShowDependents() {
    this.dispatchEvent(
      new CustomEvent('show-dependents', {
        detail: { node: this.node },
        bubbles: true,
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  private getChainButtonClass(isActive: boolean): string {
    if (!isActive) return '';
    return this.viewMode === 'both' ? 'both' : 'active';
  }

  override render() {
    if (!this.node) return html``;

    const depButtonClass = this.getChainButtonClass(this.isDependencyChainActive);
    const depentsButtonClass = this.getChainButtonClass(this.isDependentsChainActive);

    return html`
      <div class="actions">
        <button
          class="action-button dependency-button ${depButtonClass}"
          @click=${this.handleFocusNode}
        >
          <span class="icon">
            ${unsafeHTML(this.isDependencyChainActive ? icons.EyeOff : icons.Eye)}
          </span>
          ${this.isDependencyChainActive ? 'Hide Dependencies' : 'Show Dependencies'}
        </button>

        <button
          class="action-button dependents-button ${depentsButtonClass}"
          @click=${this.handleShowDependents}
        >
          <span class="icon rotated">${unsafeHTML(icons.Focus)}</span>
          ${this.isDependentsChainActive ? 'Hide Dependents' : 'Show Dependents'}
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
