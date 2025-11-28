/**
 * SectionHeader Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphSectionHeader } from './section-header';
import './section-header';

describe('graph-section-header', () => {
  it('should render with title', async () => {
    const el = await fixture<GraphSectionHeader>(html`
      <graph-section-header title="Dependencies"></graph-section-header>
    `);

    expect(el).to.exist;
    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.textContent).to.equal('Dependencies');
  });

  it('should render count', async () => {
    const el = await fixture<GraphSectionHeader>(html`
      <graph-section-header title="Test" count="5"></graph-section-header>
    `);

    const count = el.shadowRoot?.querySelector('.count');
    expect(count?.textContent).to.equal('5');
  });

  it('should render count with suffix', async () => {
    const el = await fixture<GraphSectionHeader>(html`
      <graph-section-header title="Test" count="3" suffix="direct"></graph-section-header>
    `);

    const count = el.shadowRoot?.querySelector('.count');
    expect(count?.textContent).to.equal('3 direct');
  });

  it('should default count to 0', async () => {
    const el = await fixture<GraphSectionHeader>(html`
      <graph-section-header title="Test"></graph-section-header>
    `);

    expect(el.count).to.equal(0);
    const count = el.shadowRoot?.querySelector('.count');
    expect(count?.textContent).to.equal('0');
  });

  it('should be a valid custom element', async () => {
    const el = await fixture<GraphSectionHeader>(html`
      <graph-section-header title="Test"></graph-section-header>
    `);

    expect(el.tagName.toLowerCase()).to.equal('graph-section-header');
    expect(el.shadowRoot).to.exist;
  });
});
