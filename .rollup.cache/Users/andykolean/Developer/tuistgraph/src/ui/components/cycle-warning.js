import { __decorate } from "tslib";
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
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import * as litHtmlPrivate_1 from "lit-html/private-ssr-support.js";
const { EventPart: E_1 } = litHtmlPrivate_1._$LH;
const b_1 = i => i;
const lit_template_1 = { h: b_1 `
      <div class="warning-banner">
        <div class="warning-icon">\u26A0\uFE0F</div>
        <div class="warning-content">
          <div class="warning-header">
            <span class="warning-title">Circular Dependencies Detected</span>
            <span class="cycle-count"><?></span>
          </div>
          <div class="warning-message">
            Your dependency graph contains circular references. This may indicate a design issue that
            could lead to build problems or runtime errors.
          </div>
          <div class="warning-actions">
            <button class="btn btn-expand">
              <?>
            </button>
            <button class="btn btn-dismiss">Dismiss</button>
          </div>
          <?>
        </div>
        <button class="close-btn" title="Dismiss">\u00D7</button>
      </div>
    `, parts: [{ type: 2, index: 6 }, { type: 1, index: 9, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 10 }, { type: 1, index: 11, name: "click", strings: ["", ""], ctor: E_1 }, { type: 2, index: 12 }, { type: 1, index: 13, name: "click", strings: ["", ""], ctor: E_1 }] };
const lit_template_2 = { h: b_1 `
                <div class="cycle-list">
                  <?>
                </div>
              `, parts: [{ type: 2, index: 1 }] };
const lit_template_3 = { h: b_1 `
                      <div class="cycle-item">
                        <span class="cycle-index"><?>.</span>
                        <span class="cycle-path"><?></span>
                      </div>
                    `, parts: [{ type: 2, index: 2 }, { type: 2, index: 4 }] };
/**
 * Displays a warning banner when circular dependencies are detected in the graph.
 * Shows the number of cycles and allows users to expand details or dismiss the warning.
 *
 * @summary Dismissible circular dependency warning banner
 *
 * @fires dismiss - Dispatched when the warning is dismissed
 */
export class GraphCycleWarning extends LitElement {
    // ========================================
    // Styles
    // ========================================
    static styles = css `
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
      background: rgba(var(--colors-foreground-rgb), var(--opacity-5));
    }

    .cycle-list {
      margin-top: var(--spacing-2);
      padding: var(--spacing-3);
      background: rgba(var(--colors-foreground-rgb), var(--opacity-5));
      border-radius: var(--radii-sm);
      max-height: 200px;
      overflow-y: auto;
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
      background: rgba(var(--colors-foreground-rgb), var(--opacity-10));
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
    handleToggleExpand() {
        this.isExpanded = !this.isExpanded;
    }
    handleDismiss() {
        this.isDismissed = true;
        this.dispatchEvent(new CustomEvent('dismiss', {
            bubbles: true,
            composed: true,
        }));
    }
    // ========================================
    // Helpers
    // ========================================
    formatCycle(cycle) {
        return cycle.join(' → ');
    }
    // ========================================
    // Render
    // ========================================
    render() {
        if (this.isDismissed || !this.cycles || this.cycles.length === 0) {
            return null;
        }
        return { ["_$litType$"]: lit_template_1, values: [this.cycles.length, this.handleToggleExpand, this.isExpanded ? 'Hide Details' : 'Show Details', this.handleDismiss, this.isExpanded
                    ? { ["_$litType$"]: lit_template_2, values: [virtualize({
                                items: this.cycles,
                                renderItem: (cycle, index) => ({ ["_$litType$"]: lit_template_3, values: [index + 1, this.formatCycle(cycle)] }),
                            })] } : null, this.handleDismiss] };
    }
}
__decorate([
    property({ attribute: false })
], GraphCycleWarning.prototype, "cycles", void 0);
__decorate([
    state()
], GraphCycleWarning.prototype, "isExpanded", void 0);
__decorate([
    state()
], GraphCycleWarning.prototype, "isDismissed", void 0);
// Register custom element
if (!customElements.get('xcode-graph-cycle-warning')) {
    customElements.define('xcode-graph-cycle-warning', GraphCycleWarning);
}
//# sourceMappingURL=cycle-warning.js.map