/**
 * NodeList Accessibility Tests
 *
 * Uses vitest-axe to verify the node list meets accessibility standards.
 */

import { fixture, html } from '@open-wc/testing';
import { NodeType, Origin, Platform } from '@shared/schemas/graph.types';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { GraphNodeList } from './node-list';
import './node-list';

const sampleItems = [
  {
    node: {
      id: 'node-1',
      name: 'MyFramework',
      type: NodeType.Framework,
      platform: Platform.iOS,
      origin: Origin.Local,
      project: 'MyProject',
    },
    edge: { source: 'root', target: 'node-1' },
  },
];

describe('xcode-graph-node-list a11y', () => {
  it('should have no accessibility violations when empty', async () => {
    const el = await fixture<GraphNodeList>(html`
      <xcode-graph-node-list
        title="Dependencies"
        .items=${[]}
        empty-message="No dependencies"
      ></xcode-graph-node-list>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with items', async () => {
    const el = await fixture<GraphNodeList>(html`
      <xcode-graph-node-list
        title="Dependencies"
        .items=${sampleItems}
        suffix="direct"
      ></xcode-graph-node-list>
    `);

    const results = await axe(el);
    expect(results).toHaveNoViolations();
  });

  it('should have aria-expanded on header button', async () => {
    const el = await fixture<GraphNodeList>(html`
      <xcode-graph-node-list
        title="Dependents"
        .items=${[]}
        empty-message="No dependents"
      ></xcode-graph-node-list>
    `);

    const button = el.shadowRoot?.querySelector('.header');
    expect(button).toBeDefined();
    expect(button?.getAttribute('aria-expanded')).to.equal('true');
  });
});
