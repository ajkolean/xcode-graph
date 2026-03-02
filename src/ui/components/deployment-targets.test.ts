/**
 * DeploymentTargets Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphDeploymentTargets } from './deployment-targets';
import './deployment-targets';

describe('xcode-graph-deployment-targets', () => {
  it('should render nothing when no targets or destinations', async () => {
    const el = await fixture<GraphDeploymentTargets>(html`
      <xcode-graph-deployment-targets></xcode-graph-deployment-targets>
    `);

    const sections = el.shadowRoot?.querySelectorAll('.section');
    expect(sections?.length ?? 0).to.equal(0);
  });

  it('should render nothing when deploymentTargets has only null values', async () => {
    const el = await fixture<GraphDeploymentTargets>(html`
      <xcode-graph-deployment-targets
        .deploymentTargets=${{ iOS: undefined, macOS: undefined }}
      ></xcode-graph-deployment-targets>
    `);

    const sections = el.shadowRoot?.querySelectorAll('.section');
    expect(sections?.length ?? 0).to.equal(0);
  });

  it('should render nothing when destinations is empty array', async () => {
    const el = await fixture<GraphDeploymentTargets>(html`
      <xcode-graph-deployment-targets
        .destinations=${[]}
      ></xcode-graph-deployment-targets>
    `);

    const sections = el.shadowRoot?.querySelectorAll('.section');
    expect(sections?.length ?? 0).to.equal(0);
  });

  it('should render platform targets with versions', async () => {
    const el = await fixture<GraphDeploymentTargets>(html`
      <xcode-graph-deployment-targets
        .deploymentTargets=${{ iOS: '14.0', macOS: '12.0' }}
      ></xcode-graph-deployment-targets>
    `);

    const badges = el.shadowRoot?.querySelectorAll('.platform-badge');
    expect(badges?.length).to.equal(2);

    const names = el.shadowRoot?.querySelectorAll('.platform-name');
    const versions = el.shadowRoot?.querySelectorAll('.platform-version');

    expect(names?.[0]?.textContent).to.equal('iOS');
    expect(versions?.[0]?.textContent).to.equal('14.0+');
    expect(names?.[1]?.textContent).to.equal('macOS');
    expect(versions?.[1]?.textContent).to.equal('12.0+');
  });

  it('should filter out null version entries from platform targets', async () => {
    const el = await fixture<GraphDeploymentTargets>(html`
      <xcode-graph-deployment-targets
        .deploymentTargets=${{ iOS: '14.0', macOS: null, tvOS: '15.0' }}
      ></xcode-graph-deployment-targets>
    `);

    const badges = el.shadowRoot?.querySelectorAll('.platform-badge');
    expect(badges?.length).to.equal(2);
  });

  it('should render destination badges', async () => {
    const el = await fixture<GraphDeploymentTargets>(html`
      <xcode-graph-deployment-targets
        .destinations=${['iPhone', 'iPad']}
      ></xcode-graph-deployment-targets>
    `);

    const badges = el.shadowRoot?.querySelectorAll('xcode-graph-badge');
    expect(badges?.length).to.equal(2);
  });

  it('should use fallback label and color for unknown destination', async () => {
    const el = await fixture<GraphDeploymentTargets>(html`
      <xcode-graph-deployment-targets
        .destinations=${['unknownDevice']}
      ></xcode-graph-deployment-targets>
    `);

    const badge = el.shadowRoot?.querySelector('xcode-graph-badge');
    expect(badge).toBeDefined();
    expect(badge?.getAttribute('label')).to.equal('unknownDevice');
    expect(badge?.getAttribute('color')).to.equal('#8E8E93');
  });

  it('should show section titles in non-compact mode', async () => {
    const el = await fixture<GraphDeploymentTargets>(html`
      <xcode-graph-deployment-targets
        .deploymentTargets=${{ iOS: '14.0' }}
        .destinations=${['iPhone']}
      ></xcode-graph-deployment-targets>
    `);

    const titles = el.shadowRoot?.querySelectorAll('.section-title');
    expect(titles?.length).to.equal(2);
  });

  it('should hide section titles in compact mode', async () => {
    const el = await fixture<GraphDeploymentTargets>(html`
      <xcode-graph-deployment-targets
        compact
        .deploymentTargets=${{ iOS: '14.0' }}
        .destinations=${['iPhone']}
      ></xcode-graph-deployment-targets>
    `);

    // In compact mode, section titles are not rendered (when() returns nothing)
    const titles = el.shadowRoot?.querySelectorAll('.section-title');
    expect(titles?.length ?? 0).to.equal(0);
  });
});
