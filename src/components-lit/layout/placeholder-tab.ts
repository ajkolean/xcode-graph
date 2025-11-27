/**
 * PlaceholderTab Lit Component
 *
 * Placeholder content for tabs that are coming soon.
 * Displays centered message with title.
 *
 * @example
 * ```html
 * <graph-placeholder-tab title="Builds"></graph-placeholder-tab>
 * ```
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('graph-placeholder-tab')
export class GraphPlaceholderTab extends LitElement {
  // ========================================
  // Properties
  // ========================================

  /**
   * The title of the tab section
   */
  @property({ type: String })
  declare title: string;

  // ========================================
  // Styles
  // ========================================

  static styles = css`
    :host {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      background-color: var(--color-background);
    }

    .container {
      text-align: center;
    }

    .title {
      font-family: 'DM Sans', sans-serif;
      font-size: var(--text-h1);
      font-weight: var(--font-weight-medium);
      color: var(--color-foreground);
      margin-bottom: var(--space-2, 8px);
      opacity: 0.8;
    }

    .subtitle {
      font-family: 'Inter', sans-serif;
      font-size: var(--text-base);
      color: var(--color-muted-foreground);
    }
  `;

  // ========================================
  // Render
  // ========================================

  render() {
    return html`
      <div class="container">
        <div class="title">${this.title}</div>
        <div class="subtitle">This section is coming soon</div>
      </div>
    `;
  }
}

// Export for TypeScript type checking
declare global {
  interface HTMLElementTagNameMap {
    'graph-placeholder-tab': GraphPlaceholderTab;
  }
}
