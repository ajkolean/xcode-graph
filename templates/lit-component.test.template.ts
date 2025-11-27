/**
 * TEMPLATE: Lit Component Test
 *
 * Use this template to create tests for Lit components.
 * Replace COMPONENT_NAME and ELEMENT_TAG with your component details.
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { COMPONENT_NAME } from './COMPONENT_NAME';
import './COMPONENT_NAME'; // Import to register custom element

describe('ELEMENT_TAG', () => {
  // ========================================
  // Rendering Tests
  // ========================================

  it('should render with default properties', async () => {
    const el = await fixture<COMPONENT_NAME>(html`
      <ELEMENT_TAG></ELEMENT_TAG>
    `);

    expect(el).to.exist;
    expect(el.tagName.toLowerCase()).to.equal('ELEMENT_TAG');
  });

  it('should render with custom properties', async () => {
    const el = await fixture<COMPONENT_NAME>(html`
      <ELEMENT_TAG
        prop1="test value"
        .prop2=${true}
        .prop3=${42}
      ></ELEMENT_TAG>
    `);

    expect(el.prop1).to.equal('test value');
    expect(el.prop2).to.be.true;
    expect(el.prop3).to.equal(42);
  });

  // ========================================
  // Shadow DOM Tests
  // ========================================

  it('should render content in shadow DOM', async () => {
    const el = await fixture<COMPONENT_NAME>(html`
      <ELEMENT_TAG prop1="Label"></ELEMENT_TAG>
    `);

    const shadowRoot = el.shadowRoot;
    expect(shadowRoot).to.exist;

    const label = shadowRoot?.querySelector('.label');
    expect(label).to.exist;
    expect(label?.textContent).to.include('Label');
  });

  // ========================================
  // Property Change Tests
  // ========================================

  it('should update when properties change', async () => {
    const el = await fixture<COMPONENT_NAME>(html`
      <ELEMENT_TAG prop1="Initial"></ELEMENT_TAG>
    `);

    const label = el.shadowRoot?.querySelector('.label');
    expect(label?.textContent).to.include('Initial');

    // Update property
    el.prop1 = 'Updated';
    await el.updateComplete;

    expect(label?.textContent).to.include('Updated');
  });

  // ========================================
  // Event Tests
  // ========================================

  it('should dispatch custom event on interaction', async () => {
    const el = await fixture<COMPONENT_NAME>(html`
      <ELEMENT_TAG></ELEMENT_TAG>
    `);

    // Set up event listener
    let eventFired = false;
    let eventDetail: any;

    el.addEventListener('component-event', ((e: CustomEvent) => {
      eventFired = true;
      eventDetail = e.detail;
    }) as EventListener);

    // Trigger interaction
    const button = el.shadowRoot?.querySelector('button');
    button?.click();
    await el.updateComplete;

    expect(eventFired).to.be.true;
    expect(eventDetail).to.exist;
  });

  // ========================================
  // Accessibility Tests
  // ========================================

  it('should be accessible', async () => {
    const el = await fixture<COMPONENT_NAME>(html`
      <ELEMENT_TAG prop1="Accessible Label"></ELEMENT_TAG>
    `);

    // Check for ARIA attributes
    expect(el.shadowRoot?.querySelector('[role]')).to.exist;
    // Add more a11y assertions as needed
  });

  // ========================================
  // State Management Tests (if using Zustand/Zag)
  // ========================================

  // it('should subscribe to store changes', async () => {
  //   const el = await fixture<COMPONENT_NAME>(html`
  //     <ELEMENT_TAG></ELEMENT_TAG>
  //   `);

  //   // Get initial value
  //   const initialValue = el.shadowRoot?.querySelector('.value')?.textContent;

  //   // Update store
  //   useGraphStore.setState({ someValue: 'new value' });
  //   await el.updateComplete;

  //   // Verify component updated
  //   const newValue = el.shadowRoot?.querySelector('.value')?.textContent;
  //   expect(newValue).to.not.equal(initialValue);
  // });

  // ========================================
  // Styling Tests
  // ========================================

  it('should apply correct styles', async () => {
    const el = await fixture<COMPONENT_NAME>(html`
      <ELEMENT_TAG highlighted></ELEMENT_TAG>
    `);

    const container = el.shadowRoot?.querySelector('.container');
    const computedStyle = window.getComputedStyle(container as Element);

    expect(computedStyle.backgroundColor).to.exist;
    expect(computedStyle.borderRadius).to.exist;
  });

  // ========================================
  // Edge Cases
  // ========================================

  it('should handle empty/missing properties gracefully', async () => {
    const el = await fixture<COMPONENT_NAME>(html`
      <ELEMENT_TAG></ELEMENT_TAG>
    `);

    expect(el).to.exist;
    // Should not throw errors
  });
});
