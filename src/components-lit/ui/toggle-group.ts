import { LitElement, html, css } from 'lit';

export type ToggleGroupType = 'single' | 'multiple';
export type ToggleGroupVariant = 'default' | 'outline';
export type ToggleGroupSize = 'default' | 'sm' | 'lg';

// Toggle Group Root
export class GraphToggleGroup extends LitElement {
  static override properties = {
    type: { type: String },
    value: { type: String },
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      border-radius: var(--radii-md);
    }

    :host([variant='outline']) {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
  `;

  declare type: ToggleGroupType;
  declare value: string | string[];
  declare variant: ToggleGroupVariant;
  declare size: ToggleGroupSize;
  declare disabled: boolean;

  constructor() {
    super();
    this.type = 'single';
    this.value = '';
    this.variant = 'default';
    this.size = 'default';
    this.disabled = false;
  }

  toggleItem(itemValue: string) {
    if (this.disabled) return;

    if (this.type === 'single') {
      this.value = this.value === itemValue ? '' : itemValue;
    } else {
      const values = Array.isArray(this.value) ? this.value : this.value ? [this.value] : [];
      const index = values.indexOf(itemValue);

      if (index > -1) {
        values.splice(index, 1);
      } else {
        values.push(itemValue);
      }

      this.value = values as any;
    }

    this.dispatchEvent(
      new CustomEvent('toggle-group-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );

    this.requestUpdate();
  }

  isPressed(itemValue: string): boolean {
    if (this.type === 'single') {
      return this.value === itemValue;
    } else {
      const values = Array.isArray(this.value) ? this.value : this.value ? [this.value] : [];
      return values.includes(itemValue);
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

// Toggle Group Item
export class GraphToggleGroupItem extends LitElement {
  static override properties = {
    value: { type: String },
    pressed: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: inline-flex;
      flex: 1 1 0%;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      border-radius: 0;
      font-size: var(--font-sizes-sm);
      font-weight: var(--font-weights-medium);
      white-space: nowrap;
      transition-property: color, box-shadow;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
      outline: none;
      box-shadow: none;
      min-width: 0;
    }

    /* Parent variant/size context */
    :host-context(graph-toggle-group[variant='default']) {
      background-color: transparent;
    }

    :host-context(graph-toggle-group[variant='outline']) {
      border: 1px solid var(--colors-input);
      border-left: 0;
      background-color: transparent;
    }

    :host-context(graph-toggle-group[variant='outline']):first-of-type {
      border-left: 1px solid var(--colors-input);
    }

    :host-context(graph-toggle-group[size='default']) {
      height: var(--spacing-9);
      padding: 0 var(--spacing-2);
      min-width: var(--spacing-9);
    }

    :host-context(graph-toggle-group[size='sm']) {
      height: var(--spacing-8);
      padding: 0 var(--spacing-1-5, 0.375rem);
      min-width: var(--spacing-8);
    }

    :host-context(graph-toggle-group[size='lg']) {
      height: var(--spacing-10);
      padding: 0 var(--spacing-2-5, 0.625rem);
      min-width: var(--spacing-10);
    }

    /* First/last child border radius */
    :host(:first-of-type) {
      border-top-left-radius: var(--radii-md);
      border-bottom-left-radius: var(--radii-md);
    }

    :host(:last-of-type) {
      border-top-right-radius: var(--radii-md);
      border-bottom-right-radius: var(--radii-md);
    }

    /* Focus styles */
    :host(:focus),
    :host(:focus-visible) {
      z-index: 10;
      border-color: var(--colors-ring);
      box-shadow: 0 0 0 3px var(--colors-ring);
      opacity: 0.5;
    }

    /* Hover styles */
    button:hover {
      background-color: var(--colors-muted);
      color: var(--colors-muted-foreground);
    }

    /* Pressed (selected) state */
    :host([pressed]) button {
      background-color: var(--colors-accent);
      color: var(--colors-accent-foreground);
    }

    /* Disabled state */
    :host([disabled]) button {
      pointer-events: none;
      opacity: 0.5;
      cursor: not-allowed;
    }

    button {
      all: inherit;
      width: 100%;
      height: 100%;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
    }

    ::slotted(svg) {
      pointer-events: none;
      width: var(--spacing-4);
      height: var(--spacing-4);
      flex-shrink: 0;
    }
  `;

  declare value: string;
  declare pressed: boolean;
  declare disabled: boolean;

  constructor() {
    super();
    this.value = '';
    this.pressed = false;
    this.disabled = false;
  }

  private handleClick() {
    if (this.disabled) return;

    const toggleGroup = this.closest('graph-toggle-group') as GraphToggleGroup;
    toggleGroup?.toggleItem(this.value);

    // Update pressed state based on group
    this.pressed = toggleGroup?.isPressed(this.value) ?? false;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Check initial pressed state
    const toggleGroup = this.closest('graph-toggle-group') as GraphToggleGroup;
    if (toggleGroup) {
      this.pressed = toggleGroup.isPressed(this.value);
    }
  }

  protected override render() {
    return html`
      <button
        type="button"
        role="button"
        aria-pressed=${this.pressed}
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <slot></slot>
      </button>
    `;
  }
}

// Register all components
customElements.define('graph-toggle-group', GraphToggleGroup);
customElements.define('graph-toggle-group-item', GraphToggleGroupItem);

declare global {
  interface HTMLElementTagNameMap {
    'graph-toggle-group': GraphToggleGroup;
    'graph-toggle-group-item': GraphToggleGroupItem;
  }
}
