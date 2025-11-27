import { LitElement, html, css, svg } from 'lit';

/**
 * Graph Checkbox - A Lit Web Component for checkboxes
 *
 * Accessible checkbox with proper ARIA support and keyboard navigation.
 * Uses Shadow DOM with CSS custom properties.
 */
export class GraphCheckbox extends LitElement {
  static override properties = {
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    name: { type: String },
    value: { type: String },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    button {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      border-radius: var(--radii-sm);
      border: 1px solid var(--colors-input);
      background-color: var(--colors-input-background);
      transition: all var(--durations-fast);
      cursor: pointer;
      outline: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    button:focus-visible {
      border-color: var(--colors-ring);
      box-shadow: 0 0 0 3px var(--colors-ring);
      opacity: 0.5;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    :host([checked]) button {
      background-color: var(--colors-primary);
      border-color: var(--colors-primary);
      color: var(--colors-primary-foreground);
    }

    .indicator {
      color: currentColor;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  declare checked: boolean;
  declare disabled: boolean;
  declare indeterminate: boolean;
  declare name: string;
  declare value: string;

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
    this.indeterminate = false;
    this.name = '';
    this.value = '';
  }

  private handleClick() {
    if (this.disabled) return;

    this.checked = !this.checked;
    this.indeterminate = false;

    this.dispatchEvent(
      new CustomEvent('checkbox-change', {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (this.disabled) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.handleClick();
    }
  }

  protected override render() {
    return html`
      <button
        type="button"
        role="checkbox"
        aria-checked=${this.indeterminate ? 'mixed' : this.checked}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? -1 : 0}
        data-slot="checkbox"
        data-state=${this.checked ? 'checked' : 'unchecked'}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        ${this.checked || this.indeterminate
          ? html`
              <span class="indicator" data-slot="checkbox-indicator">
                ${this.indeterminate
                  ? svg`
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    `
                  : svg`
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    `}
              </span>
            `
          : ''}
      </button>
    `;
  }
}

customElements.define('graph-checkbox', GraphCheckbox);

declare global {
  interface HTMLElementTagNameMap {
    'graph-checkbox': GraphCheckbox;
  }
}
