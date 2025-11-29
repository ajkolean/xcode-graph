/**
 * TEMPLATE: Lit Component
 *
 * Use this template to create new Lit components during the migration.
 * Replace COMPONENT_NAME with your component name (e.g., StatsCard, SearchBar)
 * Replace ELEMENT_TAG with the custom element tag (e.g., graph-stats-card, graph-search-bar)
 */

import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * COMPONENT_NAME Component
 *
 * [Brief description of what this component does]
 *
 * @example
 * ```html
 * <ELEMENT_TAG
 *   prop1="value1"
 *   .prop2=${value2}
 * ></ELEMENT_TAG>
 * ```
 *
 * @fires component-event - Dispatched when [describe when event fires]
 */
@customElement('ELEMENT_TAG')
export class COMPONENT_NAME extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * [Property description]
   */
  @property({ type: String })
  prop1 = '';

  /**
   * [Property description]
   */
  @property({ type: Boolean })
  prop2 = false;

  /**
   * [Property description]
   */
  @property({ type: Number })
  prop3 = 0;

  // ========================================
  // State (Private Properties)
  // ========================================

  // @state()
  // private _internalState = false;

  // ========================================
  // Reactive Controllers
  // ========================================

  // Example: Zustand store subscription
  // private selectedNode = createStoreController(
  //   this,
  //   useGraphStore,
  //   (s) => s.selectedNode
  // );

  // Example: Zag state machine
  // private machine = createMachineController(
  //   this,
  //   someMachine,
  //   { id: 'unique-id' }
  // );

  // ========================================
  // Styles
  // ========================================

  static readonly styles = css`
    :host {
      display: block;
      /* Add host styles */
    }

    /* Component styles using design tokens */
    .container {
      background-color: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      padding: var(--spacing-md);
      font-family: 'Inter', sans-serif;
    }

    .label {
      font-size: var(--text-small);
      color: var(--color-muted-foreground);
      margin-bottom: var(--spacing-xs);
    }

    .value {
      font-size: var(--text-h3);
      font-weight: var(--font-weight-semibold);
      color: var(--color-foreground);
    }

    /* Hover effects */
    .container:hover {
      transform: scale(1.02);
      box-shadow: 0 0 20px color-mix(in srgb, var(--primary) 15%, transparent);
      transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
    }
  `;

  // ========================================
  // Lifecycle Methods
  // ========================================

  // connectedCallback() {
  //   super.connectedCallback();
  //   // Initialize on connect
  // }

  // disconnectedCallback() {
  //   super.disconnectedCallback();
  //   // Cleanup on disconnect
  // }

  // ========================================
  // Event Handlers
  // ========================================

  private handleClick() {
    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent('component-event', {
        detail: {
          /* event data */
        },
        bubbles: true,
        composed: true, // Allows event to cross shadow DOM boundary
      }),
    );
  }

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <div class="container" @click=${this.handleClick}>
        <div class="label">${this.prop1}</div>
        <div class="value">${this.prop3}</div>
      </div>
    `;
  }
}

// Export for use in other TypeScript files
declare global {
  interface HTMLElementTagNameMap {
    ELEMENT_TAG: COMPONENT_NAME;
  }
}
