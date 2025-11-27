/**
 * NodeInfo Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphNodeInfo } from './node-info';
import './node-info';

const mockNode = {
  id: 'test-node',
  name: 'TestNode',
  type: 'app' as const,
  platform: 'iOS' as const,
  origin: 'local' as const,
};

describe('graph-node-info', () => {
  it('should render', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <graph-node-info .node=${mockNode}></graph-node-info>
    `);

    expect(el).to.exist;
  });

  it('should render title', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <graph-node-info .node=${mockNode}></graph-node-info>
    `);

    const title = el.shadowRoot?.querySelector('.title');
    expect(title?.textContent).to.equal('Node Info');
  });

  it('should render platform', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <graph-node-info .node=${mockNode}></graph-node-info>
    `);

    const values = el.shadowRoot?.querySelectorAll('.info-value');
    expect(values?.[0]?.textContent).to.equal('iOS');
  });

  it('should render origin as "Local Project" for local nodes', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <graph-node-info .node=${mockNode}></graph-node-info>
    `);

    const values = el.shadowRoot?.querySelectorAll('.info-value');
    expect(values?.[1]?.textContent).to.equal('Local Project');
  });

  it('should render origin as "External Package" for external nodes', async () => {
    const externalNode = { ...mockNode, origin: 'external' as const };
    const el = await fixture<GraphNodeInfo>(html`
      <graph-node-info .node=${externalNode}></graph-node-info>
    `);

    const values = el.shadowRoot?.querySelectorAll('.info-value');
    expect(values?.[1]?.textContent).to.equal('External Package');
  });

  it('should render node type', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <graph-node-info .node=${mockNode}></graph-node-info>
    `);

    const values = el.shadowRoot?.querySelectorAll('.info-value');
    // getNodeTypeLabel should return proper label
    expect(values?.[2]?.textContent).to.exist;
  });
});
