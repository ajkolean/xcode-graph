/**
 * PanelHeader Lit Component Tests
 */

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphPanelHeader } from './panel-header';
import './panel-header';

describe('xcode-graph-panel-header', () => {
  it('should render title', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header title="My Title"></xcode-graph-panel-header>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.textContent).to.equal('My Title');
  });

  it('should render subtitle when provided', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header title="Title" subtitle="Subtitle"></xcode-graph-panel-header>
    `);

    const subtitle = el.shadowRoot?.querySelector('.subtitle');
    expect(subtitle?.textContent).to.equal('Subtitle');
  });

  it('should not render subtitle when not provided', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header title="Title"></xcode-graph-panel-header>
    `);

    const subtitle = el.shadowRoot?.querySelector('.subtitle');
    expect(subtitle).to.not.exist;
  });

  it('should default to lg title size', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header title="Test"></xcode-graph-panel-header>
    `);

    expect(el.titleSize).to.equal('lg');
  });

  it('should apply md title size class', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header title="Test" title-size="md"></xcode-graph-panel-header>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.classList.contains('size-md')).to.be.true;
  });

  it('should apply color to icon box', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header title="Test" color="#FF0000"></xcode-graph-panel-header>
    `);

    const iconBox = el.shadowRoot?.querySelector('.icon-box') as HTMLElement;
    const style = iconBox.getAttribute('style');
    expect(style).to.include('#FF0000');
  });

  it('should use default color when not provided', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header title="Test"></xcode-graph-panel-header>
    `);

    const iconBox = el.shadowRoot?.querySelector('.icon-box') as HTMLElement;
    const style = iconBox.getAttribute('style');
    // Default color is #8B5CF6
    expect(style).to.include('#8B5CF6');
  });

  it('should dispatch back event on button click', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header title="Test"></xcode-graph-panel-header>
    `);

    const button = el.shadowRoot?.querySelector('.back-button') as HTMLButtonElement;
    setTimeout(() => button.click());
    const event = await oneEvent(el, 'back');

    expect(event).to.exist;
  });

  it('should render icon slot content', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header title="Test">
        <span slot="icon" id="test-icon">Icon</span>
      </xcode-graph-panel-header>
    `);

    const iconSlot = el.shadowRoot?.querySelector('slot[name="icon"]') as HTMLSlotElement;
    const assignedNodes = iconSlot.assignedElements();
    expect(assignedNodes.length).to.equal(1);
    const firstAssigned = assignedNodes[0];
    expect(firstAssigned?.id).to.equal('test-icon');
  });

  it('should render badges slot content', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <xcode-graph-panel-header title="Test">
        <span slot="badges" id="test-badge">Badge</span>
      </xcode-graph-panel-header>
    `);

    const badgesSlot = el.shadowRoot?.querySelector('slot[name="badges"]') as HTMLSlotElement;
    const assignedNodes = badgesSlot.assignedElements();
    expect(assignedNodes.length).to.equal(1);
    const firstAssigned = assignedNodes[0];
    expect(firstAssigned?.id).to.equal('test-badge');
  });
});
