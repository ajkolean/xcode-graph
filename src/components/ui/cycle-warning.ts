/**
 * CycleWarning Lit Component
 *
 * Displays a warning banner when circular dependencies are detected in the graph.
 * Shows the number of cycles and allows users to dismiss the warning.
 *
 * @example
 * ```html
 * <graph-cycle-warning
 *   .cycles=${[['A', 'B', 'C', 'A'], ['X', 'Y', 'X']]}
 *   @dismiss=${handleDismiss}
 * ></graph-cycle-warning>
 * ```
 */

import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

export class GraphCycleWarning extends LitElement {
  // ========================================
  // Properties
  // ========================================

  @property({ attribute: false })
  declare cycles: string[][];

  @state()
  private declare isExpanded: boolean;

  @state()
  private declare isDismissed: boolean;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: block;
    }

    .warning-banner {
      background: var(--color-warning-bg, #fef3cd);
      border: 1px solid var(--color-warning-border, #f0ad4e);
      border-radius: 4px;
      padding: 12px 16px;
      margin: 8px 0;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-family: 'Inter', sans-serif;
    }

    .warning-icon {
      flex-shrink: 0;
      color: var(--color-warning, #f0ad4e);
      font-size: 20px;
      line-height: 1;
    }

    .warning-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .warning-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .warning-title {
      font-weight: 600;
      color: var(--color-warning-text, #856404);
      font-size: 14px;
    }

    .cycle-count {
      background: var(--color-warning, #f0ad4e);
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 600;
    }

    .warning-message {
      color: var(--color-warning-text, #856404);
      font-size: 13px;
      line-height: 1.5;
    }

    .warning-actions {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }

    .btn {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      background: transparent;
      transition: all 0.2s;
    }

    .btn-expand {
      color: var(--color-warning-text, #856404);
      border-color: var(--color-warning-border, #f0ad4e);
    }

    .btn-expand:hover {
      background: var(--color-warning-hover, #fef9e7);
    }

    .btn-dismiss {
      color: var(--color-text-secondary, #666);
    }

    .btn-dismiss:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .cycle-list {
      margin-top: 8px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
    }

    .cycle-item {
      font-size: 12px;
      font-family: 'Monaco', 'Courier New', monospace;
      color: var(--color-warning-text, #856404);
      padding: 4px 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .cycle-index {
      color: var(--color-text-secondary, #666);
      min-width: 20px;
    }

    .cycle-path {
      flex: 1;
    }

    .cycle-arrow {
      color: var(--color-warning, #f0ad4e);
      margin: 0 4px;
    }

    .close-btn {
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: var(--color-warning-text, #856404);
      cursor: pointer;
      font-size: 18px;
      padding: 0;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  `;

  // ========================================
  // Lifecycle
  // ========================================

  constructor() {
    super();
    this.cycles = [];
    this.isExpanded = false;
    this.isDismissed = false;
  }

  // ========================================
  // Event Handlers
  // ========================================

  private handleToggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  private handleDismiss() {
    this.isDismissed = true;
    this.dispatchEvent(
      new CustomEvent('dismiss', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ========================================
  // Helpers
  // ========================================

  private formatCycle(cycle: string[]): string {
    return cycle.join(' → ');
  }

  // ========================================
  // Render
  // ========================================

  render() {
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
                        <span class="cycle-path">${this.formatCycle(cycle)}</span>
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
if (!customElements.get('graph-cycle-warning')) {
  customElements.define('graph-cycle-warning', GraphCycleWarning);
}

declare global {
  interface HTMLElementTagNameMap {
    'graph-cycle-warning': GraphCycleWarning;
  }
}
