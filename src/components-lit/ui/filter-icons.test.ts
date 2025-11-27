/**
 * FilterIcons Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type {
  GraphProductTypesIcon,
  GraphPlatformsIcon,
  GraphProjectsIcon,
  GraphPackagesIcon,
} from './filter-icons';
import './filter-icons';

describe('graph-product-types-icon', () => {
  it('should render', async () => {
    const el = await fixture<GraphProductTypesIcon>(html`
      <graph-product-types-icon></graph-product-types-icon>
    `);

    expect(el).to.exist;
    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg).to.exist;
  });
});

describe('graph-platforms-icon', () => {
  it('should render', async () => {
    const el = await fixture<GraphPlatformsIcon>(html`
      <graph-platforms-icon></graph-platforms-icon>
    `);

    expect(el).to.exist;
    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg).to.exist;
  });
});

describe('graph-projects-icon', () => {
  it('should render', async () => {
    const el = await fixture<GraphProjectsIcon>(html`
      <graph-projects-icon></graph-projects-icon>
    `);

    expect(el).to.exist;
    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg).to.exist;
  });
});

describe('graph-packages-icon', () => {
  it('should render', async () => {
    const el = await fixture<GraphPackagesIcon>(html`
      <graph-packages-icon></graph-packages-icon>
    `);

    expect(el).to.exist;
    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg).to.exist;
  });
});
