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

    const rows = el.shadowRoot?.querySelectorAll('graph-info-row');
    expect(rows?.[0]?.getAttribute('value')).to.equal('iOS');
  });

  it('should render origin as "Local Project" for local nodes', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <graph-node-info .node=${mockNode}></graph-node-info>
    `);

    const rows = el.shadowRoot?.querySelectorAll('graph-info-row');
    expect(rows?.[1]?.getAttribute('value')).to.equal('Local Project');
  });

  it('should render origin as "External Package" for external nodes', async () => {
    const externalNode = { ...mockNode, origin: 'external' as const };
    const el = await fixture<GraphNodeInfo>(html`
      <graph-node-info .node=${externalNode}></graph-node-info>
    `);

    const rows = el.shadowRoot?.querySelectorAll('graph-info-row');
    expect(rows?.[1]?.getAttribute('value')).to.equal('External Package');
  });

  it('should render node type', async () => {
    const el = await fixture<GraphNodeInfo>(html`
      <graph-node-info .node=${mockNode}></graph-node-info>
    `);

    const rows = el.shadowRoot?.querySelectorAll('graph-info-row');
    // getNodeTypeLabel should return proper label
    expect(rows?.[2]?.getAttribute('value')).to.exist;
  });
});
