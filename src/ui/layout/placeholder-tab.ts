/**
 * PlaceholderTab Lit Component
 *
 * Placeholder content for tabs that are coming soon.
 * Displays centered message with title.
 *
 * @example
 * ```html
 * <xcode-graph-placeholder-tab title="Builds"></xcode-graph-placeholder-tab>
 * ```
 */

import { type CSSResultGroup, css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * Placeholder content for tabs that are coming soon.
 * Displays a centered message with title.
 *
 * @summary Coming soon placeholder tab
 */
export class GraphPlaceholderTab extends LitElement {
  /**
   * The title of the tab section
   */
  @property({ type: String })
  declare title: string;

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

  /** Renders the placeholder content with title and coming-soon message */
  override render(): TemplateResult {
    return html`
      <div class="container">
        <div class="title">${this.title}</div>
        <div class="subtitle">This section is coming soon</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-placeholder-tab': GraphPlaceholderTab;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-placeholder-tab')) {
  customElements.define('xcode-graph-placeholder-tab', GraphPlaceholderTab);
}
