/**
 * PanelHeader Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphPanelHeader } from './panel-header';
import './panel-header';

describe('graph-panel-header', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  it('should render with required properties', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Test Title"></graph-panel-header>
    `);

    expect(el).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('graph-panel-header');
  });

  it('should render title', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="My Title"></graph-panel-header>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.textContent).to.equal('My Title');
  });

  it('should render subtitle when provided', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Title" subtitle="Subtitle"></graph-panel-header>
    `);

    const subtitle = el.shadowRoot?.querySelector('.subtitle');
    expect(subtitle?.textContent).to.equal('Subtitle');
  });

  it('should not render subtitle when not provided', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Title"></graph-panel-header>
    `);

    const subtitle = el.shadowRoot?.querySelector('.subtitle');
    expect(subtitle).to.not.exist;
  });

  // ========================================
  // Property Tests
  // ========================================

  it('should default to lg title size', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Test"></graph-panel-header>
    `);

    expect(el.titleSize).to.equal('lg');
  });

  it('should apply lg title size class', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Test" title-size="lg"></graph-panel-header>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.classList.contains('size-lg')).to.be.true;
  });

  it('should apply md title size class', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Test" title-size="md"></graph-panel-header>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.classList.contains('size-md')).to.be.true;
  });

  // ========================================
  // Color Styling Tests
  // ========================================

  it('should apply color to icon box', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Test" color="#FF0000"></graph-panel-header>
    `);

    const iconBox = el.shadowRoot?.querySelector('.icon-box') as HTMLElement;
    const style = iconBox.getAttribute('style');
    expect(style).to.include('#FF0000');
  });

  it('should use default color when not provided', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Test"></graph-panel-header>
    `);

    const iconBox = el.shadowRoot?.querySelector('.icon-box') as HTMLElement;
    const style = iconBox.getAttribute('style');
    // Default color is #8B5CF6
    expect(style).to.include('#8B5CF6');
  });

  // ========================================
  // Event Tests
  // ========================================

  it('should dispatch back event on button click', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Test"></graph-panel-header>
    `);

    let eventFired = false;
    el.addEventListener('back', () => {
      eventFired = true;
    });

    const button = el.shadowRoot?.querySelector('.back-button') as HTMLButtonElement;
    button.click();

    expect(eventFired).to.be.true;
  });

  // ========================================
  // Slot Tests
  // ========================================

  it('should render icon slot content', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Test">
        <span slot="icon" id="test-icon">Icon</span>
      </graph-panel-header>
    `);

    const iconSlot = el.shadowRoot?.querySelector('slot[name="icon"]') as HTMLSlotElement;
    const assignedNodes = iconSlot.assignedElements();
    expect(assignedNodes.length).to.equal(1);
    expect(assignedNodes[0].id).to.equal('test-icon');
  });

  it('should render badges slot content', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Test">
        <span slot="badges" id="test-badge">Badge</span>
      </graph-panel-header>
    `);

    const badgesSlot = el.shadowRoot?.querySelector('slot[name="badges"]') as HTMLSlotElement;
    const assignedNodes = badgesSlot.assignedElements();
    expect(assignedNodes.length).to.equal(1);
    expect(assignedNodes[0].id).to.equal('test-badge');
  });

  // ========================================
  // Shadow DOM Structure Tests
  // ========================================

  it('should have back button', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Test"></graph-panel-header>
    `);

    const button = el.shadowRoot?.querySelector('.back-button');
    expect(button).to.exist;
  });

  it('should have icon box', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Test"></graph-panel-header>
    `);

    const iconBox = el.shadowRoot?.querySelector('.icon-box');
    expect(iconBox).to.exist;
  });

  it('should have badges container', async () => {
    const el = await fixture<GraphPanelHeader>(html`
      <graph-panel-header title="Test"></graph-panel-header>
    `);

    const badges = el.shadowRoot?.querySelector('.badges');
    expect(badges).to.exist;
  });
});
