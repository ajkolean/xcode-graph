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

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

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

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      background-color: var(--colors-background);
    }

    .container {
      text-align: center;
    }

    .title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-h1);
      font-weight: var(--font-weights-medium);
      color: var(--colors-foreground);
      margin-bottom: var(--spacing-2);
      opacity: var(--opacity-80);
    }

    .subtitle {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-base);
      color: var(--colors-muted-foreground);
    }
  `;

  // ========================================
  // Render
  // ========================================

  override render(): TemplateResult {
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

// Register custom element with HMR support
if (!customElements.get('graph-placeholder-tab')) {
  customElements.define('graph-placeholder-tab', GraphPlaceholderTab);
}
