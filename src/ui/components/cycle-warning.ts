/**
 * CycleWarning Lit Component
 *
 * Displays a warning banner when circular dependencies are detected in the graph.
 * Shows the number of cycles and allows users to dismiss the warning.
 *
 * @example
 * ```html
 * <xcode-graph-cycle-warning
 *   .cycles=${[['A', 'B', 'C', 'A'], ['X', 'Y', 'X']]}
 *   @dismiss=${handleDismiss}
 * ></xcode-graph-cycle-warning>
 * ```
 */

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

/** Formats a cycle path as an arrow-separated string */
function formatCycle(cycle: string[]): string {
  return cycle.join(' \u2192 ');
}

/**
 * Displays a warning banner when circular dependencies are detected in the graph.
 * Shows the number of cycles and allows users to expand details or dismiss the warning.
 *
 * @summary Dismissible circular dependency warning banner
 *
 * @fires dismiss - Dispatched when the warning is dismissed
 */
export class GraphCycleWarning extends LitElement {
  /** Array of circular dependency cycles, each cycle is a list of node names */
  @property({ attribute: false })
  declare cycles: string[][];

  @state()
  private declare isExpanded: boolean;

  @state()
  private declare isDismissed: boolean;

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
    }

    .warning-banner {
      background: var(--colors-warning-bg, #fef3cd);
      border: var(--border-widths-thin) solid var(--colors-warning-border, #f0ad4e);
      border-radius: var(--radii-sm);
      padding: var(--spacing-3) var(--spacing-md);
      margin: var(--spacing-2) 0;
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);
      font-family: var(--fonts-body);
    }

    .warning-icon {
      flex-shrink: 0;
      color: var(--colors-warning, #f0ad4e);
      font-size: var(--font-sizes-xl);
      line-height: 1;
    }

    .warning-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .warning-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .warning-title {
      font-weight: var(--font-weights-semibold);
      color: var(--colors-warning-text, #856404);
      font-size: var(--font-sizes-sm);
    }

    .cycle-count {
      background: var(--colors-warning, #f0ad4e);
      color: white;
      border-radius: var(--radii-full);
      padding: var(--spacing-1) var(--spacing-2);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-semibold);
    }

    .warning-message {
      color: var(--colors-warning-text, #856404);
      font-size: var(--font-sizes-sm);
      line-height: var(--line-heights-normal);
    }

    .warning-actions {
      display: flex;
      gap: var(--spacing-2);
      margin-top: var(--spacing-1);
    }

    .btn {
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--radii-sm);
      font-size: var(--font-sizes-label);
      font-weight: var(--font-weights-medium);
      cursor: pointer;
      border: var(--border-widths-thin) solid transparent;
      background: transparent;
      transition: all var(--durations-normal);
    }

    .btn-expand {
      color: var(--colors-warning-text, #856404);
      border-color: var(--colors-warning-border, #f0ad4e);
    }

    .btn-expand:hover {
      background: var(--colors-warning-hover, #fef9e7);
    }

    .btn-dismiss {
      color: var(--colors-muted-foreground);
    }

    .btn-dismiss:hover {
      background: color-mix(in srgb, var(--colors-foreground) 5%, transparent);
    }

    .cycle-list {
      margin-top: var(--spacing-2);
      padding: var(--spacing-3);
      background: color-mix(in srgb, var(--colors-foreground) 5%, transparent);
      border-radius: var(--radii-sm);
    }

    .cycle-item {
      font-size: var(--font-sizes-label);
      font-family: var(--fonts-mono);
      color: var(--colors-warning-text, #856404);
      padding: var(--spacing-1) 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    .cycle-index {
      color: var(--colors-muted-foreground);
      min-width: var(--sizes-icon-md);
    }

    .cycle-path {
      flex: 1;
    }

    .cycle-arrow {
      color: var(--colors-warning, #f0ad4e);
      margin: 0 var(--spacing-1);
    }

    .close-btn {
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: var(--colors-warning-text, #856404);
      cursor: pointer;
      font-size: var(--font-sizes-lg);
      padding: 0;
      width: var(--sizes-icon-xl);
      height: var(--sizes-icon-xl);
      border-radius: var(--radii-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--durations-normal);
    }

    .close-btn:hover {
      background: color-mix(in srgb, var(--colors-foreground) 10%, transparent);
    }
  `;

  constructor() {
    super();
    this.cycles = [];
    this.isExpanded = false;
    this.isDismissed = false;
  }

  /** Toggles the expanded details view */
  private handleToggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  /** Handles the dismiss event and hides the warning */
  private handleDismiss() {
    this.isDismissed = true;
    this.dispatchEvent(
      new CustomEvent('dismiss', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Renders the component template */
  override render(): TemplateResult | null {
    if (this.isDismissed || !this.cycles || this.cycles.length === 0) {
      return null;
    }

    return html`
      <div class="warning-banner">
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-header">
            <span class="warning-title">Circular Dependencies Detected</span>
            <span class="cycle-count">${this.cycles.length}</span>
          </div>
          <div class="warning-message">
            Your dependency graph contains circular references. This may indicate a design issue that
            could lead to build problems or runtime errors.
          </div>
          <div class="warning-actions">
            <button class="btn btn-expand" @click=${this.handleToggleExpand}>
              ${this.isExpanded ? 'Hide Details' : 'Show Details'}
            </button>
            <button class="btn btn-dismiss" @click=${this.handleDismiss}>Dismiss</button>
          </div>
          ${
            this.isExpanded
              ? html`
                <div class="cycle-list">
                  ${this.cycles.map(
                    (cycle, index) => html`
                      <div class="cycle-item">
                        <span class="cycle-index">${index + 1}.</span>
                        <span class="cycle-path">${formatCycle(cycle)}</span>
                      </div>
                    `,
                  )}
                </div>
              `
              : null
          }
        </div>
        <button class="close-btn" @click=${this.handleDismiss} title="Dismiss">×</button>
      </div>
    `;
  }
}

// Register custom element
if (!customElements.get('xcode-graph-cycle-warning')) {
  customElements.define('xcode-graph-cycle-warning', GraphCycleWarning);
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-cycle-warning': GraphCycleWarning;
  }
}
