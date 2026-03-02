/**
 * DeploymentTargets Lit Component
 *
 * Displays platform deployment targets (minimum OS versions) and
 * supported destinations (device types) for a node.
 *
 * @example
 * ```html
 * <xcode-graph-deployment-targets
 *   .deploymentTargets=${{ iOS: '14.0', macOS: '12.0' }}
 *   .destinations=${['iPhone', 'iPad', 'mac']}
 * ></xcode-graph-deployment-targets>
 * ```
 */

import type { DeploymentTargets, Destination } from '@shared/schemas/graph.types';
import { getPlatformColor } from '@ui/utils/platform-icons';
import { type CSSResultGroup, css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';
import './badge.js';

/** Destination display labels and colors */
const DESTINATION_CONFIG: Record<string, { label: string; color: string }> = {
  iPhone: { label: 'iPhone', color: '#007AFF' },
  iPad: { label: 'iPad', color: '#5856D6' },
  mac: { label: 'Mac', color: '#64D2FF' },
  macCatalyst: { label: 'Mac Catalyst', color: '#FF9500' },
  macWithiPadDesign: { label: 'Mac (iPad Design)', color: '#FF9500' },
  appleTv: { label: 'Apple TV', color: '#B87BFF' },
  appleWatch: { label: 'Apple Watch', color: '#5AC8FA' },
  appleVision: { label: 'Apple Vision', color: '#7D7AFF' },
  appleVisionWithiPadDesign: { label: 'Vision (iPad Design)', color: '#7D7AFF' },
};

/**
 * Displays platform deployment targets (minimum OS versions) and
 * supported destinations (device types) for a node.
 *
 * @summary Platform deployment targets and destination badges
 */
export class GraphDeploymentTargets extends LitElement {
  /**
   * Deployment targets with minimum OS versions per platform
   */
  @property({ attribute: false })
  declare deploymentTargets: DeploymentTargets | undefined;

  /**
   * Supported destinations (device types)
   */
  @property({ attribute: false })
  declare destinations: Destination[] | undefined;

  /**
   * Whether to show in compact mode (badges only, no labels)
   */
  @property({ type: Boolean })
  declare compact: boolean;

  constructor() {
    super();
    this.compact = false;
  }

  static override readonly styles: CSSResultGroup = css`
    :host {
      display: block;
    }

    .section {
      margin-bottom: var(--spacing-3);
    }

    .section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-family: var(--fonts-body);
      font-size: var(--font-sizes-xs);
      font-weight: var(--font-weights-medium);
      color: var(--colors-muted-foreground);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      margin-bottom: var(--spacing-2);
    }

    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-1);
    }

    .platform-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      background-color: var(--platform-bg);
      border: var(--border-widths-thin) solid var(--platform-border);
      border-radius: var(--radii-sm);
      font-family: var(--fonts-mono);
      font-size: var(--font-sizes-xs);
      color: var(--platform-color);
    }

    .platform-name {
      font-weight: var(--font-weights-semibold);
    }

    .platform-version {
      opacity: 0.8;
    }

    /* Compact mode */
    :host([compact]) .section-title {
      display: none;
    }

    :host([compact]) .section {
      margin-bottom: var(--spacing-1);
    }
  `;

  /** Renders platform minimum OS version badges */
  private renderPlatformTargets() {
    if (!this.deploymentTargets) return nothing;

    const platforms = Object.entries(this.deploymentTargets).filter(
      ([, version]) => version != null,
    );

    if (platforms.length === 0) return nothing;

    return html`
      <div class="section">
        ${when(!this.compact, () => html`<div class="section-title">Min OS Versions</div>`)}
        <div class="badges">
          ${repeat(
            platforms,
            ([platform]) => platform,
            ([platform, version]) => {
              const color = getPlatformColor(platform);
              return html`
              <span
                class="platform-badge"
                style=${styleMap({
                  '--platform-color': color,
                  '--platform-bg': `${color}15`,
                  '--platform-border': `${color}30`,
                })}
              >
                <span class="platform-name">${platform}</span>
                <span class="platform-version">${version}+</span>
              </span>
            `;
            },
          )}
        </div>
      </div>
    `;
  }

  /** Renders destination device type badges */
  private renderDestinations() {
    if (!this.destinations || this.destinations.length === 0) return nothing;

    return html`
      <div class="section">
        ${when(!this.compact, () => html`<div class="section-title">Destinations</div>`)}
        <div class="badges">
          ${repeat(
            this.destinations,
            (dest) => dest,
            (dest) => {
              const config = DESTINATION_CONFIG[dest] || { label: dest, color: '#8E8E93' };
              return html`
              <xcode-graph-badge
                label=${config.label}
                color=${config.color}
                variant="rounded"
                size="sm"
              ></xcode-graph-badge>
            `;
            },
          )}
        </div>
      </div>
    `;
  }

  /** Renders the component template */
  override render(): TemplateResult | typeof nothing {
    const hasPlatforms =
      this.deploymentTargets &&
      Object.values(this.deploymentTargets).some((value) => value != null);
    const hasDestinations = this.destinations && this.destinations.length > 0;

    if (!hasPlatforms && !hasDestinations) {
      return nothing;
    }

    return html` ${this.renderPlatformTargets()} ${this.renderDestinations()} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xcode-graph-deployment-targets': GraphDeploymentTargets;
  }
}

// Register custom element with HMR support
if (!customElements.get('xcode-graph-deployment-targets')) {
  customElements.define('xcode-graph-deployment-targets', GraphDeploymentTargets);
}
