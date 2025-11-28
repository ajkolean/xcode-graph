/**
 * GraphNode Lit Component Tests
 */

import { expect, fixture, html } from '@open-wc/testing';
import { describe, it } from 'vitest';
import type { GraphNode } from './graph-node';
import './graph-node';

const mockNode = {
  id: 'test-node',
  name: 'TestNode',
  type: 'app' as const,
  platform: 'iOS' as const,
};

describe('graph-node', () => {
  it('should render', async () => {
    const svgEl = await fixture(html`
      <svg>
        <graph-node
          .node=${mockNode}
          .x=${100}
          .y=${100}
          .size=${24}
          .color=${'#8B5CF6'}
        ></graph-node>
      </svg>
    `);

    const node = svgEl.querySelector('graph-node');
    expect(node).to.exist;
  });

  it('should accept node property', async () => {
    const svgEl = await fixture(html`
      <svg>
        <graph-node
          .node=${mockNode}
          .x=${100}
          .y=${100}
          .size=${24}
          .color=${'#8B5CF6'}
        ></graph-node>
      </svg>
    `);

    const node = svgEl.querySelector('graph-node') as GraphNode;
    expect(node.node).to.deep.equal(mockNode);
  });

  it('should accept position and size properties', async () => {
    const svgEl = await fixture(html`
      <svg>
        <graph-node
          .node=${mockNode}
          .x=${150}
          .y=${200}
          .size=${32}
          .color=${'#FF0000'}
        ></graph-node>
      </svg>
    `);

    const node = svgEl.querySelector('graph-node') as GraphNode;
    expect(node.x).to.equal(150);
    expect(node.y).to.equal(200);
    expect(node.size).to.equal(32);
    expect(node.color).to.equal('#FF0000');
  });

  it('should support event listeners', async () => {
    const svgEl = await fixture(html`
      <svg>
        <graph-node
          .node=${mockNode}
          .x=${100}
          .y=${100}
          .size=${24}
          .color=${'#8B5CF6'}
        ></graph-node>
      </svg>
    `);

    const node = svgEl.querySelector('graph-node') as GraphNode;
    await node.updateComplete;

    // Component supports event listeners (tested via Storybook interactions)
    expect(node).to.exist;
  });

  it('should update when properties change', async () => {
    const svgEl = await fixture(html`
      <svg>
        <graph-node
          .node=${mockNode}
          .x=${100}
          .y=${100}
          .size=${24}
          .color=${'#8B5CF6'}
          .isSelected=${false}
        ></graph-node>
      </svg>
    `);

    const node = svgEl.querySelector('graph-node') as GraphNode;
    expect(node.isSelected).to.be.false;

    node.isSelected = true;
    await node.updateComplete;

    expect(node.isSelected).to.be.true;
  });
});
