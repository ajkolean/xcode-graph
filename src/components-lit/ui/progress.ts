import { LitElement, html, css } from 'lit';

/**
 * Graph Progress - A Lit Web Component for progress bars
 *
 * Accessible progress indicator with ARIA support.
 * Uses Shadow DOM with native Lit CSS for proper encapsulation.
 *
 * @example
 * ```html
 * <graph-progress value="50"></graph-progress>
 * <graph-progress value="75" max="100"></graph-progress>
 * ```
 */
export class GraphProgress extends LitElement {
  static override properties = {
    value: { type: Number },
    max: { type: Number },
  };

  static override styles = css`
    :host {
      position: relative;
      display: block;
      height: var(--spacing-2);
      width: 100%;
      overflow: hidden;
      border-radius: var(--radii-full);
      background-color: var(--colors-primary);
      opacity: 0.2;
    }

    .indicator {
      background-color: var(--colors-primary);
      height: 100%;
      width: 100%;
      opacity: 1;
      transition: transform var(--durations-normal);
    }
  `;

  declare value: number;
  declare max: number;

  constructor() {
    super();
    this.value = 0;
    this.max = 100;
  }

  override connectedCallback() {
    super.connectedCallback();
    // Set ARIA attributes on the host
    this.setAttribute('role', 'progressbar');
    this.setAttribute('aria-valuemin', '0');
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('value') || changedProperties.has('max')) {
      this.setAttribute('aria-valuemax', String(this.max));
      this.setAttribute('aria-valuenow', String(this.value));
    }
  }

  private getPercentage(): number {
    return Math.min(Math.max((this.value / this.max) * 100, 0), 100);
  }

  protected override render() {
    const percentage = this.getPercentage();
    const translateX = 100 - percentage;

    return html`
      <div
        class="indicator"
        style="transform: translateX(-${translateX}%)"
      ></div>
    `;
  }
}

customElements.define('graph-progress', GraphProgress);

declare global {
  interface HTMLElementTagNameMap {
    'graph-progress': GraphProgress;
  }
}
