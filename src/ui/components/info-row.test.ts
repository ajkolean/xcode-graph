/**
 * InfoRow Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphInfoRow } from './info-row';
import './info-row';

describe('xcode-graph-info-row', () => {
  it('should render with label and value', async () => {
    const el = await fixture<GraphInfoRow>(html`
      <xcode-graph-info-row label="Platform" value="iOS"></xcode-graph-info-row>
    `);

    expect(el).toBeDefined();
    const label = el.shadowRoot?.querySelector('.label');
    const value = el.shadowRoot?.querySelector('.value');

    expect(label?.textContent).to.equal('Platform:');
    expect(value?.textContent?.trim()).to.equal('iOS');
  });

  it('should render with default empty values', async () => {
    const el = await fixture<GraphInfoRow>(html`
      <xcode-graph-info-row></xcode-graph-info-row>
    `);

    expect(el.label).to.equal('');
    expect(el.value).to.equal('');
  });

  it('should support slotted content for value', async () => {
    const el = await fixture<GraphInfoRow>(html`
      <xcode-graph-info-row label="Status">
        <span class="custom-status">Active</span>
      </xcode-graph-info-row>
    `);

    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).toBeDefined();
  });

  it('should update when properties change', async () => {
    const el = await fixture<GraphInfoRow>(html`
      <xcode-graph-info-row label="Type" value="Framework"></xcode-graph-info-row>
    `);

    el.value = 'Library';
    await el.updateComplete;

    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.textContent?.trim()).to.equal('Library');
  });

  it('should render label with colon even when value is empty', async () => {
    const el = await fixture<GraphInfoRow>(html`
      <xcode-graph-info-row label="Status" value=""></xcode-graph-info-row>
    `);

    const label = el.shadowRoot?.querySelector('.label');
    const value = el.shadowRoot?.querySelector('.value');
    expect(label?.textContent).to.equal('Status:');
    expect(value?.textContent?.trim()).to.equal('');
  });
});
