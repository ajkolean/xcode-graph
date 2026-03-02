/**
 * TagBadge Lit Component Tests
 */

import { fixture, html } from '@open-wc/testing';
import { describe, expect, it } from 'vitest';
import type { GraphTagBadge } from './tag-badge';
import './tag-badge';

describe('xcode-graph-tag-badge', () => {
  // ========================================
  // parseTag Tests (via render output)
  // ========================================

  it('should parse tag with colon separator into prefix and value', async () => {
    const el = await fixture<GraphTagBadge>(html`
      <xcode-graph-tag-badge tag="domain:infrastructure"></xcode-graph-tag-badge>
    `);

    const prefix = el.shadowRoot?.querySelector('.prefix');
    const value = el.shadowRoot?.querySelector('.value');

    expect(prefix?.textContent).to.equal('domain:');
    expect(value?.textContent).to.equal('infrastructure');
  });

  it('should parse tag without colon as value only', async () => {
    const el = await fixture<GraphTagBadge>(html`
      <xcode-graph-tag-badge tag="standalone"></xcode-graph-tag-badge>
    `);

    const prefix = el.shadowRoot?.querySelector('.prefix');
    const value = el.shadowRoot?.querySelector('.value');

    expect(prefix).toBeNull();
    expect(value?.textContent).to.equal('standalone');
  });

  it('should use known prefix color for recognized prefixes', async () => {
    const el = await fixture<GraphTagBadge>(html`
      <xcode-graph-tag-badge tag="domain:core"></xcode-graph-tag-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.tag-badge') as HTMLElement;
    expect(badge.style.getPropertyValue('--tag-color')).to.equal('#3B82F6');
  });

  it('should use default gray color for unknown prefix', async () => {
    const el = await fixture<GraphTagBadge>(html`
      <xcode-graph-tag-badge tag="unknown:something"></xcode-graph-tag-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.tag-badge') as HTMLElement;
    expect(badge.style.getPropertyValue('--tag-color')).to.equal('#6B7280');
  });

  it('should use default gray color for tag without colon', async () => {
    const el = await fixture<GraphTagBadge>(html`
      <xcode-graph-tag-badge tag="notag"></xcode-graph-tag-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.tag-badge') as HTMLElement;
    expect(badge.style.getPropertyValue('--tag-color')).to.equal('#6B7280');
  });

  it('should handle tag with multiple colons', async () => {
    const el = await fixture<GraphTagBadge>(html`
      <xcode-graph-tag-badge tag="scope:nested:value"></xcode-graph-tag-badge>
    `);

    const prefix = el.shadowRoot?.querySelector('.prefix');
    const value = el.shadowRoot?.querySelector('.value');

    expect(prefix?.textContent).to.equal('scope:');
    expect(value?.textContent).to.equal('nested:value');
  });

  // ========================================
  // Empty Tag Guard
  // ========================================

  it('should render nothing when tag is empty', async () => {
    const el = await fixture<GraphTagBadge>(html`
      <xcode-graph-tag-badge></xcode-graph-tag-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.tag-badge');
    expect(badge).toBeNull();
  });

  // ========================================
  // Interactive Class Toggle
  // ========================================

  it('should add interactive class when interactive property is set', async () => {
    const el = await fixture<GraphTagBadge>(html`
      <xcode-graph-tag-badge tag="layer:feature" interactive></xcode-graph-tag-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.tag-badge');
    expect(badge?.classList.contains('interactive')).toBe(true);
  });

  it('should not have interactive class by default', async () => {
    const el = await fixture<GraphTagBadge>(html`
      <xcode-graph-tag-badge tag="layer:feature"></xcode-graph-tag-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.tag-badge');
    expect(badge?.classList.contains('interactive')).toBe(false);
  });
});
