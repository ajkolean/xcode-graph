import { LitElement, html, css } from 'lit';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Graph Tooltip - A Lit Web Component for tooltips
 *
 * Multi-component system with custom positioning logic.
 * Uses Shadow DOM with native Lit CSS for proper encapsulation.
 *
 * @example
 * ```html
 * <graph-tooltip delayDuration="700">
 *   <graph-tooltip-trigger>
 *     <button>Hover me</button>
 *   </graph-tooltip-trigger>
 *   <graph-tooltip-content side="right">
 *     Tooltip text
 *   </graph-tooltip-content>
 * </graph-tooltip>
 * ```
 */

/**
 * GraphTooltipProvider - Optional wrapper for shared delay settings
 */
export class GraphTooltipProvider extends LitElement {
  static override properties = {
    delayDuration: { type: Number },
  };

  static override styles = css`
    :host {
      display: contents;
    }
  `;

  declare delayDuration: number;

  constructor() {
    super();
    this.delayDuration = 700;
  }

  override firstUpdated() {
    // Propagate delay to child tooltips that don't have explicit delay
    const tooltips = this.querySelectorAll('graph-tooltip');
    tooltips.forEach((tooltip) => {
      if (!tooltip.hasAttribute('delayDuration')) {
        (tooltip as GraphTooltip).delayDuration = this.delayDuration;
      }
    });
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

/**
 * GraphTooltip - Root component managing tooltip state
 */
export class GraphTooltip extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
    delayDuration: { type: Number },
  };

  static override styles = css`
    :host {
      display: contents;
    }
  `;

  declare open: boolean;
  declare delayDuration: number;

  private openTimeout: number | null = null;

  constructor() {
    super();
    this.open = false;
    this.delayDuration = 700;
  }

  private handleTriggerEnter = () => {
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
    }

    if (this.delayDuration === 0) {
      this.open = true;
    } else {
      this.openTimeout = window.setTimeout(() => {
        this.open = true;
      }, this.delayDuration);
    }
  };

  private handleTriggerLeave = () => {
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = null;
    }
    this.open = false;
  };

  private handleTriggerFocus = () => {
    // Focus shows tooltip instantly (no delay)
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
    }
    this.open = true;
  };

  private handleTriggerBlur = () => {
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = null;
    }
    this.open = false;
  };

  private handleCloseRequest = () => {
    this.open = false;
  };

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
    }
  }

  protected override render() {
    return html`
      <slot
        @tooltip-trigger-enter=${this.handleTriggerEnter}
        @tooltip-trigger-leave=${this.handleTriggerLeave}
        @tooltip-trigger-focus=${this.handleTriggerFocus}
        @tooltip-trigger-blur=${this.handleTriggerBlur}
        @tooltip-close-request=${this.handleCloseRequest}
      ></slot>
    `;
  }
}

/**
 * GraphTooltipTrigger - Interactive element that triggers tooltip
 */
