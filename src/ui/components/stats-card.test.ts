/**
 * StatsCard Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphStatsCard } from './stats-card';
import './stats-card';

describe('xcode-graph-stats-card', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  it('should render with custom properties', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card
        label="Total Nodes"
        value="42"
      ></xcode-graph-stats-card>
    `);

    expect(el.label).to.equal('Total Nodes');
    expect(el.value).to.equal('42');
    // Boolean attributes default to undefined/falsy when not set
    expect(el.highlighted).not.toBe(true);
  });

  it('should accept number value', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card
        label="Count"
        .value=${123}
      ></xcode-graph-stats-card>
    `);

    expect(el.value).to.equal(123);
  });

  it('should accept highlighted property', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card
        label="Highlighted"
        value="100"
        highlighted
      ></xcode-graph-stats-card>
    `);

    expect(el.highlighted).toBe(true);
  });

  // ========================================
  // Highlighted Tests
  // ========================================

  it('should apply highlighted class when highlighted prop is true', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card label="Test" value="42" highlighted></xcode-graph-stats-card>
    `);

    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.classList.contains('highlighted')).toBe(true);
  });

  it('should not apply highlighted class when highlighted prop is false', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card label="Test" value="42"></xcode-graph-stats-card>
    `);

    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.classList.contains('highlighted')).toBe(false);
  });

  // ========================================
  // Property Change Tests
  // ========================================

  it('should update label when property changes', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card label="Initial" value="1"></xcode-graph-stats-card>
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
      <xcode-graph-stats-card label="Count" value="1"></xcode-graph-stats-card>
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
      <xcode-graph-stats-card label="Test" value="1"></xcode-graph-stats-card>
    `);

    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.classList.contains('highlighted')).toBe(false);

    // Update property
    el.highlighted = true;
    await el.updateComplete;

    expect(value?.classList.contains('highlighted')).toBe(true);
  });

  // ========================================
  // Edge Cases
  // ========================================

  it('should handle empty label gracefully', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card value="42"></xcode-graph-stats-card>
    `);

    expect(el).toBeDefined();
    const label = el.shadowRoot?.querySelector('.label');
    expect(label?.textContent).to.equal('');
  });

  it('should handle empty value gracefully', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card label="Count"></xcode-graph-stats-card>
    `);

    expect(el).toBeDefined();
    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.textContent?.trim()).to.equal('');
  });

  it('should dispatch card-toggle when toggleable card is clicked', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card label="Test" value="1" toggleable></xcode-graph-stats-card>
    `);

    let fired = false;
    el.addEventListener('card-toggle', () => {
      fired = true;
    });

    const container = el.shadowRoot?.querySelector('.container') as HTMLElement;
    container.click();
    expect(fired).toBe(true);
  });

  it('should not dispatch card-toggle when non-toggleable card is clicked', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card label="Test" value="1"></xcode-graph-stats-card>
    `);

    let fired = false;
    el.addEventListener('card-toggle', () => {
      fired = true;
    });

    const container = el.shadowRoot?.querySelector('.container') as HTMLElement;
    container.click();
    expect(fired).toBe(false);
  });

  it('should apply toggleable and active classes', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card label="Test" value="1" toggleable active></xcode-graph-stats-card>
    `);

    const container = el.shadowRoot?.querySelector('.container') as HTMLElement;
    expect(container.classList.contains('toggleable')).toBe(true);
    expect(container.classList.contains('active')).toBe(true);
  });

  it('should handle zero value', async () => {
    const el = await fixture<GraphStatsCard>(html`
      <xcode-graph-stats-card label="Count" .value=${0}></xcode-graph-stats-card>
    `);

    const value = el.shadowRoot?.querySelector('.value');
    expect(value?.textContent?.trim()).to.equal('0');
  });
});
