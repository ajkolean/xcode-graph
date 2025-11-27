/**
 * StatsCard Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphStatsCard } from './stats-card';
import './stats-card';

describe('graph-stats-card', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  it('should render with default properties', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card></graph-stats-card>
    `);

    expect(el).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('graph-stats-card');
  });

  it('should render with custom properties', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card
        label="Total Nodes"
        value="42"
      ></graph-stats-card>
    `);

    expect(el.label).to.equal('Total Nodes');
    expect(el.value).to.equal('42');
    // Boolean attributes default to undefined/falsy when not set
    expect(el.highlighted).to.not.be.true;
  });

  it('should accept number value', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card
        label="Count"
        .value=${123}
      ></graph-stats-card>
    `);

    expect(el.value).to.equal(123);
  });

  it('should accept highlighted property', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card
        label="Highlighted"
        value="100"
        highlighted
      ></graph-stats-card>
    `);

    expect(el.highlighted).to.be.true;
  });

  // ========================================
  // Shadow DOM Tests
  // ========================================

  it('should render label in shadow DOM', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card label="Test Label" value="42"></graph-stats-card>
    `);

    const shadowRoot = el.shadowRoot;
    expect(shadowRoot).to.exist;

    const label = shadowRoot?.querySelector('.label');
    expect(label).to.exist;
    expect(label?.textContent).to.equal('Test Label');
  });

  it('should render value in shadow DOM', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card label="Count" value="999"></graph-stats-card>
    `);

    const value = el.shadowRoot?.querySelector('.value');
    expect(value).to.exist;
    expect(value?.textContent?.trim()).to.equal('999');
  });

  it('should apply highlighted class when highlighted prop is true', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card label="Test" value="42" highlighted></graph-stats-card>
    `);

    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.classList.contains('highlighted')).to.be.true;
  });

  it('should not apply highlighted class when highlighted prop is false', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card label="Test" value="42"></graph-stats-card>
    `);

    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.classList.contains('highlighted')).to.be.false;
  });

  // ========================================
  // Property Change Tests
  // ========================================

  it('should update label when property changes', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card label="Initial" value="1"></graph-stats-card>
    `);

    const label = el.shadowRoot?.querySelector('.label');
    expect(label?.textContent).to.equal('Initial');

    // Update property
    el.label = 'Updated';
    await el.updateComplete;

    expect(label?.textContent).to.equal('Updated');
  });

  it('should update value when property changes', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card label="Count" value="1"></graph-stats-card>
    `);

    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.textContent?.trim()).to.equal('1');

    // Update property
    el.value = '42';
    await el.updateComplete;

    expect(value?.textContent?.trim()).to.equal('42');
  });

  it('should update highlighted state when property changes', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card label="Test" value="1"></graph-stats-card>
    `);

    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.classList.contains('highlighted')).to.be.false;

    // Update property
    el.highlighted = true;
    await el.updateComplete;

    expect(value?.classList.contains('highlighted')).to.be.true;
  });

  // ========================================
  // Styling Tests
  // ========================================

  it('should apply correct container styles', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card label="Test" value="42"></graph-stats-card>
    `);

    const container = el.shadowRoot?.querySelector('.container') as HTMLElement;
    expect(container).to.exist;

    const computedStyle = window.getComputedStyle(container);
    expect(computedStyle.borderRadius).to.exist;
    expect(computedStyle.padding).to.exist;
  });

  // ========================================
  // Edge Cases
  // ========================================

  it('should handle empty label gracefully', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card value="42"></graph-stats-card>
    `);

    expect(el).to.exist;
    const label = el.shadowRoot?.querySelector('.label');
    expect(label?.textContent).to.equal('');
  });

  it('should handle empty value gracefully', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card label="Count"></graph-stats-card>
    `);

    expect(el).to.exist;
    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.textContent?.trim()).to.equal('');
  });

  it('should handle zero value', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <graph-stats-card label="Count" .value=${0}></graph-stats-card>
    `);

    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.textContent?.trim()).to.equal('0');
  });
});
