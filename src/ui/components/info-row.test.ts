/**
 * InfoRow Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphInfoRow } from './info-row';
import './info-row';

describe('graph-info-row', () => {
  it('should render with label and value', async () => {
    const el = await fixture<GraphInfoRow>(html`
      <graph-info-row label="Platform" value="iOS"></graph-info-row>
    `);

    expect(el).to.exist;
    const label = el.shadowRoot?.querySelector('.label');
    const value = el.shadowRoot?.querySelector('.value');

    expect(label?.textContent).to.equal('Platform:');
    expect(value?.textContent?.trim()).to.equal('iOS');
  });

  it('should render with default empty values', async () => {
    const el = await fixture<GraphInfoRow>(html`
      <graph-info-row></graph-info-row>
    `);

    expect(el.label).to.equal('');
    expect(el.value).to.equal('');
  });

  it('should support slotted content for value', async () => {
    const el = await fixture<GraphInfoRow>(html`
      <graph-info-row label="Status">
        <span class="custom-status">Active</span>
      </graph-info-row>
    `);

    const slot = el.shadowRoot?.querySelector('slot');
    expect(slot).to.exist;
  });

  it('should be a valid custom element', async () => {
    const el = await fixture<GraphInfoRow>(html`
      <graph-info-row label="Test"></graph-info-row>
    `);

    expect(el.tagName.toLowerCase()).to.equal('graph-info-row');
    expect(el.shadowRoot).to.exist;
  });

  it('should update when properties change', async () => {
    const el = await fixture<GraphInfoRow>(html`
      <graph-info-row label="Type" value="Framework"></graph-info-row>
    `);

    el.value = 'Library';
    await el.updateComplete;

    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.textContent?.trim()).to.equal('Library');
  });
});