export class GraphTooltipTrigger extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }
  `;

  private tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
  private triggerElement: HTMLElement | null = null;

  private mouseEnterHandler = () => {
    this.dispatchEvent(
      new CustomEvent('tooltip-trigger-enter', {
        bubbles: true,
        composed: true,
      })
    );
  };

  private mouseLeaveHandler = () => {
    this.dispatchEvent(
      new CustomEvent('tooltip-trigger-leave', {
        bubbles: true,
        composed: true,
      })
    );
  };

  private focusHandler = () => {
    this.dispatchEvent(
      new CustomEvent('tooltip-trigger-focus', {
        bubbles: true,
        composed: true,
      })
    );
  };

  private blurHandler = () => {
    this.dispatchEvent(
      new CustomEvent('tooltip-trigger-blur', {
        bubbles: true,
        composed: true,
      })
    );
  };

  override firstUpdated() {
    const slotEl = this.shadowRoot?.querySelector('slot');
    if (!slotEl) return;

    slotEl.addEventListener('slotchange', () => {
      const elements = slotEl.assignedElements();
      this.triggerElement = elements[0] as HTMLElement;

      if (this.triggerElement) {
        // Add event listeners to trigger
        this.triggerElement.addEventListener('mouseenter', this.mouseEnterHandler);
        this.triggerElement.addEventListener('mouseleave', this.mouseLeaveHandler);
        this.triggerElement.addEventListener('focus', this.focusHandler);
        this.triggerElement.addEventListener('blur', this.blurHandler);

        // Set ARIA describedby
        this.triggerElement.setAttribute('aria-describedby', this.tooltipId);

        // Notify content component of tooltip ID
        this.dispatchEvent(
          new CustomEvent('tooltip-id-set', {
            detail: { id: this.tooltipId, trigger: this.triggerElement },
            bubbles: true,
            composed: true,
          })
        );
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.triggerElement) {
      this.triggerElement.removeEventListener('mouseenter', this.mouseEnterHandler);
      this.triggerElement.removeEventListener('mouseleave', this.mouseLeaveHandler);
      this.triggerElement.removeEventListener('focus', this.focusHandler);
      this.triggerElement.removeEventListener('blur', this.blurHandler);
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

/**
 * GraphTooltipContent - Floating content with positioning logic
 */
export class GraphTooltipContent extends LitElement {
  static override properties = {
    side: { type: String, reflect: true },
    sideOffset: { type: Number },
  };

  static override styles = css`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    .tooltip-content {
      position: fixed;
      top: var(--tooltip-top, 0);
      left: var(--tooltip-left, 0);
      z-index: 50;
      max-width: 250px;
      background-color: var(--colors-primary);
      color: var(--colors-primary-foreground);
      border-radius: var(--radii-md);
      padding: 6px 12px;
      font-size: var(--font-sizes-xs);
      line-height: 1.4;
      text-align: center;
      pointer-events: none;
      opacity: 0;
      transform: scale(0.95);
      transition: opacity var(--durations-fast), transform var(--durations-fast);
    }

    /* Show when open */
    :host([data-open]) .tooltip-content {
      opacity: 1;
      transform: scale(1);
    }

    /* Arrow */
    .arrow {
      position: absolute;
      width: 5px;
      height: 5px;
      background-color: var(--colors-primary);
      transform: rotate(45deg);
      left: var(--arrow-left, 50%);
      top: var(--arrow-top, 0);
      margin-left: -2.5px;
      margin-top: -2.5px;
    }

    /* Side-specific arrow positions */
    :host([side='top']) .arrow {
      bottom: -2.5px;
      top: auto;
    }

    :host([side='bottom']) .arrow {
      top: -2.5px;
    }

    :host([side='left']) .arrow {
      right: -2.5px;
      left: auto;
    }

    :host([side='right']) .arrow {
      left: -2.5px;
    }
  `;

  declare side: TooltipSide;
  declare sideOffset: number;

  private tooltipId = '';
  private triggerElement: HTMLElement | null = null;
  private updatePositionBound = this.updatePosition.bind(this);

  constructor() {
    super();
    this.side = 'top';
    this.sideOffset = 4;

    // Listen for tooltip ID from trigger
    this.addEventListener('tooltip-id-set', ((e: CustomEvent) => {
      this.tooltipId = e.detail.id;
      this.triggerElement = e.detail.trigger;
      this.requestUpdate();
    }) as EventListener);
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this.updatePositionBound, { passive: true });
    window.addEventListener('resize', this.updatePositionBound);
    document.addEventListener('keydown', this.handleKeydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this.updatePositionBound);
    window.removeEventListener('resize', this.updatePositionBound);
    document.removeEventListener('keydown', this.handleKeydown);
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.dispatchEvent(
        new CustomEvent('tooltip-close-request', {
          bubbles: true,
          composed: true,
        })
      );
    }
  };

  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    // Update position when tooltip opens or side changes
    if (changedProperties.has('side') || this.hasAttribute('data-open')) {
      this.updatePosition();
    }
  }

  private updatePosition() {
    if (!this.triggerElement) return;

    const contentEl = this.shadowRoot?.querySelector('.tooltip-content');
    if (!contentEl) return;

    const triggerRect = this.triggerElement.getBoundingClientRect();
    const contentRect = contentEl.getBoundingClientRect();

    // Calculate base position for each side
    const positions: Record<TooltipSide, { top: number; left: number }> = {
      top: {
        top: triggerRect.top - contentRect.height - this.sideOffset,
        left: triggerRect.left + triggerRect.width / 2 - contentRect.width / 2,
      },
      bottom: {
        top: triggerRect.bottom + this.sideOffset,
        left: triggerRect.left + triggerRect.width / 2 - contentRect.width / 2,
      },
      left: {
        top: triggerRect.top + triggerRect.height / 2 - contentRect.height / 2,
        left: triggerRect.left - contentRect.width - this.sideOffset,
      },
      right: {
        top: triggerRect.top + triggerRect.height / 2 - contentRect.height / 2,
        left: triggerRect.right + this.sideOffset,
      },
    };

    // Apply collision detection
    const finalPosition = this.handleCollisions(positions[this.side], contentRect);

    // Set position via CSS custom properties
    this.style.setProperty('--tooltip-top', `${finalPosition.top}px`);
    this.style.setProperty('--tooltip-left', `${finalPosition.left}px`);

    // Position arrow
    this.updateArrowPosition(triggerRect, finalPosition, contentRect);
  }

  private handleCollisions(
    position: { top: number; left: number },
    contentRect: DOMRect
  ): { top: number; left: number } {
    const padding = 8;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Clamp horizontal position
    position.left = Math.max(
      padding,
      Math.min(position.left, viewport.width - contentRect.width - padding)
    );

    // Clamp vertical position
    position.top = Math.max(
      padding,
      Math.min(position.top, viewport.height - contentRect.height - padding)
    );

    return position;
  }

  private updateArrowPosition(
    triggerRect: DOMRect,
    contentPos: { top: number; left: number },
    contentRect: DOMRect
  ) {
    if (this.side === 'top' || this.side === 'bottom') {
      // Center arrow horizontally relative to trigger
      const triggerCenter = triggerRect.left + triggerRect.width / 2;
      const arrowLeft = triggerCenter - contentPos.left;

      // Clamp arrow within tooltip bounds (with padding)
      const clampedArrowLeft = Math.max(
        10,
        Math.min(arrowLeft, contentRect.width - 10)
      );

      this.style.setProperty('--arrow-left', `${clampedArrowLeft}px`);
    } else {
      // Center arrow vertically relative to trigger
      const triggerCenter = triggerRect.top + triggerRect.height / 2;
      const arrowTop = triggerCenter - contentPos.top;

      // Clamp arrow within tooltip bounds (with padding)
      const clampedArrowTop = Math.max(
        10,
        Math.min(arrowTop, contentRect.height - 10)
      );

      this.style.setProperty('--arrow-top', `${clampedArrowTop}px`);
    }
  }

  protected override render() {
    const parentTooltip = this.closest('graph-tooltip') as GraphTooltip | null;
    const isOpen = parentTooltip?.open ?? false;

    // Set data attribute for styling
    if (isOpen) {
      this.setAttribute('data-open', '');
    } else {
      this.removeAttribute('data-open');
    }

    return html`
      <div
        id=${this.tooltipId}
        role="tooltip"
        class="tooltip-content"
        aria-hidden=${!isOpen}
      >
        <slot></slot>
        <div class="arrow"></div>
      </div>
    `;
  }
}

// Register all custom elements
customElements.define('graph-tooltip-provider', GraphTooltipProvider);
customElements.define('graph-tooltip', GraphTooltip);
customElements.define('graph-tooltip-trigger', GraphTooltipTrigger);
customElements.define('graph-tooltip-content', GraphTooltipContent);

// TypeScript declarations
declare global {
  interface HTMLElementTagNameMap {
    'graph-tooltip-provider': GraphTooltipProvider;
    'graph-tooltip': GraphTooltip;
    'graph-tooltip-trigger': GraphTooltipTrigger;
    'graph-tooltip-content': GraphTooltipContent;
  }
}
