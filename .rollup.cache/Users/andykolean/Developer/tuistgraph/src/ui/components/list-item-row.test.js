/**
 * ListItemRow Lit Component Tests
 */
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { describe, it } from 'vitest';
import './list-item-row';
const mockNode = {
    id: 'test-node',
    name: 'TestNode',
    type: 'app',
    platform: 'iOS',
};
describe('xcode-graph-list-item-row', () => {
    it('should render node name', async () => {
        const el = await fixture(html `
      <xcode-graph-list-item-row .node=${mockNode}></xcode-graph-list-item-row>
    `);
        const name = el.shadowRoot?.querySelector('.name');
        expect(name?.textContent).to.equal('TestNode');
    });
    it('should render subtitle when provided', async () => {
        const el = await fixture(html `
      <xcode-graph-list-item-row
        .node=${mockNode}
        subtitle="Framework"
      ></xcode-graph-list-item-row>
    `);
        const subtitle = el.shadowRoot?.querySelector('.subtitle');
        expect(subtitle).to.exist;
        expect(subtitle?.textContent).to.equal('Framework');
    });
    it('should not render subtitle when not provided', async () => {
        const el = await fixture(html `
      <xcode-graph-list-item-row .node=${mockNode}></xcode-graph-list-item-row>
    `);
        const subtitle = el.shadowRoot?.querySelector('.subtitle');
        expect(subtitle).to.not.exist;
    });
    it('should apply selected class when isSelected is true', async () => {
        const el = await fixture(html `
      <xcode-graph-list-item-row
        .node=${mockNode}
        is-selected
      ></xcode-graph-list-item-row>
    `);
        const button = el.shadowRoot?.querySelector('button');
        expect(button?.classList.contains('selected')).to.be.true;
    });
    it('should dispatch row-select event on click', async () => {
        const el = await fixture(html `
      <xcode-graph-list-item-row .node=${mockNode}></xcode-graph-list-item-row>
    `);
        const button = el.shadowRoot?.querySelector('button');
        setTimeout(() => button.click());
        const event = (await oneEvent(el, 'row-select'));
        expect(event).to.exist;
        expect(event.detail.node).to.deep.equal(mockNode);
    });
    it('should dispatch row-hover event on mouse enter', async () => {
        const el = await fixture(html `
      <xcode-graph-list-item-row .node=${mockNode}></xcode-graph-list-item-row>
    `);
        const button = el.shadowRoot?.querySelector('button');
        setTimeout(() => button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true })));
        const event = (await oneEvent(el, 'row-hover'));
        expect(event).to.exist;
        expect(event.detail.nodeId).to.equal('test-node');
    });
    it('should dispatch row-hover-end event on mouse leave', async () => {
        const el = await fixture(html `
      <xcode-graph-list-item-row .node=${mockNode}></xcode-graph-list-item-row>
    `);
        const button = el.shadowRoot?.querySelector('button');
        setTimeout(() => button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true })));
        const event = await oneEvent(el, 'row-hover-end');
        expect(event).to.exist;
    });
});
//# sourceMappingURL=list-item-row.test.js.map