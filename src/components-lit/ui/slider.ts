import { LitElement, html, css } from 'lit';

/**
 * Graph Slider - A Lit Web Component for range sliders
 *
 * Accessible slider with keyboard support and ARIA.
 * Uses Shadow DOM with CSS custom properties.
 */
export class GraphSlider extends LitElement {
  static override properties = {
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    value: { type: Number },
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      position: relative;
    }

    .container {
      position: relative;
      display: flex;
      width: 100%;
      touch-action: none;
      align-items: center;
      user-select: none;
      cursor: pointer;
    }

    :host([disabled]) .container {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .track {
      position: relative;
      flex-grow: 1;
      overflow: hidden;
      border-radius: 9999px;
      background-color: var(--colors-muted);
      height: 4px;
    }

    .range {
      position: absolute;
      background-color: var(--colors-primary);
      height: 100%;
    }

    .thumb {
      position: absolute;
      display: block;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      border-radius: 9999px;
      border: 1px solid var(--colors-primary);
      background-color: var(--colors-background);
      box-shadow: var(--elevation-sm);
      transition: colors 150ms;
      pointer-events: none;
    }

    input {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      margin: 0;
    }

    input:disabled {
      cursor: not-allowed;
    }

    input:focus-visible + .thumb {
      box-shadow: 0 0 0 4px rgba(111, 44, 255, 0.5);
      outline: none;
    }
  `;

  declare min: number;
  declare max: number;
  declare step: number;
  declare value: number;
  declare disabled: boolean;

  constructor() {
    super();
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.value = 50;
    this.disabled = false;
  }

  private getPercentage(): number {
    return ((this.value - this.min) / (this.max - this.min)) * 100;
  }

  private handleInput(e: Event) {
    if (this.disabled) return;

    const target = e.target as HTMLInputElement;
    const newValue = Number(target.value);
    this.value = newValue;

    this.dispatchEvent(
      new CustomEvent('slider-change', {
        detail: { value: newValue },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    const percentage = this.getPercentage();
    const thumbPosition = `calc(${percentage}% - 8px)`;

    return html`
      <div class="container" data-slot="slider" ?data-disabled=${this.disabled}>
        <div class="track" data-slot="slider-track">
          <div class="range" data-slot="slider-range" style="width: ${percentage}%"></div>
        </div>
        <input
          type="range"
          min=${this.min}
          max=${this.max}
          step=${this.step}
          .value=${String(this.value)}
          ?disabled=${this.disabled}
          aria-valuemin=${this.min}
          aria-valuemax=${this.max}
          aria-valuenow=${this.value}
          @input=${this.handleInput}
        />
        <div class="thumb" data-slot="slider-thumb" style="left: ${thumbPosition}"></div>
      </div>
    `;
  }
}

customElements.define('graph-slider', GraphSlider);

declare global {
  interface HTMLElementTagNameMap {
    'graph-slider': GraphSlider;
  }
}
