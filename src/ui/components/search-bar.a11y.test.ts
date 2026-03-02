/**
 * SearchBar Accessibility Tests
 *
 * Uses vitest-axe to verify the search bar has no accessibility violations.
 */

import { fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { GraphSearchBar } from './search-bar';
import './search-bar';

describe('xcode-graph-search-bar a11y', () => {
  it('should have no accessibility violations when empty', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar></xcode-graph-search-bar>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with a search query', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar search-query="React"></xcode-graph-search-bar>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have an aria-label on the input', async () => {
    const el = await fixture<GraphSearchBar>(html`
      <xcode-graph-search-bar></xcode-graph-search-bar>
    `);

    const input = el.shadowRoot?.querySelector('input');
    expect(input).toBeDefined();
    chaiExpect(input?.getAttribute('aria-label')).to.equal('Filter nodes');
  });
});
