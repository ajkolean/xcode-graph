/**
 * BuildSettings Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import type { BuildSettings } from '@shared/schemas/graph.types';
import { describe, it } from 'vitest';
import type { GraphBuildSettings } from './build-settings';
import './build-settings';

const fullSettings: BuildSettings = {
  swiftVersion: '5.9',
  compilationConditions: ['DEBUG', 'TESTING'],
  codeSignIdentity: 'Apple Development',
  developmentTeam: 'ABCDEF1234',
  provisioningProfile: 'MyApp Dev Profile',
};

describe('xcode-graph-build-settings', () => {
  it('should render with settings', async () => {
    const el = await fixture<GraphBuildSettings>(html`
      <xcode-graph-build-settings .settings=${fullSettings}></xcode-graph-build-settings>
    `);

    expect(el).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('xcode-graph-build-settings');
  });

  it('should render nothing when settings is undefined', async () => {
    const el = await fixture<GraphBuildSettings>(html`
      <xcode-graph-build-settings></xcode-graph-build-settings>
    `);

    const header = el.shadowRoot?.querySelector('.header');
    expect(header).to.not.exist;
  });

  it('should render nothing when settings is empty', async () => {
    const el = await fixture<GraphBuildSettings>(html`
      <xcode-graph-build-settings .settings=${{}}></xcode-graph-build-settings>
    `);

    const header = el.shadowRoot?.querySelector('.header');
    expect(header).to.not.exist;
  });

  it('should render header with title', async () => {
    const el = await fixture<GraphBuildSettings>(html`
      <xcode-graph-build-settings .settings=${fullSettings}></xcode-graph-build-settings>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.textContent?.trim()).to.equal('Build Settings');
  });

  it('should start collapsed by default', async () => {
    const el = await fixture<GraphBuildSettings>(html`
      <xcode-graph-build-settings .settings=${fullSettings}></xcode-graph-build-settings>
    `);

    const content = el.shadowRoot?.querySelector('.content');
    expect(content).to.not.exist;
  });

  it('should start expanded when expanded attribute is set', async () => {
    const el = await fixture<GraphBuildSettings>(html`
      <xcode-graph-build-settings .settings=${fullSettings} expanded></xcode-graph-build-settings>
    `);

    const content = el.shadowRoot?.querySelector('.content');
    expect(content).to.exist;
  });

  it('should toggle expansion on header click', async () => {
    const el = await fixture<GraphBuildSettings>(html`
      <xcode-graph-build-settings .settings=${fullSettings}></xcode-graph-build-settings>
    `);

    const header = el.shadowRoot?.querySelector('.header') as HTMLButtonElement;
    header.click();
    await el.updateComplete;

    const content = el.shadowRoot?.querySelector('.content');
    expect(content).to.exist;
  });

  it('should set aria-expanded on header button', async () => {
    const el = await fixture<GraphBuildSettings>(html`
      <xcode-graph-build-settings .settings=${fullSettings}></xcode-graph-build-settings>
    `);

    const header = el.shadowRoot?.querySelector('.header') as HTMLButtonElement;
    expect(header.getAttribute('aria-expanded')).to.equal('false');

    header.click();
    await el.updateComplete;
    expect(header.getAttribute('aria-expanded')).to.equal('true');
  });

  it('should show Swift version when expanded', async () => {
    const el = await fixture<GraphBuildSettings>(html`
      <xcode-graph-build-settings .settings=${fullSettings} expanded></xcode-graph-build-settings>
    `);

    const infoRows = el.shadowRoot?.querySelectorAll('xcode-graph-info-row');
    expect(infoRows?.length).to.be.greaterThan(0);
  });

  it('should show compilation conditions as badges', async () => {
    const el = await fixture<GraphBuildSettings>(html`
      <xcode-graph-build-settings .settings=${fullSettings} expanded></xcode-graph-build-settings>
    `);

    const badges = el.shadowRoot?.querySelectorAll('.condition-badge');
    expect(badges?.length).to.equal(2);
    expect(badges?.[0]?.textContent?.trim()).to.equal('DEBUG');
    expect(badges?.[1]?.textContent?.trim()).to.equal('TESTING');
  });

  it('should show code signing section when code sign settings exist', async () => {
    const el = await fixture<GraphBuildSettings>(html`
      <xcode-graph-build-settings .settings=${fullSettings} expanded></xcode-graph-build-settings>
    `);

    const codeSignSection = el.shadowRoot?.querySelector('.code-sign-section');
    expect(codeSignSection).to.exist;
  });

  it('should not show code signing section when no code sign settings', async () => {
    const settings: BuildSettings = { swiftVersion: '5.9' };
    const el = await fixture<GraphBuildSettings>(html`
      <xcode-graph-build-settings .settings=${settings} expanded></xcode-graph-build-settings>
    `);

    const codeSignSection = el.shadowRoot?.querySelector('.code-sign-section');
    expect(codeSignSection).to.not.exist;
  });
});
