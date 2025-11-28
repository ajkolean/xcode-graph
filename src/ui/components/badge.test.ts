/**
 * Badge Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphBadge } from './badge';
import './badge';

describe('graph-badge', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  it('should render with default properties', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test"></graph-badge>
    `);

    expect(el).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('graph-badge');
  });

  it('should render label text', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Package"></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.textContent?.trim()).to.equal('Package');
  });

  // ========================================
  // Property Tests
  // ========================================

  it('should accept label property', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Framework"></graph-badge>
    `);

    expect(el.label).to.equal('Framework');
  });

  it('should accept color property', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test" color="#FF0000"></graph-badge>
    `);

    expect(el.color).to.equal('#FF0000');
  });

  it('should default to pill variant', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test"></graph-badge>
    `);

    expect(el.variant).to.equal('pill');
  });

  it('should default to md size', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test"></graph-badge>
    `);

    expect(el.size).to.equal('md');
  });

  // ========================================
  // Variant Tests
  // ========================================

  it('should apply pill variant class', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test" variant="pill"></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('variant-pill')).to.be.true;
  });

  it('should apply rounded variant class', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test" variant="rounded"></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('variant-rounded')).to.be.true;
  });

  it('should apply accent variant class', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test" variant="accent"></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('variant-accent')).to.be.true;
  });

  // ========================================
  // Size Tests
  // ========================================

  it('should apply sm size class', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test" size="sm"></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('size-sm')).to.be.true;
  });

  it('should apply md size class', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test" size="md"></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('size-md')).to.be.true;
  });

  // ========================================
  // Interactive & Glow Tests
  // ========================================

  it('should apply interactive class when interactive is true', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test" interactive></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('interactive')).to.be.true;
  });

  it('should not apply interactive class when interactive is false', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test"></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('interactive')).to.be.false;
  });

  it('should apply glow class when glow is true', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test" glow></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('glow')).to.be.true;
  });

  // ========================================
  // Dynamic Styling Tests
  // ========================================

  it('should apply color via CSS custom properties', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test" color="#8B5CF6"></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge') as HTMLElement;
    const style = badge.getAttribute('style');

    expect(style).to.include('--badge-color: #8B5CF6');
    expect(style).to.include('--badge-bg: #8B5CF620');
    expect(style).to.include('--badge-border: #8B5CF640');
  });

  it('should use default color when not provided', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test"></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge') as HTMLElement;
    const style = badge.getAttribute('style');

    // Default color is #8B5CF6
    expect(style).to.include('--badge-color: #8B5CF6');
  });

  it('should update styles when color changes', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test" color="#FF0000"></graph-badge>
    `);

    let badge = el.shadowRoot?.querySelector('.badge') as HTMLElement;
    expect(badge.getAttribute('style')).to.include('#FF0000');

    el.color = '#00FF00';
    await el.updateComplete;

    badge = el.shadowRoot?.querySelector('.badge') as HTMLElement;
    expect(badge.getAttribute('style')).to.include('#00FF00');
  });

  // ========================================
  // Combined Configuration Tests
  // ========================================

  it('should support all options combined', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge
        label="Package"
        color="#10B981"
        variant="accent"
        size="sm"
        interactive
        glow
      ></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.textContent?.trim()).to.equal('Package');
    expect(badge?.classList.contains('variant-accent')).to.be.true;
    expect(badge?.classList.contains('size-sm')).to.be.true;
    expect(badge?.classList.contains('interactive')).to.be.true;
    expect(badge?.classList.contains('glow')).to.be.true;
  });

  // ========================================
  // Edge Cases
  // ========================================

  it('should handle different color formats', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label="Test" color="rgb(255, 0, 0)"></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge') as HTMLElement;
    expect(badge.getAttribute('style')).to.include('rgb(255, 0, 0)');
  });

  it('should handle empty label', async () => {
    const el = await fixture<GraphBadge>(html`
      <graph-badge label=""></graph-badge>
    `);

    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.textContent?.trim()).to.equal('');
  });
});
